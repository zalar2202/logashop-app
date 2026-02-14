import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
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
        const user = await verifyAuth(request);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authenticated',
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
        const userWithPassword = await User.findByEmailWithPassword(user.email);

        if (!userWithPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        // Check if account is active
        if (userWithPassword.status === 'suspended' || userWithPassword.accountDeletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is suspended or deleted',
                },
                { status: 403 }
            );
        }

        // Verify current password
        const isPasswordValid = await userWithPassword.comparePassword(currentPassword);

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
        userWithPassword.password = newPassword;
        userWithPassword.lastPasswordChange = new Date();

        // Save user (triggers password hashing middleware)
        await userWithPassword.save();

        // Log security event (optional - for future audit trail)
        console.log(`Password changed for user: ${userWithPassword.email} at ${new Date().toISOString()}`);

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

