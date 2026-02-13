import mongoose from 'mongoose';

/**
 * Media Schema
 * 
 * Centralized media library for:
 * - Blog post images
 * - Featured images
 * - Content attachments
 * 
 * Supports organization with folders and tags
 */
const MediaSchema = new mongoose.Schema(
    {
        // File Information
        filename: {
            type: String,
            required: [true, 'Filename is required'],
        },
        originalName: {
            type: String,
            required: [true, 'Original filename is required'],
        },
        url: {
            type: String,
            required: [true, 'URL is required'],
        },
        path: {
            type: String,
        },
        
        // File Metadata
        mimeType: {
            type: String,
            required: true,
        },
        size: {
            type: Number, // In bytes
            required: true,
        },
        dimensions: {
            width: { type: Number },
            height: { type: Number },
        },
        
        // Organization
        folder: {
            type: String,
            default: 'general',
            enum: ['general', 'blog', 'avatars', 'documents', 'receipts'],
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        
        // Alt Text for SEO/Accessibility
        alt: {
            type: String,
            trim: true,
        },
        caption: {
            type: String,
            trim: true,
        },
        
        // Uploader
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        
        // Usage tracking
        usageCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
MediaSchema.index({ folder: 1 });
MediaSchema.index({ mimeType: 1 });
MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ createdAt: -1 });

// Text index for search
MediaSchema.index({ 
    originalName: 'text', 
    alt: 'text', 
    caption: 'text',
    tags: 'text' 
});

/**
 * Virtual for file type category
 */
MediaSchema.virtual('type').get(function () {
    if (this.mimeType.startsWith('image/')) return 'image';
    if (this.mimeType.startsWith('video/')) return 'video';
    if (this.mimeType.startsWith('audio/')) return 'audio';
    if (this.mimeType === 'application/pdf') return 'pdf';
    return 'document';
});

/**
 * Virtual for human-readable file size
 */
MediaSchema.virtual('sizeFormatted').get(function () {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

/**
 * Static method to get media by folder with pagination
 */
MediaSchema.statics.getByFolder = function (folder, options = {}) {
    const { limit = 24, skip = 0, search = '' } = options;
    
    const query = { folder };
    
    if (search) {
        query.$text = { $search: search };
    }
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Instance method to increment usage
 */
MediaSchema.methods.incrementUsage = async function () {
    this.usageCount += 1;
    return this.save({ validateBeforeSave: false });
};

// Prevent model recompilation
const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);

export default Media;
