import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        invoice: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Invoice' 
        },
        amount: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        currency: { 
            type: String, 
            default: 'USD' 
        },
        method: { 
            type: String, 
            enum: ['cash', 'bank_transfer', 'credit_card', 'paypal', 'crypto', 'check', 'other'], 
            default: 'bank_transfer' 
        },
        status: { 
            type: String, 
            enum: ['pending', 'completed', 'failed', 'refunded'], 
            default: 'completed' 
        },
        reference: { 
            type: String, 
            trim: true 
        },
        notes: { 
            type: String 
        },
        paymentDate: { 
            type: Date, 
            default: Date.now 
        },
        recordedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }
    },
    { timestamps: true }
);

PaymentSchema.index({ userId: 1, paymentDate: -1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
