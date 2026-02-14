import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Export User Data
 * GET /api/auth/export-data?format=json|csv
 *
 * Exports all user data for GDPR compliance
 * Returns downloadable file with user information
 */
export async function GET(request) {
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

        // Get format from query params
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';

        if (!['json', 'csv'].includes(format)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid format. Use json or csv',
                },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch user from database (exclude password)
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

        // Log export request
        fullUser.dataExportRequests.push({
            requestedAt: new Date(),
            exportedAt: new Date(),
            format: format,
        });
        await fullUser.save();

        // Prepare user data for export
        const userData = {
            personalInformation: {
                name: fullUser.name,
                email: fullUser.email,
                phone: fullUser.phone,
                bio: fullUser.bio,
                role: fullUser.role,
                status: fullUser.status,
            },
            accountInformation: {
                accountCreated: fullUser.createdAt,
                lastLogin: fullUser.lastLogin,
                lastPasswordChange: fullUser.lastPasswordChange,
            },
            preferences: {
                emailNotifications: fullUser.preferences?.emailNotifications,
                pushNotifications: fullUser.preferences?.pushNotifications,
                notificationFrequency: fullUser.preferences?.notificationFrequency,
                theme: fullUser.preferences?.theme,
                language: fullUser.preferences?.language,
                dateFormat: fullUser.preferences?.dateFormat,
                profileVisibility: fullUser.preferences?.profileVisibility,
            },
            dataExportHistory: fullUser.dataExportRequests.map(req => ({
                requestedAt: req.requestedAt,
                format: req.format,
            })),
            exportMetadata: {
                exportDate: new Date().toISOString(),
                exportFormat: format,
            },
        };

        // Return data in requested format
        if (format === 'json') {
            // JSON format
            return new NextResponse(JSON.stringify(userData, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="user-data-${fullUser._id}-${Date.now()}.json"`,
                },
            });
        } else {
            // CSV format
            const csvRows = [];
            
            // Headers
            csvRows.push('Category,Field,Value');
            
            // Personal Information
            csvRows.push(`Personal Information,Name,"${userData.personalInformation.name}"`);
            csvRows.push(`Personal Information,Email,"${userData.personalInformation.email}"`);
            csvRows.push(`Personal Information,Phone,"${userData.personalInformation.phone || 'N/A'}"`);
            csvRows.push(`Personal Information,Bio,"${userData.personalInformation.bio || 'N/A'}"`);
            csvRows.push(`Personal Information,Role,"${userData.personalInformation.role}"`);
            csvRows.push(`Personal Information,Status,"${userData.personalInformation.status}"`);
            
            // Account Information
            csvRows.push(`Account Information,Account Created,"${userData.accountInformation.accountCreated}"`);
            csvRows.push(`Account Information,Last Login,"${userData.accountInformation.lastLogin || 'N/A'}"`);
            csvRows.push(`Account Information,Last Password Change,"${userData.accountInformation.lastPasswordChange || 'N/A'}"`);
            
            // Preferences
            csvRows.push(`Preferences,Email Notifications,"${userData.preferences.emailNotifications}"`);
            csvRows.push(`Preferences,Push Notifications,"${userData.preferences.pushNotifications}"`);
            csvRows.push(`Preferences,Notification Frequency,"${userData.preferences.notificationFrequency}"`);
            csvRows.push(`Preferences,Theme,"${userData.preferences.theme}"`);
            csvRows.push(`Preferences,Language,"${userData.preferences.language}"`);
            csvRows.push(`Preferences,Date Format,"${userData.preferences.dateFormat}"`);
            csvRows.push(`Preferences,Profile Visibility,"${userData.preferences.profileVisibility}"`);
            
            const csvContent = csvRows.join('\n');
            
            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="user-data-${fullUser._id}-${Date.now()}.csv"`,
                },
            });
        }
    } catch (error) {
        console.error('Data export error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to export data',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

