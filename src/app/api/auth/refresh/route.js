import { checkRateLimit } from '@/lib/rateLimit';
import { signAccessToken, createRefreshToken, getAccessTokenExpiry } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RefreshToken from '@/models/RefreshToken';

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Returns { accessToken, refreshToken, expiresIn }. Old refresh token is invalidated (rotation).
 */
export async function POST(request) {
    try {
        const { allowed } = checkRateLimit(request, 'refresh');
        if (!allowed) {
            return errorResponse('Too many requests. Try again later.', 429);
        }

        const body = await request.json().catch(() => ({}));
        const { refreshToken: incoming } = body;
        if (!incoming || typeof incoming !== 'string') {
            return errorResponse('refreshToken is required', 400);
        }

        await connectDB();

        const doc = await RefreshToken.findByToken(incoming.trim());
        if (!doc) {
            return errorResponse('Invalid or expired refresh token', 401);
        }
        if (new Date() > doc.expiresAt) {
            await RefreshToken.deleteOne({ _id: doc._id });
            return errorResponse('Refresh token expired', 401);
        }

        const user = await User.findById(doc.userId).select('-password');
        if (!user || user.status !== 'active') {
            await RefreshToken.deleteOne({ _id: doc._id });
            return errorResponse('User not found or inactive', 401);
        }

        await RefreshToken.deleteOne({ _id: doc._id });

        const accessToken = signAccessToken(user, getAccessTokenExpiry());
        const newRefreshToken = await createRefreshToken(user, doc.deviceId || undefined);

        return successResponse({
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: getAccessTokenExpiry(),
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return errorResponse('Refresh failed', 500);
    }
}
