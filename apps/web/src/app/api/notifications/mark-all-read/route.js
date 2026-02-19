import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all user's notifications as read.
 */
export async function PATCH(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        await dbConnect();

        await Notification.markAllAsRead(user._id);

        return successResponse({ marked: true });
    } catch (error) {
        console.error("PATCH /api/notifications/mark-all-read error:", error);
        return errorResponse(error.message, 500);
    }
}
