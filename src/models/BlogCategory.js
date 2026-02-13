import mongoose from 'mongoose';

/**
 * Blog Category Schema
 * 
 * Hierarchical categories for blog posts with:
 * - Parent-child relationships
 * - SEO fields
 * - Custom ordering
 */
const BlogCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BlogCategory',
            default: null,
        },
        featuredImage: {
            type: String,
        },
        color: {
            type: String,
            default: '#6366f1', // Indigo as default
        },
        icon: {
            type: String, // Lucide icon name
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        
        // SEO
        seo: {
            metaTitle: { type: String },
            metaDescription: { type: String },
        },
        
        // Post count (denormalized for performance)
        postCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
BlogCategorySchema.index({ slug: 1 });
BlogCategorySchema.index({ parent: 1 });
BlogCategorySchema.index({ order: 1 });
BlogCategorySchema.index({ isActive: 1 });

// Virtual for full URL
BlogCategorySchema.virtual('url').get(function () {
    return `/blog/category/${this.slug}`;
});

// Virtual for children
BlogCategorySchema.virtual('children', {
    ref: 'BlogCategory',
    localField: '_id',
    foreignField: 'parent',
});

/**
 * Static method to generate unique slug
 */
BlogCategorySchema.statics.generateSlug = async function (name, existingId = null) {
    let slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    const query = { slug };
    if (existingId) {
        query._id = { $ne: existingId };
    }
    
    let existing = await this.findOne(query);
    let counter = 1;
    const originalSlug = slug;
    
    while (existing) {
        slug = `${originalSlug}-${counter}`;
        query.slug = slug;
        existing = await this.findOne(query);
        counter++;
    }
    
    return slug;
};

/**
 * Static method to get category tree
 */
BlogCategorySchema.statics.getTree = async function () {
    const categories = await this.find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .lean();
    
    // Build tree structure
    const categoryMap = new Map();
    const roots = [];
    
    categories.forEach(cat => {
        cat.children = [];
        categoryMap.set(cat._id.toString(), cat);
    });
    
    categories.forEach(cat => {
        if (cat.parent) {
            const parent = categoryMap.get(cat.parent.toString());
            if (parent) {
                parent.children.push(cat);
            } else {
                roots.push(cat);
            }
        } else {
            roots.push(cat);
        }
    });
    
    return roots;
};

/**
 * Update post count for a category
 */
BlogCategorySchema.statics.updatePostCount = async function (categoryId) {
    const BlogPost = mongoose.model('BlogPost');
    const count = await BlogPost.countDocuments({ 
        category: categoryId, 
        status: 'published' 
    });
    
    return this.findByIdAndUpdate(categoryId, { postCount: count });
};

// Prevent model recompilation
const BlogCategory = mongoose.models.BlogCategory || mongoose.model('BlogCategory', BlogCategorySchema);

export default BlogCategory;
