import { NextResponse } from 'next/server';
import { getAuthToken, clearAuthToken } from '@/lib/cookies';
import { verifyToken } from '@/lib/jwt';
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

        // Check if account is already deactivated or deleted
        if (user.status === 'suspended') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is already deactivated',
                },
                { status: 400 }
            );
        }

        if (user.accountDeletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is already deleted',
                },
                { status: 400 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

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
        user.status = 'suspended';
        user.accountDeactivatedAt = new Date();

        // Save user
        await user.save();

        // Log deactivation (for audit trail)
        console.log(`Account deactivated: ${user.email} at ${new Date().toISOString()}`);
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
        await clearAuthToken();

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

