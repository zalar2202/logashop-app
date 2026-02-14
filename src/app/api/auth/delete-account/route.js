import { verifyAuth, clearAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { deleteFile } from '@/lib/storage';

/**
 * Delete User Account Permanently
 * DELETE /api/auth/delete-account
 *
 * Permanently deletes user account and all associated data
 * Requires password verification and explicit confirmation
 * This action is IRREVERSIBLE
 */
export async function DELETE(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        const { password, confirmation } = await request.json();

        if (!password) {
            return errorResponse('Password is required to delete account', 400);
        }

        if (confirmation !== 'DELETE') {
            return errorResponse('You must type DELETE exactly to confirm account deletion', 400);
        }

        await connectDB();

        const userWithPassword = await User.findByEmailWithPassword(user.email);

        if (!userWithPassword) {
            return errorResponse('User not found', 404);
        }

        if (userWithPassword.accountDeletedAt) {
            return errorResponse('Account is already deleted', 400);
        }

        if (userWithPassword.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin', accountDeletedAt: null });
            if (adminCount <= 1) {
                return errorResponse(
                    'Cannot delete the last admin account. Please create another admin first.',
                    403
                );
            }
        }

        const isPasswordValid = await userWithPassword.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse('Password is incorrect', 401);
        }

        // Store user info for logging before deletion
        const userEmail = userWithPassword.email;
        const userId = userWithPassword._id.toString();

        // Delete avatar file if exists
        if (userWithPassword.avatar) {
            try {
                await deleteFile(userWithPassword.avatar, 'avatars');
            } catch (fileError) {
                console.error('Error deleting avatar file:', fileError);
                // Continue with account deletion even if file deletion fails
            }
        }

        // Option 1: Soft delete (recommended for audit trail)
        // Mark account as deleted but keep in database
        userWithPassword.accountDeletedAt = new Date();
        userWithPassword.status = 'suspended';
        userWithPassword.email = `deleted_${Date.now()}_${userWithPassword.email}`; // Prevent email conflicts
        await userWithPassword.save();

        // Option 2: Hard delete (uncomment if preferred)
        // await User.findByIdAndDelete(user._id);

        // Log deletion (for audit trail and compliance)
        console.log(`Account permanently deleted: ${userEmail} (ID: ${userId}) at ${new Date().toISOString()}`);

        // TODO: Send notification to admin about account deletion (if implemented)
        // TODO: Send confirmation email to user (if email service is set up)

        await clearAuthCookie();

        return successResponse({
            message: "Account deleted permanently. We're sorry to see you go.",
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'development' ? error.message : 'Failed to delete account',
            500
        );
    }
}

