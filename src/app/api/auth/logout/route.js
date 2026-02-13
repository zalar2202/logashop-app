import { NextResponse } from 'next/server';
import { clearAuthToken } from '@/lib/cookies';

/**
 * Logout API Route
 * POST /api/auth/logout
 * 
 * Clears the httpOnly cookie containing the JWT token
 */
export async function POST() {
    try {
        // Clear the auth token cookie
        await clearAuthToken();

        return NextResponse.json(
            {
                success: true,
                message: 'Logged out successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Logout error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during logout',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

