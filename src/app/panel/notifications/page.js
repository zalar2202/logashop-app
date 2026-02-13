"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    deleteAllReadNotifications,
    setFilters,
    selectNotifications,
    selectUnreadCount,
    selectNotificationsLoading,
    selectNotificationsPagination,
    selectNotificationsFilters,
} from "@/features/notifications/notificationsSlice";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { formatDistanceToNow, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Notifications Page
 *
 * Full notification management interface with:
 * - Tabs: All / Unread / Read
 * - Filter by type
 * - Pagination
 * - Mark as read / Mark all as read
 * - Delete notification / Delete all read
 */
export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const notifications = useAppSelector(selectNotifications);
    const unreadCount = useAppSelector(selectUnreadCount);
    const loading = useAppSelector(selectNotificationsLoading);
    const pagination = useAppSelector(selectNotificationsPagination);
    const filters = useAppSelector(selectNotificationsFilters);

    const [activeTab, setActiveTab] = useState("all"); // all, unread, read
    const [selectedType, setSelectedType] = useState("all");

    // Fetch notifications on mount and when filters/pagination change
    useEffect(() => {
        const readFilter = activeTab === "all" ? null : activeTab === "unread" ? false : true;
        const typeFilter = selectedType === "all" ? null : selectedType;

        dispatch(
            fetchNotifications({
                page: pagination.page,
                limit: 20,
                read: readFilter,
                type: typeFilter,
            })
        );

        dispatch(fetchUnreadCount());
    }, [activeTab, selectedType, pagination.page, dispatch]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        dispatch(setFilters({ read: tab === "all" ? null : tab === "unread" ? false : true }));
    };

    // Handle type filter change
    const handleTypeChange = (type) => {
        setSelectedType(type);
        dispatch(setFilters({ type: type === "all" ? null : type }));
    };

    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("Marked as read");
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    // Handle delete notification
    const handleDelete = async (notificationId) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;

        try {
            await dispatch(deleteNotificationById(notificationId)).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("Notification deleted");
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    // Handle delete all read
    const handleDeleteAllRead = async () => {
        if (!confirm("Are you sure you want to delete all read notifications?")) return;

        try {
            await dispatch(deleteAllReadNotifications()).unwrap();
            toast.success("All read notifications deleted");
        } catch (error) {
            toast.error("Failed to delete notifications");
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Pagination state is managed by Redux, just fetch with new page
        dispatch(
            fetchNotifications({
                page: newPage,
                limit: 20,
                read: activeTab === "all" ? null : activeTab === "unread" ? false : true,
                type: selectedType === "all" ? null : selectedType,
            })
        );
    };

    // Get badge variant for notification type
    const getTypeVariant = (type) => {
        const variants = {
            success: "success",
            error: "danger",
            warning: "warning",
            info: "primary",
            system: "secondary",
            admin: "secondary",
        };
        return variants[type] || "primary";
    };

    return (
        <ContentWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Notifications
                        </h1>
                        <p
                            className="text-sm mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Stay updated with all your notifications
                            {unreadCount > 0 && ` • ${unreadCount} unread`}
                        </p>
                    </div>

                    {/* Actions */}
                    {notifications.length > 0 && (
                        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
                            {unreadCount > 0 && (
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    icon={<CheckCheck className="w-4 h-4" />}
                                >
                                    Mark all read
                                </Button>
                            )}
                            {activeTab === "read" && notifications.length > 0 && (
                                <Button
                                    onClick={handleDeleteAllRead}
                                    variant="danger"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    icon={<Trash2 className="w-4 h-4" />}
                                >
                                    Delete all read
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs & Filters */}
                <Card>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Tabs */}
                        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
                            {[
                                { key: "all", label: "All", count: pagination.total },
                                { key: "unread", label: "Unread", count: unreadCount },
                                {
                                    key: "read",
                                    label: "Read",
                                    count: pagination.total - unreadCount,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                                        activeTab === tab.key
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                    style={{
                                        color:
                                            activeTab === tab.key
                                                ? "var(--color-primary)"
                                                : "var(--color-text-secondary)",
                                    }}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span
                                            className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: "var(--color-primary)",
                                                color: "var(--color-text-inverse)",
                                                boxShadow: "0 1px 2px 0 rgba(17, 24, 39, 0.08)",
                                            }}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <Filter
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <select
                                value={selectedType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="px-3 py-1.5 text-sm border rounded-lg"
                                style={{
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-background)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <option value="all">All Types</option>
                                <option value="success">Success</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="system">System</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Notifications List */}
                {loading && notifications.length === 0 ? (
                    <Card>
                        <Skeleton type="list" count={5} />
                    </Card>
                ) : notifications.length === 0 ? (
                    <EmptyState
                        icon={Bell}
                        title="No notifications"
                        description={
                            activeTab === "unread"
                                ? "You're all caught up! No unread notifications."
                                : activeTab === "read"
                                  ? "No read notifications yet."
                                  : "You haven't received any notifications yet."
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification._id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    {/* Read indicator */}
                                    <div className="flex-shrink-0 pt-1">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                !notification.read
                                                    ? "bg-blue-500"
                                                    : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                        ></div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3
                                                        className={`text-lg font-semibold ${
                                                            !notification.read ? "font-bold" : ""
                                                        }`}
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {notification.title}
                                                    </h3>
                                                    <Badge
                                                        variant={getTypeVariant(notification.type)}
                                                    >
                                                        {notification.type}
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="text-sm"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                    dangerouslySetInnerHTML={{ __html: notification.message }}
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
                                                {!notification.read && (
                                                    <Button
                                                        onClick={() =>
                                                            handleMarkAsRead(notification._id)
                                                        }
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full sm:w-auto"
                                                        icon={<Check className="w-4 h-4" />}
                                                    >
                                                        Mark read
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleDelete(notification._id)}
                                                    variant="danger"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    icon={<Trash2 className="w-4 h-4" />}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div
                                            className="flex flex-wrap items-center gap-4 text-xs"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            <span>
                                                {formatDistanceToNow(notification.createdAt)}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {formatDate(notification.createdAt, "long")}
                                            </span>
                                            {notification.sender && (
                                                <>
                                                    <span>•</span>
                                                    <span>From: {notification.sender.name}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Action button */}
                                        {notification.actionUrl && notification.actionLabel && (
                                            <div className="mt-3">
                                                <Button
                                                    onClick={async () => {
                                                        if (!notification.read) {
                                                            await handleMarkAsRead(
                                                                notification._id
                                                            );
                                                        }
                                                        router.push(notification.actionUrl);
                                                    }}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                >
                                                    {notification.actionLabel}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        onPageChange={handlePageChange}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                    />
                )}
            </div>
        </ContentWrapper>
    );
}
