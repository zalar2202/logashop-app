import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        amount: { type: Number, required: true }, // Calculated as q * p
    },
    { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["draft", "sent", "partial", "paid", "overdue", "cancelled"],
            default: "draft",
        },
        issueDate: { type: Date, required: true, default: Date.now },
        dueDate: { type: Date, required: true },
        currency: { type: String, enum: ["USD", "EUR", "CAD", "TRY"], default: "USD" },
        baseCurrency: { type: String, default: "USD" }, // Reporting currency
        exchangeRate: { type: Number, default: 1.0 }, // 1 unit of 'currency' = X units of 'baseCurrency'
        totalInBaseCurrency: { type: Number, default: 0 }, // Consolidated value for accounting

        items: [InvoiceItemSchema],

        subtotal: { type: Number, required: true, default: 0 },
        taxRate: { type: Number, default: 0 }, // Percentage
        taxAmount: { type: Number, default: 0 },

        promotion: {
            code: { type: String, uppercase: true },
            discountAmount: { type: Number, default: 0 },
            discountType: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
            discountValue: { type: Number, default: 0 },
        },

        total: { type: Number, required: true, default: 0 },

        notes: { type: String },

        // Installment Details
        paymentPlan: {
            isInstallment: { type: Boolean, default: false },
            downPayment: { type: Number, default: 0 },
            installmentsCount: { type: Number, default: 0 }, // Number of payments after down payment
            installmentAmount: { type: Number, default: 0 }, // Amount per installment
            period: { type: String, enum: ["monthly", "weekly", "quarterly"], default: "monthly" },
            installments: [
                {
                    dueDate: { type: Date },
                    amount: { type: Number },
                    status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
                    paidAt: { type: Date },
                },
            ],
        },

        paymentMethod: {
            type: String,
            enum: ["bank_transfer", "crypto", "cash", "other", "stripe", "credit_card", null],
            default: null,
        },
        paymentNotes: { type: String },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Index for searching
InvoiceSchema.index({ invoiceNumber: 1, status: 1 });
InvoiceSchema.index({ orderId: 1 });
InvoiceSchema.index({ user: 1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
