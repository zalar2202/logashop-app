import crypto from "crypto";
import { checkRateLimit } from "@/lib/rateLimit";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { notifyPasswordReset } from "@/lib/shopNotifications";

/**
 * POST /api/auth/forgot-password — Request password reset link
 */
export async function POST(req) {
    try {
        const { allowed } = checkRateLimit(req, "forgot-password");
        if (!allowed) {
            return errorResponse("Too many requests. Please try again later.", 429);
        }
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return errorResponse("Email is required", 400);
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return successResponse({
                message: "If that email is in our system, we have sent a reset link.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpires = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        notifyPasswordReset(user, resetToken).catch((err) =>
            console.error("Failed to send reset email:", err)
        );

        return successResponse({
            message: "If that email is in our system, we have sent a reset link.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return errorResponse("An error occurred", 500);
    }
}
