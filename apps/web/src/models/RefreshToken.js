import mongoose from "mongoose";
import crypto from "crypto";

const REFRESH_EXPIRY_DAYS = 7;

const RefreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },
        deviceId: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

RefreshTokenSchema.index({ userId: 1, deviceId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function generateOpaqueToken() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new refresh token for user. Returns { token, doc }.
 */
RefreshTokenSchema.statics.createForUser = async function (userId, deviceId = null) {
    const token = generateOpaqueToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const doc = await this.create({ userId, tokenHash, deviceId, expiresAt });
    return { token, doc };
};

/**
 * Find refresh token by plain token. Returns doc (with userId) or null. Caller must check expiresAt.
 */
RefreshTokenSchema.statics.findByToken = async function (token) {
    if (!token || typeof token !== "string") return null;
    const tokenHash = hashToken(token.trim());
    const doc = await this.findOne({ tokenHash }).exec();
    return doc;
};

const RefreshToken =
    mongoose.models.RefreshToken || mongoose.model("RefreshToken", RefreshTokenSchema);

export default RefreshToken;
