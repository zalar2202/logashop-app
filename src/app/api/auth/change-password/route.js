import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
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
            return errorResponse('Not authenticated', 401);
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return errorResponse('Current password and new password are required', 400);
        }

        if (newPassword.length < 8) {
            return errorResponse('New password must be at least 8 characters long', 400);
        }

        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecialChar = /[@$!%*?&#]/.test(newPassword);
        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            return errorResponse(
                'Password must contain uppercase, lowercase, number, and special character',
                400
            );
        }

        if (currentPassword === newPassword) {
            return errorResponse('New password must be different from current password', 400);
        }

        await connectDB();

        const userWithPassword = await User.findByEmailWithPassword(user.email);

        if (!userWithPassword) {
            return errorResponse('User not found', 404);
        }

        if (userWithPassword.status === 'suspended' || userWithPassword.accountDeletedAt) {
            return errorResponse('Account is suspended or deleted', 403);
        }

        const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return errorResponse('Current password is incorrect', 401);
        }

        userWithPassword.password = newPassword;
        userWithPassword.lastPasswordChange = new Date();
        await userWithPassword.save();

        console.log(`Password changed for user: ${userWithPassword.email} at ${new Date().toISOString()}`);

        return successResponse({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'development' ? error.message : 'Failed to change password',
            500
        );
    }
}

