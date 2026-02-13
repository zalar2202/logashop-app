import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a category name."],
            trim: true,
            maxlength: [60, "Name cannot be more than 60 characters"],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            maxlength: [500, "Description cannot be more than 500 characters"],
        },
        image: {
            type: String,
            required: false,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true,
        },
        ancestors: [
            {
                _id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
                name: String,
                slug: String,
            },
        ],
        level: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        metaTitle: String,
        metaDescription: String,
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate ancestors and level if parentId is present
CategorySchema.pre("save", async function () {
    if (this.isModified("parentId")) {
        if (this.parentId) {
            const parent = await mongoose.model("Category").findById(this.parentId);
            if (parent) {
                this.ancestors = [
                    ...parent.ancestors,
                    { _id: parent._id, name: parent.name, slug: parent.slug },
                ];
                this.level = parent.level + 1;
            } else {
                // If parent not found, reset (fallback)
                this.parentId = null;
                this.ancestors = [];
                this.level = 0;
            }
        } else {
            this.ancestors = [];
            this.level = 0;
        }
    }
});

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
