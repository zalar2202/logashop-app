import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { setAuthToken } from '@/lib/cookies';
import axios from 'axios';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '/panel/dashboard';
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5555';

    if (error) {
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(`${appUrl}/login?error=Google authentication failed`);
    }

    if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=No code provided`);
    }

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenResponse.data;

        // Get user info from Google
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const googleUser = userResponse.data;
        const { sub: googleId, email, name, picture: avatar } = googleUser;

        await connectDB();

        // Find or create user
        let user = await User.findOne({ 
            $or: [
                { googleId: googleId },
                { email: email.toLowerCase() }
            ]
        });

        if (user) {
            // Update user if they don't have googleId yet
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = avatar;
                await user.save();
            }
        } else {
            // Create new user with role 'user'
            user = new User({
                name,
                email: email.toLowerCase(),
                googleId,
                avatar,
                role: 'user',
                status: 'active',
                preferences: {
                    language: 'en',
                    theme: 'system',
                }
            });
            await user.save();
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set token in httpOnly cookie
        await setAuthToken(token);

        // Update last login
        await user.updateLastLogin();

        // Redirect to dashboard or the state provided
        return NextResponse.redirect(`${appUrl}${state}`);

    } catch (error) {
        console.error('Google Callback Error:', error.response?.data || error.message);
        return NextResponse.redirect(`${appUrl}/login?error=Failed to authenticate with Google`);
    }
}
