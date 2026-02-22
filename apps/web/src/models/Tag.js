import mongoose from "mongoose";

/**
 * Normalize tag name for consistency (lowercase, trim, collapse spaces to hyphens)
 */
function normalizeTagName(name) {
    if (!name || typeof name !== "string") return "";
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") // Collapse multiple hyphens
        .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}

const POST_TYPES = ["product", "post", "portfolio"];

const TagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tag name is required"],
            trim: true,
            lowercase: true,
            index: true,
        },
        slug: {
            type: String,
            lowercase: true,
            index: true,
        },
        postType: {
            type: String,
            enum: POST_TYPES,
            default: "product",
            index: true,
        },
    },
    { timestamps: true }
);

// Unique per name + postType (e.g. "premium" can exist for product and post separately)
TagSchema.index({ name: 1, postType: 1 }, { unique: true });

// Auto-set slug from name before save
TagSchema.pre("save", function (next) {
    if (this.isModified("name") && this.name) {
        this.slug = normalizeTagName(this.name);
    }
    next();
});

TagSchema.statics.normalizeName = normalizeTagName;
TagSchema.statics.POST_TYPES = POST_TYPES;

/**
 * Ensure each tag exists in the collection (create if not)
 * @param {string[]} tagNames - Array of tag name strings
 * @param {string} [postType='product'] - One of: product, post, portfolio
 */
TagSchema.statics.syncTags = async function (tagNames, postType = "product") {
    if (!tagNames || !Array.isArray(tagNames)) return;
    if (!POST_TYPES.includes(postType)) postType = "product";
    const Tag = this;
    for (const raw of tagNames) {
        const name = normalizeTagName(raw);
        if (!name) continue;
        // Migrate legacy tag (no postType) to this postType
        const legacy = await Tag.findOne({ name, postType: { $exists: false } });
        if (legacy) {
            await Tag.updateOne({ _id: legacy._id }, { $set: { postType } });
            continue;
        }
        await Tag.findOneAndUpdate(
            { name, postType },
            { $setOnInsert: { name, slug: name, postType } },
            { upsert: true }
        );
    }
};

/** @deprecated Use syncTags(tagNames, 'product') instead */
TagSchema.statics.syncFromProductTags = async function (tagNames) {
    return this.syncTags(tagNames, "product");
};

const Tag = mongoose.models.Tag || mongoose.model("Tag", TagSchema);
export default Tag;
