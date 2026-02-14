import { clearAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/**
 * POST /api/auth/logout — Clears the httpOnly auth cookie
 */
export async function POST() {
    try {
        await clearAuthCookie();
        return successResponse({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(error.message, 500);
    }
}

