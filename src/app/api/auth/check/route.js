import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

/**
 * Check Authentication Status
 * GET /api/auth/check
 *
 * Verifies JWT token (cookie or Bearer) and returns current user data
 */
export async function GET(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    message: "Not authenticated",
                },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Check if user is still active
        if (user.status !== "active") {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    message: "Account is not active",
                },
                { status: 403 }
            );
        }

        // Return user data
        return NextResponse.json(
            {
                success: true,
                authenticated: true,
                message: "User is authenticated",
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
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Auth check error:", error);

        return NextResponse.json(
            {
                success: false,
                authenticated: false,
                message: "Authentication check failed",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}
