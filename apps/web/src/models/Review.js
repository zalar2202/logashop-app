import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        userName: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
            index: true,
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
    },
    { timestamps: true }
);

// Prevent multiple reviews from same user on same product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Static method to calculate average rating and review count
ReviewSchema.statics.updateProductStats = async function (productId) {
    const stats = await this.aggregate([
        { $match: { productId, status: "approved" } },
        {
            $group: {
                _id: "$productId",
                reviewCount: { $sum: 1 },
                averageRating: { $avg: "$rating" },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            reviewCount: stats[0].reviewCount,
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
        });
    } else {
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            reviewCount: 0,
            averageRating: 0,
        });
    }
};

// Update stats after save
ReviewSchema.post("save", function () {
    this.constructor.updateProductStats(this.productId);
});

// Update stats after delete (for admins deleting reviews)
ReviewSchema.post("remove", function () {
    this.constructor.updateProductStats(this.productId);
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
