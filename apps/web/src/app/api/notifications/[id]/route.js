import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read or unread. Body: { read: boolean }
 */
export async function PATCH(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        await dbConnect();

        const { id } = await params;
        const notification = await Notification.findById(id);

        if (!notification) {
            return errorResponse("Notification not found", 404);
        }

        if (notification.recipient.toString() !== user._id.toString()) {
            return errorResponse("Forbidden", 403);
        }

        const body = await req.json().catch(() => ({}));
        const read = body.read;

        if (typeof read !== "boolean") {
            return errorResponse("read must be a boolean", 400);
        }

        if (read) {
            await notification.markAsRead();
        } else {
            await notification.markAsUnread();
        }

        const updated = await Notification.findById(id).lean();
        return successResponse(updated);
    } catch (error) {
        console.error("PATCH /api/notifications/[id] error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification (must be recipient).
 */
export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        await dbConnect();

        const { id } = await params;
        const notification = await Notification.findById(id);

        if (!notification) {
            return errorResponse("Notification not found", 404);
        }

        if (notification.recipient.toString() !== user._id.toString()) {
            return errorResponse("Forbidden", 403);
        }

        await notification.deleteOne();
        return successResponse({ deleted: true });
    } catch (error) {
        console.error("DELETE /api/notifications/[id] error:", error);
        return errorResponse(error.message, 500);
    }
}
