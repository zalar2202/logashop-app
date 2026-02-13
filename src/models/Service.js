import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        package: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Package', 
            required: true 
        },
        status: { 
            type: String, 
            enum: ['active', 'expired', 'pending', 'suspended', 'cancelled'], 
            default: 'active' 
        },
        startDate: { 
            type: Date, 
            default: Date.now 
        },
        endDate: { 
            type: Date 
        },
        price: {
            type: Number,
            required: true
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'quarterly', 'semi-annually', 'annually', 'one-time'],
            default: 'monthly'
        },
        autoRenew: {
            type: Boolean,
            default: true
        },
        notes: {
            type: String
        },
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice'
        },
        properties: {
            type: Map,
            of: String
        }
    },
    { timestamps: true }
);

ServiceSchema.index({ user: 1, status: 1 });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
