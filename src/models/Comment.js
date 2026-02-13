import mongoose from 'mongoose';

/**
 * Comment Schema
 * 
 * Handles blog post comments with moderation and spam protection.
 */
const CommentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BlogPost',
            required: true,
        },
        authorName: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        authorEmail: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'spam', 'trash'],
            default: 'pending',
        },
        isAdminComment: {
            type: Boolean,
            default: false,
        },
        // Anti-spam / Metadata
        ip: String,
        userAgent: String,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CommentSchema.index({ post: 1, status: 1, createdAt: -1 });
CommentSchema.index({ status: 1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export default Comment;
