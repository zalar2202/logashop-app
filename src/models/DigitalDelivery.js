import mongoose from "mongoose";

const DigitalDeliverySchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductVariant",
            default: null,
        },

        // Security
        downloadToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        // Limits
        downloadCount: {
            type: Number,
            default: 0,
        },
        maxDownloads: {
            type: Number,
            default: null, // null = unlimited
        },
        expiresAt: {
            type: Date,
            default: null, // null = never expires
        },

        status: {
            type: String,
            enum: ["active", "revoked", "expired"],
            default: "active",
        },

        // Snapshot of file details
        fileName: String,
        fileUrl: String, // Internal path or external URL
    },
    { timestamps: true }
);

// Method to check if download is valid
DigitalDeliverySchema.methods.isValid = function () {
    if (this.status !== "active") return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    if (this.maxDownloads !== null && this.downloadCount >= this.maxDownloads) return false;
    return true;
};

export default mongoose.models.DigitalDelivery ||
    mongoose.model("DigitalDelivery", DigitalDeliverySchema);
