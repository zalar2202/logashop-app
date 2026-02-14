/**
 * Notifications Redux Slice
 * 
 * Manages notification state including:
 * - List of notifications
 * - Unread count
 * - Pagination
 * - Loading and error states
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '@/services/notification.service';

/**
 * Initial State
 */
const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    },
    filters: {
        read: null, // null, true, false
        type: 'all', // all, system, admin, info, warning, success, error
    },
};

/**
 * Async Thunks
 */

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async ({ page = 1, limit = 20, read = null, type = null } = {}, { rejectWithValue }) => {
        try {
            const response = await notificationService.getNotifications({
                page,
                limit,
                read,
                type,
            });
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
        }
    }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const count = await notificationService.getUnreadCount();
            return count;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch unread count');
        }
    }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationService.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
        }
    }
);

// Mark all as read
export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.markAllAsRead();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read');
        }
    }
);

// Delete notification
export const deleteNotificationById = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationService.deleteNotification(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete notification');
        }
    }
);

// Delete all read
export const deleteAllReadNotifications = createAsyncThunk(
    'notifications/deleteAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.deleteAllRead();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete read notifications');
        }
    }
);

/**
 * Notifications Slice
 */
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Set filters
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },

        // Reset state
        resetNotifications: (state) => {
            state.notifications = [];
            state.pagination = initialState.pagination;
            state.error = null;
        },

        // Add new notification (for real-time via Socket.io)
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },

        // Update notification (for real-time)
        updateNotification: (state, action) => {
            const index = state.notifications.findIndex(
                (n) => n._id === action.payload._id
            );
            if (index !== -1) {
                state.notifications[index] = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch unread count
        builder
            .addCase(fetchUnreadCount.pending, (state) => {
                // Don't set loading for count (to avoid UI flicker)
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(fetchUnreadCount.rejected, (state, action) => {
                // Silent fail for count
                console.error('Failed to fetch unread count:', action.payload);
            });

        // Mark as read
        builder
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(
                    (n) => n._id === action.payload
                );
                if (notification && !notification.read) {
                    notification.read = true;
                    notification.readAt = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });

        // Mark all as read
        builder
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((n) => ({
                    ...n,
                    read: true,
                    readAt: n.readAt || new Date().toISOString(),
                }));
                state.unreadCount = 0;
            });

        // Delete notification
        builder
            .addCase(deleteNotificationById.fulfilled, (state, action) => {
                const notification = state.notifications.find(
                    (n) => n._id === action.payload
                );
                if (notification && !notification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter(
                    (n) => n._id !== action.payload
                );
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            });

        // Delete all read
        builder
            .addCase(deleteAllReadNotifications.fulfilled, (state) => {
                state.notifications = state.notifications.filter((n) => !n.read);
                const deletedCount = state.pagination.total - state.notifications.length;
                state.pagination.total = state.notifications.length;
                console.log(`Deleted ${deletedCount} read notifications`);
            });
    },
});

/**
 * Actions
 */
export const {
    setFilters,
    resetNotifications,
    addNotification,
    updateNotification,
} = notificationsSlice.actions;

/**
 * Selectors
 */
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsPagination = (state) => state.notifications.pagination;
export const selectNotificationsFilters = (state) => state.notifications.filters;

/**
 * Reducer
 */
export default notificationsSlice.reducer;

