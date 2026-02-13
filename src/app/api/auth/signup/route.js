import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { setAuthToken } from "@/lib/cookies";
import { notifyWelcome } from "@/lib/shopNotifications";

/**
 * Signup API Route
 * POST /api/auth/signup
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "Email already in use" },
                { status: 400 }
            );
        }

        // Create user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: "user", // Default role for public signup
            status: "active",
            preferences: {
                theme: "system",
                language: "en",
            },
        });

        await user.save();

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set token in httpOnly cookie
        await setAuthToken(token);

        // Update last login
        await user.updateLastLogin();

        // Send welcome notification + email (non-blocking)
        notifyWelcome(user).catch((err) => console.error("Welcome notification failed:", err));

        return NextResponse.json(
            {
                success: true,
                message: "Signup successful",
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "An error occurred during signup",
            },
            { status: 500 }
        );
    }
}
