import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { uploadFile, deleteFile } from '@/lib/storage';

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
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authenticated',
                },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch full user from database (verifyAuth returns lean user)
        const fullUser = await User.findById(user._id);

        if (!fullUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        // Check if account is active
        if (fullUser.status === 'suspended' || fullUser.accountDeletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is suspended or deleted',
                },
                { status: 403 }
            );
        }

        // Parse request data (handle both JSON and FormData)
        const contentType = request.headers.get('content-type') || '';
        let updateData = {};
        let avatarFile = null;

        if (contentType.includes('multipart/form-data')) {
            // FormData (with file upload)
            const formData = await request.formData();
            updateData.name = formData.get('name');
            updateData.phone = formData.get('phone');
            updateData.bio = formData.get('bio');
            avatarFile = formData.get('avatar');

            // Handle technicalDetails if sent as JSON string in FormData
            const techDetails = formData.get('technicalDetails');
            if (techDetails) {
                try {
                    updateData.technicalDetails = JSON.parse(techDetails);
                } catch (e) {
                    console.error('Error parsing technicalDetails from FormData:', e);
                }
            }
        } else {
            // JSON (without file upload)
            updateData = await request.json();
        }

        // Validate required fields
        if (!updateData.name || updateData.name.trim().length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Name is required and must be at least 2 characters',
                },
                { status: 400 }
            );
        }

        // Handle avatar upload if present
        if (avatarFile && avatarFile.size > 0) {
            try {
                // Upload new avatar
                const uploadResult = await uploadFile(avatarFile, 'avatars', fullUser.avatar);

                if (!uploadResult.success) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: uploadResult.error || 'Failed to upload avatar',
                        },
                        { status: 400 }
                    );
                }

                // Old avatar is already deleted by uploadFile (via oldFilename param)
                updateData.avatar = uploadResult.filename;
            } catch (uploadError) {
                console.error('Avatar upload error:', uploadError);
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Failed to upload avatar',
                    },
                    { status: 500 }
                );
            }
        }

        // Update user fields
        if (updateData.name) fullUser.name = updateData.name.trim();
        if (updateData.phone !== undefined) fullUser.phone = updateData.phone ? updateData.phone.trim() : '';
        if (updateData.bio !== undefined) fullUser.bio = updateData.bio ? updateData.bio.trim() : '';
        if (updateData.avatar) fullUser.avatar = updateData.avatar;
        if (updateData.technicalDetails !== undefined) {
            fullUser.technicalDetails = {
                ...fullUser.technicalDetails,
                ...updateData.technicalDetails
            };
        }

        // Save updated user
        await fullUser.save();

        // Return updated user data
        return NextResponse.json(
            {
                success: true,
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
                    technicalDetails: fullUser.technicalDetails,
                    lastLogin: fullUser.lastLogin,
                    createdAt: fullUser.createdAt,
                    preferences: fullUser.preferences,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Profile update error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update profile',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

