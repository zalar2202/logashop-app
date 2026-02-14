import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rateLimit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { notifyPasswordReset } from "@/lib/shopNotifications";

/**
 * POST /api/auth/forgot-password
 * Request password reset link
 */
export async function POST(req) {
    try {
        const { allowed } = checkRateLimit(req, "forgot-password");
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // For security, do not reveal if email exists or not
            return NextResponse.json({
                success: true,
                message: "If that email is in our system, we have sent a reset link.",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpires = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Send email (non-blocking)
        notifyPasswordReset(user, resetToken).catch((err) =>
            console.error("Failed to send reset email:", err)
        );

        return NextResponse.json({
            success: true,
            message: "If that email is in our system, we have sent a reset link.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 });
    }
}
