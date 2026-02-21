import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { errorResponse, successResponse } from "@/lib/apiResponse";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * POST /api/subscribers/unsubscribe
 * Unsubscribe from newsletter (public, no auth).
 * Body: { email }
 */
export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const email = (body.email || "").trim().toLowerCase();

        if (!email) {
            return errorResponse("Email is required", 400);
        }
        if (!EMAIL_REGEX.test(email)) {
            return errorResponse("Invalid email address", 400);
        }

        await dbConnect();

        const sub = await Subscriber.findOne({ email });
        if (!sub) {
            return successResponse({ message: "Email not found in our list." });
        }
        if (sub.status === "unsubscribed") {
            return successResponse({ message: "Already unsubscribed." });
        }

        sub.status = "unsubscribed";
        sub.unsubscribedAt = new Date();
        await sub.save();

        return successResponse({ message: "You have been unsubscribed." });
    } catch (error) {
        console.error("POST /api/subscribers/unsubscribe error:", error);
        return errorResponse(error.message || "Failed to unsubscribe", 500);
    }
}
