import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true, // Multi-vendor ready
        },
        name: {
            type: String,
            required: [true, "Please provide a name for this product."],
            trim: true,
            maxlength: [100, "Name cannot be more than 100 characters"],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        sku: {
            type: String,
            required: [true, "Please provide a unique SKU."],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Please provide a description."],
        },
        shortDescription: {
            type: String,
            maxlength: [200, "Short description cannot be more than 200 characters"],
        },
        productType: {
            type: String,
            enum: ["physical", "digital", "bundle"],
            default: "physical",
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please specify a category."],
            index: true,
        },
        tags: [String],
        brand: String,

        // Pricing (stored in CENTS)
        basePrice: {
            type: Number,
            required: [true, "Please provide a price."],
            min: 0,
        },
        salePrice: {
            type: Number,
            min: 0,
        },
        salePriceStart: Date,
        salePriceEnd: Date,

        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            default: "draft",
            index: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Inventory
        trackInventory: {
            type: Boolean,
            default: true,
        },
        stockQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
        },
        allowBackorder: {
            type: Boolean,
            default: false,
        },

        // Physical Specs
        weight: {
            type: Number, // in grams
            default: 0,
        },
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            unit: {
                type: String,
                enum: ["cm", "in"],
                default: "cm",
            },
        },

        // Digital Specs
        digitalFile: {
            url: String, // Protected S3/local link
            fileName: String,
            fileSize: Number, // bytes
            downloadLimit: Number,
            expiryDays: Number,
        },

        // Product Options (e.g., used to generate/validate variants)
        options: [
            {
                name: String, // "Color"
                values: [String], // ["Red", "Blue"]
            },
        ],

        // Images are stored here for simple products, or can be overridden by variants
        images: [
            {
                url: String,
                alt: String,
                isPrimary: Boolean,
                sortOrder: Number,
            },
        ],

        // SEO
        metaTitle: String,
        metaDescription: String,

        // Stats
        totalSold: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },

        deletedAt: { type: Date, default: null }, // Soft delete
    },
    {
        timestamps: true,
    }
);

// Compound index for active products in a category
ProductSchema.index({ categoryId: 1, status: 1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
