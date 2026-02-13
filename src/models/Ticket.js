import mongoose from "mongoose";

const TicketMessageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        attachments: [{ name: String, url: String }],
        isInternal: { type: Boolean, default: false }, // Internal notes not visible to customer
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const TicketSchema = new mongoose.Schema(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: [
                "technical",
                "billing",
                "general",
                "feature_request",
                "bug_report",
                "account",
                "audit",
                "consultation",
            ],
            default: "general",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        status: {
            type: String,
            enum: [
                "open",
                "in_progress",
                "waiting_customer",
                "waiting_staff",
                "resolved",
                "closed",
            ],
            default: "open",
        },

        // People
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },

        // Thread
        messages: [TicketMessageSchema],

        // Timestamps
        lastResponseAt: { type: Date },
        resolvedAt: { type: Date },
        closedAt: { type: Date },

        // Metadata
        tags: [{ type: String }],
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
    },
    { timestamps: true }
);

// Generate ticket number
TicketSchema.pre("validate", async function (next) {
    if (!this.ticketNumber) {
        const count = await mongoose.model("Ticket").countDocuments();
        this.ticketNumber = `TKT-${String(count + 1).padStart(5, "0")}`;
    }
    next();
});

// Indexes (ticketNumber already indexed via unique: true on the field)
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ createdBy: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
