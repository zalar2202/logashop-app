import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Package name is required'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['design', 'development', 'deployment', 'maintenance', 'bundle', 'hosting', 'seo', 'marketing'],
            required: [true, 'Category is required'],
        },
        startingPrice: {
            type: String,
            required: [true, 'Starting price is required'],
        },
        price: {
            type: Number,
            default: 0,
        },
        priceRange: {
            type: String,
            trim: true,
        },
        features: [
            {
                type: String,
                trim: true,
            },
        ],
        deliveryTime: {
            type: String,
            trim: true,
        },
        revisions: {
            type: String,
            trim: true,
        },
        badge: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            default: 'Package',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Package = mongoose.models.Package || mongoose.model('Package', PackageSchema);

export default Package;
