import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { verifyAuth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/apiResponse";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * GET /api/subscribers
 * List newsletter subscribers (admin/manager only).
 * Query: page, limit, status
 */
export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }
        if (user.role !== "admin" && user.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit")) || 20));
        const status = searchParams.get("status") || "subscribed";

        const query = {};
        if (status && status !== "all") {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const [subscribers, total] = await Promise.all([
            Subscriber.find(query).sort({ subscribedAt: -1 }).skip(skip).limit(limit).lean(),
            Subscriber.countDocuments(query),
        ]);

        const pages = Math.ceil(total / limit) || 1;
        return successResponse({
            subscribers,
            pagination: {
                page,
                limit,
                total,
                pages,
            },
        });
    } catch (error) {
        console.error("GET /api/subscribers error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * POST /api/subscribers
 * Subscribe to newsletter (public, no auth).
 * Body: { email, source? }
 */
export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const email = (body.email || "").trim().toLowerCase();
        let source = (body.source || "homepage").toLowerCase();

        if (!email) {
            return errorResponse("Email is required", 400);
        }
        if (!EMAIL_REGEX.test(email)) {
            return errorResponse("Please provide a valid email address", 400);
        }
        if (!["homepage", "footer"].includes(source)) {
            source = "homepage";
        }

        await dbConnect();

        const existing = await Subscriber.findOne({ email });

        if (existing) {
            if (existing.status === "subscribed") {
                return successResponse({ message: "Thanks for subscribing!" });
            }
            existing.status = "subscribed";
            existing.unsubscribedAt = null;
            existing.source = source;
            existing.subscribedAt = new Date();
            await existing.save();
            return successResponse({ message: "Thanks for subscribing!" });
        }

        await Subscriber.create({
            email,
            status: "subscribed",
            source,
            subscribedAt: new Date(),
        });

        return successResponse({ message: "Thanks for subscribing!" });
    } catch (error) {
        if (error.code === 11000) {
            return successResponse({ message: "Thanks for subscribing!" });
        }
        console.error("POST /api/subscribers error:", error);
        return errorResponse(error.message || "Failed to subscribe", 500);
    }
}
