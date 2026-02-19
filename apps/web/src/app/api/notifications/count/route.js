import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * GET /api/notifications/count
 * Unread notification count for the authenticated user.
 */
export async function GET(req) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        await dbConnect();

        const count = await Notification.getUnreadCount(user._id);

        return successResponse({ count });
    } catch (error) {
        console.error("GET /api/notifications/count error:", error);
        return errorResponse(error.message, 500);
    }
}
