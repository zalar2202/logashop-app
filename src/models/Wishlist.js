import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
    {
        // For logged-in users
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        // For guest wishlists
        sessionId: {
            type: String,
            index: true,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
);

// One wishlist per user or session
WishlistSchema.index({ userId: 1 }, { unique: true, sparse: true });
WishlistSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
