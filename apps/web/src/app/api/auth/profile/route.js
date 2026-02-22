import { verifyAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { uploadFile } from '@/lib/storage';

/**
 * Update User Profile
 * PUT /api/auth/profile
 *
 * Updates user profile information (name, phone, bio, avatar)
 * Handles both JSON and FormData (for avatar upload)
 */
export async function PUT(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return errorResponse('Not authenticated', 401);
        }

        await connectDB();

        const fullUser = await User.findById(user._id);

        if (!fullUser) {
            return errorResponse('User not found', 404);
        }

        if (fullUser.status === 'suspended' || fullUser.accountDeletedAt) {
            return errorResponse('Account is suspended or deleted', 403);
        }

        // Parse request data (handle both JSON and FormData)
        const contentType = request.headers.get('content-type') || '';
        let updateData = {};
        let avatarFile = null;

        if (contentType.includes('multipart/form-data')) {
            // FormData (with file upload)
            const formData = await request.formData();
            const formName = formData.get('name');
            const formFirstName = formData.get('firstName');
            const formLastName = formData.get('lastName');
            if (formName) {
                updateData.name = formName;
            } else if (formFirstName !== null || formLastName !== null) {
                updateData.name = `${formFirstName || ''} ${formLastName || ''}`.trim();
            }
            updateData.phone = formData.get('phone');
            updateData.bio = formData.get('bio');
            avatarFile = formData.get('avatar');
        } else {
            // JSON (without file upload)
            updateData = await request.json();
        }

        // Support firstName/lastName (combine to name) for account profile
        if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
            const first = (updateData.firstName || '').trim();
            const last = (updateData.lastName || '').trim();
            updateData.name = `${first} ${last}`.trim();
        }
        if (!updateData.name || updateData.name.trim().length < 2) {
            return errorResponse('Name is required and must be at least 2 characters', 400);
        }

        if (avatarFile && avatarFile.size > 0) {
            try {
                const uploadResult = await uploadFile(avatarFile, 'avatars', fullUser.avatar);
                if (!uploadResult.success) {
                    return errorResponse(uploadResult.error || 'Failed to upload avatar', 400);
                }
                updateData.avatar = uploadResult.filename;
            } catch (uploadError) {
                console.error('Avatar upload error:', uploadError);
                return errorResponse('Failed to upload avatar', 500);
            }
        }

        // Update user fields
        if (updateData.name) fullUser.name = updateData.name.trim();
        if (updateData.phone !== undefined) fullUser.phone = updateData.phone ? updateData.phone.trim() : '';
        if (updateData.bio !== undefined) fullUser.bio = updateData.bio ? updateData.bio.trim() : '';
        if (updateData.avatar) fullUser.avatar = updateData.avatar;

        await fullUser.save();

        return successResponse({
            message: 'Profile updated successfully',
            user: {
                id: fullUser._id.toString(),
                email: fullUser.email,
                name: fullUser.name,
                role: fullUser.role,
                status: fullUser.status,
                phone: fullUser.phone,
                avatar: fullUser.avatar,
                bio: fullUser.bio,
                lastLogin: fullUser.lastLogin,
                createdAt: fullUser.createdAt,
                preferences: fullUser.preferences,
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'development' ? error.message : 'Failed to update profile',
            500
        );
    }
}

