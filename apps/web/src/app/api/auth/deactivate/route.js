import { verifyAuth, clearAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
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
            return errorResponse('Not authenticated', 401);
        }

        const { password, reason } = await request.json();

        if (!password) {
            return errorResponse('Password is required to deactivate account', 400);
        }

        await connectDB();

        const userWithPassword = await User.findByEmailWithPassword(user.email);

        if (!userWithPassword) {
            return errorResponse('User not found', 404);
        }

        if (userWithPassword.status === 'suspended') {
            return errorResponse('Account is already deactivated', 400);
        }

        if (userWithPassword.accountDeletedAt) {
            return errorResponse('Account is already deleted', 400);
        }

        const isPasswordValid = await userWithPassword.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse('Password is incorrect', 401);
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

        await clearAuthCookie();

        return successResponse({ message: 'Account deactivated successfully' });
    } catch (error) {
        console.error('Account deactivation error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'development' ? error.message : 'Failed to deactivate account',
            500
        );
    }
}

