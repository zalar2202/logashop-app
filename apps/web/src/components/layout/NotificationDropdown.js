"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    deleteNotificationById,
    selectNotifications,
    selectUnreadCount,
    selectNotificationsLoading,
} from "@/features/notifications/notificationsSlice";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

/**
 * NotificationDropdown Component
 *
 * Bell icon with badge showing unread count.
 * Dropdown displays recent 5 notifications.
 * Click notification to mark as read and navigate to action URL.
 */
export const NotificationDropdown = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const notifications = useAppSelector(selectNotifications);
    const unreadCount = useAppSelector(selectUnreadCount);
    const loading = useAppSelector(selectNotificationsLoading);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count on mount and every 30 seconds
    useEffect(() => {
        dispatch(fetchUnreadCount());

        const interval = setInterval(() => {
            dispatch(fetchUnreadCount());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [dispatch]);

    // Fetch notifications and unread count when dropdown opens (always refetch to show new ones)
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications({ page: 1, limit: 5, read: null }));
            dispatch(fetchUnreadCount());
        }
    }, [isOpen, dispatch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.read) {
            await dispatch(markNotificationAsRead(notification._id));
            dispatch(fetchUnreadCount()); // Update badge count
        }

        // Close dropdown
        setIsOpen(false);

        // Navigate to action URL if exists
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    // Get notification icon and color based on type
    const getNotificationStyle = (type) => {
        const styles = {
            success: "bg-[var(--color-success-surface)] text-[var(--color-success-foreground)]",
            error: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
            warning: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
            info: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            system: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
            admin: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
        };
        return styles[type] || styles.info;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg transition-colors hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <Bell className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} />

                {/* Badge with unread count */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-lg border overflow-hidden z-50"
                    style={{
                        backgroundColor: "var(--color-card-bg)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-4 py-3 border-b flex items-center justify-between"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <h3
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            // Loading state
                            <div className="p-8 text-center">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                                    style={{ borderColor: "var(--color-primary)" }}
                                ></div>
                                <p
                                    className="mt-2 text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Loading notifications...
                                </p>
                            </div>
                        ) : notifications.length === 0 ? (
                            // Empty state
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p
                                    className="font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    No notifications yet
                                </p>
                                <p
                                    className="text-sm mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    You&apos;re all caught up!
                                </p>
                            </div>
                        ) : (
                            // Notifications
                            notifications.slice(0, 5).map((notification) => (
                                <button
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="w-full px-4 py-3 border-b transition-colors text-left"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: !notification.read
                                            ? "var(--color-background-secondary)"
                                            : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "var(--color-hover)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = !notification.read
                                            ? "var(--color-background-secondary)"
                                            : "transparent";
                                    }}
                                >
                                    <div className="flex gap-3">
                                        {/* Type indicator */}
                                        <div
                                            className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                                !notification.read
                                                    ? "bg-blue-500"
                                                    : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                        ></div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4
                                                    className={`text-sm font-medium truncate ${
                                                        !notification.read ? "font-semibold" : ""
                                                    }`}
                                                    style={{ color: "var(--color-text-primary)" }}
                                                >
                                                    {notification.title}
                                                </h4>
                                                <span
                                                    className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded ${getNotificationStyle(
                                                        notification.type
                                                    )}`}
                                                >
                                                    {notification.type}
                                                </span>
                                            </div>
                                            <div
                                                className="text-sm line-clamp-2"
                                                style={{ color: "var(--color-text-secondary)" }}
                                                dangerouslySetInnerHTML={{ __html: notification.message }}
                                            />
                                            <p
                                                className="text-xs mt-1"
                                                style={{ color: "var(--color-text-tertiary)" }}
                                            >
                                                {formatDistanceToNow(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div
                            className="px-4 py-3 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <Link
                                href="/panel/admin/notifications"
                                onClick={() => setIsOpen(false)}
                                className="block text-center text-sm font-medium hover:underline"
                                style={{ color: "var(--color-primary)" }}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
