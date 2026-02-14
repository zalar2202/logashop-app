import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        label: {
            type: String,
            trim: true,
            default: "", // e.g., "Home", "Office"
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        company: {
            type: String,
            trim: true,
            default: "",
        },
        address1: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        address2: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
        },
        zipCode: {
            type: String,
            required: [true, "ZIP code is required"],
            trim: true,
        },
        country: {
            type: String,
            required: true,
            default: "US",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Ensure only one default address per user
AddressSchema.pre("save", async function () {
    if (this.isDefault) {
        await mongoose.models.Address.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
});

export default mongoose.models.Address || mongoose.model("Address", AddressSchema);
