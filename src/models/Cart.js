import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 99,
    },
    // Snapshot of price at time of adding (in cents)
    // Actual price is re-validated at checkout
    priceSnapshot: {
        type: Number,
        default: 0,
    },
});

const CartSchema = new mongoose.Schema(
    {
        // For logged-in users
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        // For guest users (stored in cookie)
        sessionId: {
            type: String,
            default: null,
            index: true,
        },
        items: [CartItemSchema],
        // Calculated totals (updated on each cart modification)
        subtotal: {
            type: Number,
            default: 0,
        },
        itemCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Ensure a user or session has only one cart
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });
CartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

// Recalculate totals before saving
CartSchema.pre("save", function () {
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.subtotal = this.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
