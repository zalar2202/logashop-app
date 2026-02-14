import { NextResponse } from 'next/server';
import { setAuthCookie, signAccessToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
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
            return NextResponse.json(
                { success: false, message: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            );
        }
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email and password are required',
                },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Find user by email (with password field included)
        const user = await User.findByEmailWithPassword(email);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid credentials',
                },
                { status: 401 }
            );
        }

        // Check if user is active
        if (user.status !== 'active') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is not active. Please contact administrator.',
                },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid credentials',
                },
                { status: 401 }
            );
        }

        const token = signAccessToken(user);

        // Set token in httpOnly cookie (web and optionally mobile)
        await setAuthCookie(token, {
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        // Update last login timestamp
        await user.updateLastLogin();

        const isMobile = isMobileClient(request);
        const payload = {
            success: true,
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
            payload.accessToken = token;
        }
        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

