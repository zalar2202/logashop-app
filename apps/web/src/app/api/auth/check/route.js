import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import connectDB from "@/lib/mongodb";

/**
 * Check Authentication Status
 * GET /api/auth/check — Verifies JWT (cookie or Bearer) and returns user data
 */
export async function GET(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        await connectDB();

        if (user.status !== "active") {
            return errorResponse("Account is not active", 403);
        }

        return successResponse({
            authenticated: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                phone: user.phone,
                avatar: user.avatar,
                bio: user.bio,
                preferences: user.preferences,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                lastPasswordChange: user.lastPasswordChange,
                technicalDetails: user.technicalDetails,
            },
        });
    } catch (error) {
        console.error("Auth check error:", error);
        return errorResponse(
            process.env.NODE_ENV === "development" ? error.message : "Authentication check failed",
            500
        );
    }
}
