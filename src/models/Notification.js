import mongoose from 'mongoose';

/**
 * Notification Schema
 * 
 * Stores all notifications for users (system-generated, admin-sent, etc.)
 * Supports push notifications, in-app notifications, and notification history.
 * 
 * Features:
 * - Multiple notification types (system, admin, info, warning, success, error)
 * - Optional action URL (clickable notifications)
 * - Read/unread tracking with timestamps
 * - Delivery status tracking (Socket.io + FCM)
 * - Auto-expiration support
 * - Metadata for additional context
 */
const NotificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient is required'],
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // null for system notifications
        },
        type: {
            type: String,
            enum: ['system', 'admin', 'manager', 'info', 'warning', 'success', 'error', 'marketing'],
            default: 'info',
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },
        actionUrl: {
            type: String,
            trim: true,
            default: null,
        },
        actionLabel: {
            type: String,
            trim: true,
            maxlength: [50, 'Action label cannot exceed 50 characters'],
            default: null,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        deliveryStatus: {
            socketDelivered: {
                type: Boolean,
                default: false,
            },
            socketDeliveredAt: {
                type: Date,
                default: null,
            },
            pushDelivered: {
                type: Boolean,
                default: false,
            },
            pushDeliveredAt: {
                type: Date,
                default: null,
            },
            pushError: {
                type: String,
                default: null,
            },
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
    }
);

/**
 * Compound index for efficient queries
 * Most common query: Get user's unread notifications sorted by date
 */
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

/**
 * Index for cleanup queries (expired notifications)
 */
NotificationSchema.index({ expiresAt: 1 }, { sparse: true });

/**
 * Virtual for checking if notification is expired
 */
NotificationSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

/**
 * Instance method: Mark notification as read
 * @returns {Promise<Document>} Updated notification
 */
NotificationSchema.methods.markAsRead = async function () {
    if (this.read) return this; // Already read
    
    this.read = true;
    this.readAt = new Date();
    return await this.save();
};

/**
 * Instance method: Mark notification as unread
 * @returns {Promise<Document>} Updated notification
 */
NotificationSchema.methods.markAsUnread = async function () {
    this.read = false;
    this.readAt = null;
    return await this.save();
};

/**
 * Instance method: Mark as delivered via Socket.io
 * @returns {Promise<Document>} Updated notification
 */
NotificationSchema.methods.markSocketDelivered = async function () {
    this.deliveryStatus.socketDelivered = true;
    this.deliveryStatus.socketDeliveredAt = new Date();
    return await this.save();
};

/**
 * Instance method: Mark as delivered via FCM push
 * @param {string} error - Error message if delivery failed
 * @returns {Promise<Document>} Updated notification
 */
NotificationSchema.methods.markPushDelivered = async function (error = null) {
    this.deliveryStatus.pushDelivered = !error;
    this.deliveryStatus.pushDeliveredAt = new Date();
    if (error) {
        this.deliveryStatus.pushError = error;
    }
    return await this.save();
};

/**
 * Static method: Get unread count for user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<number>} Unread count
 */
NotificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({
        recipient: userId,
        read: false,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });
};

/**
 * Static method: Get user's notifications with pagination and filters
 * @param {ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Notifications with pagination data
 */
NotificationSchema.statics.getUserNotifications = async function (
    userId,
    { page = 1, limit = 20, read = null, type = null, sortBy = 'createdAt', sortOrder = 'desc' } = {}
) {
    const query = {
        recipient: userId,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    };

    // Filter by read status if specified
    if (read !== null) {
        query.read = read === 'true' || read === true;
    }

    // Filter by type if specified
    if (type && type !== 'all') {
        query.type = type;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [notifications, total] = await Promise.all([
        this.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email avatar')
            .lean(),
        this.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        notifications,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};

/**
 * Static method: Delete expired notifications (cron job)
 * @returns {Promise<Object>} Deletion result
 */
NotificationSchema.statics.deleteExpired = async function () {
    return await this.deleteMany({
        expiresAt: { $lte: new Date() },
    });
};

/**
 * Static method: Mark all notifications as read for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Update result
 */
NotificationSchema.statics.markAllAsRead = async function (userId) {
    return await this.updateMany(
        {
            recipient: userId,
            read: false,
        },
        {
            $set: {
                read: true,
                readAt: new Date(),
            },
        }
    );
};

/**
 * Static method: Delete all read notifications for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
NotificationSchema.statics.deleteAllRead = async function (userId) {
    return await this.deleteMany({
        recipient: userId,
        read: true,
    });
};

// Prevent model recompilation in development (Next.js hot reload)
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;

