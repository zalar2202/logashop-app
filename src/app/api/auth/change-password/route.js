import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookies';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Change User Password
 * PUT /api/auth/change-password
 *
 * Allows authenticated users to change their password
 * Requires current password verification
 */
export async function PUT(request) {
    try {
        // Get token from httpOnly cookie
        const token = await getAuthToken();

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authenticated - no token found',
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
                    message: error.message || 'Invalid or expired token',
                },
                { status: 401 }
            );
        }

        // Parse request body
        const { currentPassword, newPassword } = await request.json();

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Current password and new password are required',
                },
                { status: 400 }
            );
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'New password must be at least 8 characters long',
                },
                { status: 400 }
            );
        }

        // Check password complexity
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecialChar = /[@$!%*?&#]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password must contain uppercase, lowercase, number, and special character',
                },
                { status: 400 }
            );
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'New password must be different from current password',
                },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch user with password field
        const user = await User.findByEmailWithPassword(decoded.email);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        // Check if account is active
        if (user.status === 'suspended' || user.accountDeletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is suspended or deleted',
                },
                { status: 403 }
            );
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Current password is incorrect',
                },
                { status: 401 }
            );
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        user.lastPasswordChange = new Date();

        // Save user (triggers password hashing middleware)
        await user.save();

        // Log security event (optional - for future audit trail)
        console.log(`Password changed for user: ${user.email} at ${new Date().toISOString()}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Password changed successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Password change error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to change password',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

