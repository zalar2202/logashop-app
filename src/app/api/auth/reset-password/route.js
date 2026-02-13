import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
export async function POST(req) {
    try {
        await dbConnect();
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Token is invalid or has expired" },
                { status: 400 }
            );
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.lastPasswordChange = new Date();

        await user.save(); // Triggers password hashing

        return NextResponse.json({
            success: true,
            message: "Password has been reset successfully. You can now log in.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 });
    }
}
