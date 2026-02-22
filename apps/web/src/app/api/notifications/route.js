import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Subscriber from "@/models/Subscriber";
import User from "@/models/User";
import { sendMail } from "@/lib/mail";
import { buildMarketingHtml } from "@/lib/marketingEmail";
import { sendBulkNotification } from "@/lib/notifications";

/**
 * GET /api/notifications
 * List user's notifications with pagination and optional read filter.
 * Query: page, limit, read (true|false to filter; omit for all)
 */
export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 100);
        const readParam = searchParams.get("read");
        const read = readParam === "true" ? true : readParam === "false" ? false : null;

        const result = await Notification.getUserNotifications(user._id, {
            page,
            limit,
            read,
        });

        return NextResponse.json({
            success: true,
            data: result.notifications,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("GET /api/notifications error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * POST /api/notifications
 * Send notification/campaign (admin/manager only).
 * Supports: recipientType (all | role | single), marketing emails.
 */
export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }
        if (user.role !== "admin" && user.role !== "manager") {
            return errorResponse("Forbidden", 403);
        }

        const body = await req.json().catch(() => ({}));
        const {
            recipientType,
            recipients,
            title,
            message,
            subject,
            type = "info",
            email = false,
            actionLabel,
            actionUrl,
            // Marketing fields
            headline,
            content,
            preheader,
            ctaText,
            ctaUrl,
            templateType,
        } = body;

        if (!recipientType) {
            return errorResponse("recipientType is required", 400);
        }

        await dbConnect();

        const isMarketing = type === "marketing";

        // --- Marketing (email-only to subscribers/users): keep existing flow ---
        if (isMarketing) {
            let recipientEmails = [];
            if (recipientType === "all") {
                const subscribers = await Subscriber.find({ status: "subscribed" })
                    .select("email")
                    .lean();
                recipientEmails = subscribers.map((s) => s.email);
            } else if (recipientType === "role") {
                const users = await User.find({
                    role: recipients,
                    status: "active",
                })
                    .select("email")
                    .lean();
                recipientEmails = users.filter((u) => u.email).map((u) => u.email);
            } else if (recipientType === "single") {
                const u = await User.findById(recipients).select("email").lean();
                if (u?.email) recipientEmails = [u.email];
            } else {
                return errorResponse("Invalid recipientType for marketing", 400);
            }

            if (recipientEmails.length === 0) {
                return successResponse({
                    sent: 0,
                    message:
                        recipientType === "all"
                            ? "No subscribers found"
                            : "No matching recipients found",
                });
            }

            const subj = subject || title || "Notification";
            const bodyContent = content || message || "";
            let sent = 0;
            for (const to of recipientEmails) {
                const marketingHtml = buildMarketingHtml({
                    subject: subj,
                    preheader: preheader || "",
                    headline: headline || title || subj,
                    content: bodyContent,
                    ctaText: ctaText || actionLabel,
                    ctaUrl: actionUrl || ctaUrl,
                    templateType: templateType || "newsletter",
                    recipientEmail: to,
                });
                const result = await sendMail({
                    to,
                    subject: subj,
                    html: marketingHtml,
                    fromType: "INFO",
                });
                if (result.success) sent++;
            }
            return successResponse({
                sent,
                total: recipientEmails.length,
                message: `Sent to ${sent}/${recipientEmails.length} recipients`,
            });
        }

        // --- Regular notifications: in-app (DB) + optional push + optional email ---
        let recipientIds = [];
        if (recipientType === "all") {
            const users = await User.find({ status: "active" }).select("_id").lean();
            recipientIds = users.map((u) => u._id.toString());
        } else if (recipientType === "role") {
            const users = await User.find({
                role: recipients,
                status: "active",
            })
                .select("_id")
                .lean();
            recipientIds = users.map((u) => u._id.toString());
        } else if (recipientType === "single") {
            const u = await User.findById(recipients).select("_id").lean();
            if (u) recipientIds = [u._id.toString()];
        } else if (recipientType === "multiple") {
            const ids = Array.isArray(recipients) ? recipients : [];
            const users = await User.find({ _id: { $in: ids }, status: "active" })
                .select("_id")
                .lean();
            recipientIds = users.map((u) => u._id.toString());
        } else {
            return errorResponse("Invalid recipientType", 400);
        }

        if (recipientIds.length === 0) {
            return successResponse({
                sent: 0,
                total: 0,
                message: "No matching recipients found",
            });
        }

        const result = await sendBulkNotification({
            recipientIds,
            title: title || "Notification",
            message: message || "",
            type,
            senderId: user._id.toString(),
            actionUrl: actionUrl || null,
            actionLabel: actionLabel || null,
            email,
        });

        return successResponse({
            sent: result.created,
            total: result.total,
            pushSent: result.pushSent,
            emailSent: result.emailSent,
            message:
                result.created > 0
                    ? `Delivered to ${result.created} recipient(s) (in-app${result.pushSent ? ", push" : ""}${result.emailSent ? ", email" : ""})`
                    : "Delivery completed with errors",
        });
    } catch (error) {
        console.error("POST /api/notifications error:", error);
        return errorResponse(error.message || "Failed to send", 500);
    }
}
