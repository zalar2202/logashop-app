import mongoose from "mongoose";

const SOURCES = ["homepage", "footer"];
const STATUSES = ["subscribed", "unsubscribed"];

const SubscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                "Please provide a valid email address",
            ],
        },
        status: {
            type: String,
            enum: STATUSES,
            default: "subscribed",
        },
        source: {
            type: String,
            enum: SOURCES,
            default: "homepage",
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
        unsubscribedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

SubscriberSchema.index({ email: 1 }, { unique: true });
SubscriberSchema.index({ status: 1 });

SubscriberSchema.statics.SOURCES = SOURCES;
SubscriberSchema.statics.STATUSES = STATUSES;

const Subscriber = mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);
export default Subscriber;
