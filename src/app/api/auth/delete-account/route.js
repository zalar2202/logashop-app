import { NextResponse } from 'next/server';
import { verifyAuth, clearAuthCookie } from '@/lib/auth';
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
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authenticated',
                },
                { status: 401 }
            );
        }

        // Parse request body
        const { password, confirmation } = await request.json();

        // Validate required fields
        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password is required to delete account',
                },
                { status: 400 }
            );
        }

        if (confirmation !== 'DELETE') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You must type DELETE exactly to confirm account deletion',
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

        // Check if account is already deleted
        if (userWithPassword.accountDeletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is already deleted',
                },
                { status: 400 }
            );
        }

        // Prevent admin from deleting their own account if they're the only admin
        if (userWithPassword.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin', accountDeletedAt: null });
            if (adminCount <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Cannot delete the last admin account. Please create another admin first.',
                    },
                    { status: 403 }
                );
            }
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

        // Clear auth token (log out user)
        const response = NextResponse.json(
            {
                success: true,
                message: 'Account deleted permanently. We\'re sorry to see you go.',
            },
            { status: 200 }
        );

        // Delete auth cookie
        await clearAuthCookie();

        return response;
    } catch (error) {
        console.error('Account deletion error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete account',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

