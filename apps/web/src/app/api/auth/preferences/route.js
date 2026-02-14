import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
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
        const user = await verifyAuth(request);

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        const preferences = await request.json();

        const validThemes = ['light', 'dark', 'system'];
        const validFrequencies = ['immediate', 'daily', 'weekly'];
        const validVisibilities = ['public', 'private'];

        if (preferences.theme && !validThemes.includes(preferences.theme)) {
            return errorResponse('Invalid theme value', 400);
        }
        if (
            preferences.notificationFrequency &&
            !validFrequencies.includes(preferences.notificationFrequency)
        ) {
            return errorResponse('Invalid notification frequency', 400);
        }
        if (
            preferences.profileVisibility &&
            !validVisibilities.includes(preferences.profileVisibility)
        ) {
            return errorResponse('Invalid profile visibility', 400);
        }

        await connectDB();

        const fullUser = await User.findById(user._id);

        if (!fullUser) {
            return errorResponse('User not found', 404);
        }

        if (fullUser.status === 'suspended' || fullUser.accountDeletedAt) {
            return errorResponse('Account is suspended or deleted', 403);
        }

        fullUser.preferences = {
            ...fullUser.preferences,
            ...preferences,
        };
        await fullUser.save();

        return successResponse({
            message: 'Preferences updated successfully',
            preferences: fullUser.preferences,
        });
    } catch (error) {
        console.error('Preferences update error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'development' ? error.message : 'Failed to update preferences',
            500
        );
    }
}

