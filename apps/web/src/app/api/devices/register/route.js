import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const VALID_PLATFORMS = ["web", "ios", "android"];

/**
 * POST /api/devices/register
 * Register FCM/device token for push notifications. Authenticated.
 * Body: { deviceToken (required), platform (required: ios|android|web), deviceId?, appVersion? }
 * When deviceId is provided, any existing token for that deviceId is replaced (one token per device per user).
 */
export async function POST(req) {
    try {
        const user = await verifyAuth(req);

        if (!user) {
            return errorResponse("Not authenticated", 401);
        }

        const body = await req.json().catch(() => ({}));
        const { deviceToken, platform, deviceId = null, appVersion = null } = body;

        if (!deviceToken || typeof deviceToken !== "string" || !deviceToken.trim()) {
            return errorResponse("deviceToken is required", 400);
        }

        const normalizedPlatform = (platform || "web").toLowerCase();
        if (!VALID_PLATFORMS.includes(normalizedPlatform)) {
            return errorResponse(
                `platform must be one of: ${VALID_PLATFORMS.join(", ")}`,
                400
            );
        }

        await dbConnect();

        const fullUser = await User.findById(user._id);
        if (!fullUser) {
            return errorResponse("User not found", 404);
        }

        await fullUser.addFcmToken(deviceToken.trim(), normalizedPlatform, null, {
            deviceId: deviceId ? String(deviceId).trim() : null,
            appVersion: appVersion ? String(appVersion).trim() : null,
        });

        return successResponse({ registered: true });
    } catch (error) {
        console.error("Device register error:", error);
        return errorResponse("Registration failed", 500);
    }
}
