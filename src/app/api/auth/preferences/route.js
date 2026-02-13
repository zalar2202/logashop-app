import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookies';
import { verifyToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Update User Preferences
 * PUT /api/auth/preferences
 *
 * Updates user preferences (notifications, theme, language, privacy)
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
        const preferences = await request.json();

        // Validate preference values
        const validThemes = ['light', 'dark', 'system'];
        const validFrequencies = ['immediate', 'daily', 'weekly'];
        const validVisibilities = ['public', 'private'];

        if (preferences.theme && !validThemes.includes(preferences.theme)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid theme value',
                },
                { status: 400 }
            );
        }

        if (preferences.notificationFrequency && !validFrequencies.includes(preferences.notificationFrequency)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid notification frequency',
                },
                { status: 400 }
            );
        }

        if (preferences.profileVisibility && !validVisibilities.includes(preferences.profileVisibility)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid profile visibility',
                },
                { status: 400 }
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

        // Update preferences (merge with existing)
        user.preferences = {
            ...user.preferences,
            ...preferences,
        };

        // Save updated user
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: 'Preferences updated successfully',
                preferences: user.preferences,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Preferences update error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update preferences',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

