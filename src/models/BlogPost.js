import mongoose from 'mongoose';

/**
 * Blog Post Schema
 * 
 * A comprehensive blog post model with:
 * - Rich content support (HTML from editor)
 * - Full SEO optimization fields
 * - Categories and tags
 * - Featured images
 * - Publishing workflow (draft, scheduled, published)
 * - Reading time estimation
 * - View tracking
 */
const BlogPostSchema = new mongoose.Schema(
    {
        // Core Content
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'],
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: [500, 'Excerpt cannot exceed 500 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        
        // Featured Media
        featuredImage: {
            url: { type: String },
            alt: { type: String },
            caption: { type: String },
        },
        
        // Organization
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BlogCategory',
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        
        // Author
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        // Publishing
        status: {
            type: String,
            enum: ['draft', 'scheduled', 'published', 'archived'],
            default: 'draft',
        },
        publishedAt: {
            type: Date,
        },
        scheduledFor: {
            type: Date,
        },
        
        // SEO Fields
        seo: {
            metaTitle: {
                type: String,
                maxlength: [70, 'Meta title should not exceed 70 characters'],
            },
            metaDescription: {
                type: String,
                maxlength: [160, 'Meta description should not exceed 160 characters'],
            },
            metaKeywords: [{
                type: String,
                trim: true,
            }],
            focusKeyword: {
                type: String,
                trim: true,
            },
            canonicalUrl: {
                type: String,
            },
            ogImage: {
                type: String, // Open Graph image URL
            },
            noIndex: {
                type: Boolean,
                default: false,
            },
            noFollow: {
                type: Boolean,
                default: false,
            },
            schema: {
                type: String, // Custom JSON-LD schema
            },
        },
        
        // Settings
        showAuthor: {
            type: Boolean,
            default: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        readingTime: {
            type: Number, // In minutes
            default: 1,
        },
        
        // Settings
        allowComments: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for performance
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ author: 1 });
BlogPostSchema.index({ 'seo.metaKeywords': 1 });

// Text index for search
BlogPostSchema.index({ 
    title: 'text', 
    excerpt: 'text', 
    content: 'text',
    tags: 'text' 
});

/**
 * Pre-save middleware to calculate reading time
 */
BlogPostSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        // Strip HTML tags and calculate reading time (200 words per minute)
        const plainText = this.content.replace(/<[^>]*>/g, '');
        const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
        this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    
    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    next();
});

/**
 * Static method to generate unique slug
 */
BlogPostSchema.statics.generateSlug = async function (title, existingId = null) {
    let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    // Check for existing slug
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
 * Static method to get published posts
 */
BlogPostSchema.statics.getPublished = function (options = {}) {
    const { limit = 10, skip = 0, category = null, tag = null } = options;
    
    const query = {
        status: 'published',
        publishedAt: { $lte: new Date() },
    };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    
    return this.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug')
        .sort({ isPinned: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Instance method to increment view count
 */
BlogPostSchema.methods.incrementViews = async function () {
    this.viewCount += 1;
    return this.save({ validateBeforeSave: false });
};

// Virtual for full URL
BlogPostSchema.virtual('url').get(function () {
    return `/blog/${this.slug}`;
});

// Prevent model recompilation
const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);

export default BlogPost;
