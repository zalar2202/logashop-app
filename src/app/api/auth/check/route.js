import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

/**
 * Check Authentication Status
 * GET /api/auth/check
 *
 * Verifies JWT token and returns current user data
 */
export async function GET() {
    try {
        // Get token from httpOnly cookie
        const token = await getAuthToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    message: "Not authenticated - no token found",
                },
                { status: 401 }
            );
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    message: error.message || "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    authenticated: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }

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
