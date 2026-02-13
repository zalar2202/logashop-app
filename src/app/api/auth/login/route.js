import { NextResponse } from 'next/server';
import { setAuthToken } from '@/lib/cookies';
import { generateToken } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Login API Route
 * POST /api/auth/login
 * 
 * Authenticates user with email and password
 * Returns user data and sets httpOnly cookie with JWT token
 */
export async function POST(request) {
    try {
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

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set token in httpOnly cookie
        await setAuthToken(token, {
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        // Update last login timestamp
        await user.updateLastLogin();

        // Return user data (NOT the token!)
        return NextResponse.json(
            {
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
            },
            { status: 200 }
        );
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

