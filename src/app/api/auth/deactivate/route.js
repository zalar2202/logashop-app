import { NextResponse } from 'next/server';
import { verifyAuth, clearAuthCookie } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Deactivate User Account
 * POST /api/auth/deactivate
 *
 * Temporarily deactivates user account (can be reactivated by admin)
 * Sets status to 'suspended' and logs deactivation timestamp
 */
export async function POST(request) {
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
        const { password, reason } = await request.json();

        // Validate required fields
        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password is required to deactivate account',
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

        // Check if account is already deactivated or deleted
        if (userWithPassword.status === 'suspended') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is already deactivated',
                },
                { status: 400 }
            );
        }

        if (userWithPassword.accountDeletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is already deleted',
                },
                { status: 400 }
            );
        }

        // Verify password
        const isPasswordValid = await userWithPassword.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password is incorrect',
                },
                { status: 401 }
            );
        }

        // Deactivate account
        userWithPassword.status = 'suspended';
        userWithPassword.accountDeactivatedAt = new Date();

        // Save user
        await userWithPassword.save();

        // Log deactivation (for audit trail)
        console.log(`Account deactivated: ${userWithPassword.email} at ${new Date().toISOString()}`);
        if (reason) {
            console.log(`Deactivation reason: ${reason}`);
        }

        // Clear auth token (log out user)
        const response = NextResponse.json(
            {
                success: true,
                message: 'Account deactivated successfully',
            },
            { status: 200 }
        );

        // Delete auth cookie
        await clearAuthCookie();

        return response;
    } catch (error) {
        console.error('Account deactivation error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to deactivate account',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

