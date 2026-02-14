import mongoose from "mongoose";

const ProductVariantSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        // Attributes: e.g., { "Color": "Red", "Size": "L" }
        attributes: {
            type: Map,
            of: String,
        },
        // Overrides
        price: {
            type: Number, // If null, use product basePrice
            default: null,
        },
        salePrice: {
            type: Number,
            default: null,
        },
        stockQuantity: {
            type: Number,
            default: 0,
            required: true,
        },
        weight: Number,
        image: String, // Specific image for this variant

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.ProductVariant ||
    mongoose.model("ProductVariant", ProductVariantSchema);
