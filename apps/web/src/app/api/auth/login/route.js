import { setAuthCookie, signAccessToken, createRefreshToken, getAccessTokenExpiry } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Detect mobile client (header X-Client: mobile or query client=mobile).
 */
function isMobileClient(request) {
    const header = request.headers.get('x-client')?.toLowerCase();
    if (header === 'mobile') return true;
    try {
        const url = new URL(request.url);
        if (url.searchParams.get('client')?.toLowerCase() === 'mobile') return true;
    } catch (_) {}
    return false;
}

/**
 * Login API Route
 * POST /api/auth/login
 *
 * Authenticates user with email and password.
 * Sets httpOnly cookie for web. For mobile (X-Client: mobile or ?client=mobile),
 * also returns accessToken in the JSON body so the app can store it (e.g. SecureStore).
 */
export async function POST(request) {
    try {
        const { allowed } = checkRateLimit(request, 'login');
        if (!allowed) {
            return errorResponse('Too many login attempts. Please try again later.', 429);
        }
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse('Email and password are required', 400);
        }

        await connectDB();

        const user = await User.findByEmailWithPassword(email);

        if (!user) {
            return errorResponse('Invalid credentials', 401);
        }

        if (user.status !== 'active') {
            return errorResponse('Account is not active. Please contact administrator.', 403);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse('Invalid credentials', 401);
        }

        const isMobile = isMobileClient(request);
        const accessExpiry = isMobile ? getAccessTokenExpiry() : null;
        const token = signAccessToken(user, accessExpiry);

        const cookieMaxAge = isMobile ? 30 * 60 : 7 * 24 * 60 * 60;
        await setAuthCookie(token, { maxAge: cookieMaxAge });

        await user.updateLastLogin();

        const data = {
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                phone: user.phone,
                avatar: user.avatar,
                lastLogin: user.lastLogin,
                technicalDetails: user.technicalDetails,
            },
        };
        if (isMobile) {
            data.accessToken = token;
            data.refreshToken = await createRefreshToken(user);
            data.expiresIn = getAccessTokenExpiry();
        }
        return successResponse(data);
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(
            process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during login',
            500
        );
    }
}

