import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

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
