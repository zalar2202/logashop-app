import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Promotion title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Promotion description is required'],
            trim: true,
        },
        discountCode: {
            type: String,
            trim: true,
            uppercase: true,
        },
        discountAmount: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);

export default Promotion;
