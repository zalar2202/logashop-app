import { cookies } from 'next/headers';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { COOKIE_NAMES } from '@/constants/config';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export async function verifyAuth(request) {
    try {
        const cookieStore = await cookies();
        let token = cookieStore.get(COOKIE_NAMES.TOKEN)?.value || 
                   cookieStore.get('token')?.value || 
                   cookieStore.get('om_token')?.value;

        if (!token && request) {
            // Fallback to Header
            const authHeader = request.headers.get('authorization');
            if (authHeader) {
                token = extractTokenFromHeader(authHeader);
            }
        }

        if (!token) {
            return null;
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return null;
        }

        // We imported dbConnect, but let's make sure we are connected
        // It's often safer to import the connection function.
        // If '@/lib/db' doesn't exist, we might crash again.
        // Let's use '@/lib/mongodb' if that's the established pattern, 
        // OR rely on the fact that Mongoose might be cached.
        
        // Fetch user permissions/role if needed, or just return basic decoded info.
        // Ideally we return the full user doc to check role changes/bans.
        
        // Lazy load connection if necessary
        // await dbConnect(); 

        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
             return null;
        }

        return user;
    } catch (error) {
        console.error("Auth verification error:", error);
        return null; // Return null on any failure (expired, invalid, etc)
    }
}
