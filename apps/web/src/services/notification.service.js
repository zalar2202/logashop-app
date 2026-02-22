/**
 * Notification Service Layer
 * 
 * API calls for notification management
 */

import axios from '@/lib/axios';

/**
 * Register FCM token for push notifications
 * 
 * @param {string} token - FCM device token
 * @param {string} device - Device type (web/ios/android)
 * @param {string} browser - Browser name
 * @returns {Promise<Object>}
 */
export const registerFcmToken = async (token, device = 'web', browser = null) => {
    try {
        const response = await axios.post('/api/notifications/fcm-token', {
            token,
            device,
            browser,
        });
        return response.data;
    } catch (error) {
        console.error('Error registering FCM token:', error);
        throw error;
    }
};

/**
 * Remove FCM token
 * 
 * @param {string} token - FCM device token to remove
 * @returns {Promise<Object>}
 */
export const removeFcmToken = async (token) => {
    try {
        const response = await axios.delete('/api/notifications/fcm-token', {
            data: { token },
        });
        return response.data;
    } catch (error) {
        console.error('Error removing FCM token:', error);
        throw error;
    }
};

/**
 * Get user's notifications (paginated)
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {boolean} params.read - Filter by read status
 * @param {string} params.type - Filter by type
 * @returns {Promise<Object>}
 */
export const getNotifications = async ({ page = 1, limit = 20, read = null, type = null } = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (read !== null) {
            params.append('read', read.toString());
        }

        if (type && type !== 'all') {
            params.append('type', type);
        }

        const response = await axios.get(`/api/notifications?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Get unread notification count
 * 
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
    try {
        const response = await axios.get('/api/notifications/count');
        // API returns { success: true, data: { count } }
        return response.data?.data?.count ?? response.data?.count ?? 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 * 
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>}
 */
export const markAsRead = async (notificationId) => {
    try {
        const response = await axios.patch(`/api/notifications/${notificationId}`, {
            read: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark notification as unread
 * 
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>}
 */
export const markAsUnread = async (notificationId) => {
    try {
        const response = await axios.patch(`/api/notifications/${notificationId}`, {
            read: false,
        });
        return response.data;
    } catch (error) {
        console.error('Error marking notification as unread:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 * 
 * @returns {Promise<Object>}
 */
export const markAllAsRead = async () => {
    try {
        const response = await axios.patch('/api/notifications/mark-all-read');
        return response.data;
    } catch (error) {
        console.error('Error marking all as read:', error);
        throw error;
    }
};

/**
 * Delete notification
 * 
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>}
 */
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(`/api/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

/**
 * Delete all read notifications
 * 
 * @returns {Promise<Object>}
 */
export const deleteAllRead = async () => {
    try {
        const response = await axios.delete('/api/notifications/delete-all-read');
        return response.data;
    } catch (error) {
        console.error('Error deleting all read notifications:', error);
        throw error;
    }
};

/**
 * Send notification (admin/manager only)
 * 
 * @param {Object} data - Notification data
 * @param {string} data.recipientType - 'single', 'multiple', 'all', 'role'
 * @param {string|Array<string>} data.recipients - User ID(s) or role
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.type - Notification type
 * @param {string} data.actionUrl - Action URL (optional)
 * @param {string} data.actionLabel - Action label (optional)
 * @returns {Promise<Object>}
 */
export const sendNotification = async (data) => {
    try {
        const response = await axios.post('/api/notifications', data);
        return response.data;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

