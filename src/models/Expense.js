import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        category: { 
            type: String, 
            enum: ['hosting', 'domain', 'software', 'marketing', 'salary', 'office', 'other'],
            default: 'other'
        },
        date: { type: Date, required: true, default: Date.now },
        status: { 
            type: String, 
            enum: ['paid', 'pending'], 
            default: 'paid' 
        },
        recurring: { type: Boolean, default: false },
        frequency: { 
            type: String, 
            enum: ['monthly', 'yearly', null], 
            default: null 
        },
        notes: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
