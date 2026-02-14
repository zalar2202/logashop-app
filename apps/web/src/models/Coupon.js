import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        discountType: {
            type: String,
            required: true,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minPurchase: {
            type: Number,
            default: 0, // in cents
        },
        maxDiscount: {
            type: Number,
            default: null, // in cents, mainly for percentage discounts
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },
        usageLimit: {
            type: Number,
            default: null, // total overall usages
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        userLimit: {
            type: Number,
            default: 1, // usages per user
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
    },
    { timestamps: true }
);

// Helper method to check if coupon is valid
CouponSchema.methods.isValid = function (purchaseAmount = 0) {
    const now = new Date();

    // Check status
    if (!this.isActive) return { valid: false, error: "Coupon is inactive" };

    // Check dates
    if (this.startDate && now < this.startDate) {
        return { valid: false, error: "Coupon is not yet active" };
    }
    if (this.endDate && now > this.endDate) {
        return { valid: false, error: "Coupon has expired" };
    }

    // Check usage limits
    if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
        return { valid: false, error: "Coupon usage limit reached" };
    }

    // Check minimum purchase
    if (purchaseAmount < this.minPurchase) {
        return {
            valid: false,
            error: `Minimum purchase of $${(this.minPurchase / 100).toFixed(2)} required`,
        };
    }

    return { valid: true };
};

// Helper method to calculate discount
CouponSchema.methods.calculateDiscount = function (amount) {
    let discount = 0;

    if (this.discountType === "percentage") {
        discount = Math.floor(amount * (this.discountValue / 100));
        if (this.maxDiscount !== null && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.discountValue;
    }

    // Ensure discount doesn't exceed amount
    return Math.min(discount, amount);
};

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
