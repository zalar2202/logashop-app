import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
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
    name: { type: String, required: true },
    slug: { type: String },
    sku: { type: String },
    image: { type: String },
    price: { type: Number, required: true }, // unit price in cents
    quantity: { type: Number, required: true, min: 1 },
    variantInfo: { type: mongoose.Schema.Types.Mixed, default: null },
    lineTotal: { type: Number, required: true }, // price * quantity
});

const AddressSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        company: { type: String, trim: true, default: "" },
        address1: { type: String, required: true, trim: true },
        address2: { type: String, trim: true, default: "" },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        zipCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, default: "US" },
        phone: { type: String, trim: true, default: "" },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        // Order Number (human-friendly, auto-generated)
        orderNumber: {
            type: String,
            unique: true,
            index: true,
        },

        // Customer
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        // Guest checkout
        guestEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: null,
        },
        // Tracking code for guest orders
        trackingCode: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        // Items snapshot at time of order
        items: [OrderItemSchema],

        // Addresses
        shippingAddress: AddressSchema,
        billingAddress: AddressSchema,
        billingSameAsShipping: {
            type: Boolean,
            default: true,
        },

        // Totals (all in cents)
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountDetails: {
            code: { type: String, uppercase: true, default: null },
            type: { type: String, enum: ["percentage", "fixed"], default: null },
            value: { type: Number, default: 0 },
        },
        total: { type: Number, required: true },

        // Shipping
        shippingMethod: {
            type: String,
            enum: ["standard", "express", "overnight", "pickup"],
            default: "standard",
        },
        shippingMethodLabel: { type: String, default: "Standard Shipping" },

        // Status
        status: {
            type: String,
            enum: [
                "pending_payment",
                "processing",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled",
                "refunded",
            ],
            default: "pending_payment",
            index: true,
        },

        // Payment
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["stripe", "paypal", "cod", "bank_transfer"],
            default: null,
        },
        paymentIntentId: { type: String, default: null }, // Stripe payment intent
        paidAt: { type: Date, default: null },

        // Notes
        customerNote: { type: String, trim: true, default: "" },
        adminNote: { type: String, trim: true, default: "" },

        // Timestamps for status changes
        confirmedAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        cancelledAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Generate order number before saving
OrderSchema.pre("save", async function () {
    if (!this.orderNumber) {
        const date = new Date();
        const prefix = `LS${date.getFullYear().toString().slice(-2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
        const count = await mongoose.models.Order.countDocuments();
        this.orderNumber = `${prefix}-${String(count + 1).padStart(5, "0")}`;
    }
});

// Generate tracking code for guest orders
OrderSchema.pre("save", function () {
    if (!this.userId && !this.trackingCode) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 12; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.trackingCode = code;
    }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
