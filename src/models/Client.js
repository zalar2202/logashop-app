import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Client/Company name is required'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        linkedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'prospective'],
            default: 'active',
        },
        address: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

export default Client;
