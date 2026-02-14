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
} from "@/features/notifications/notificationsSlice";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Filter,
    AlertCircle,
    Info,
    CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const notifications = useAppSelector(selectNotifications);
    const unreadCount = useAppSelector(selectUnreadCount);
    const loading = useAppSelector(selectNotificationsLoading);
    const pagination = useAppSelector(selectNotificationsPagination);

    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        // Reset filters on mount
        dispatch(setFilters({ type: null, read: null }));
    }, [dispatch]);

    useEffect(() => {
        const readFilter = activeTab === "all" ? null : activeTab === "unread" ? false : true;

        dispatch(
            fetchNotifications({
                page: pagination.page,
                limit: 10, // Smaller limit for storefront
                read: readFilter,
            })
        );
        dispatch(fetchUnreadCount());
    }, [activeTab, pagination.page, dispatch]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await dispatch(markNotificationAsRead(notificationId)).unwrap();
            dispatch(fetchUnreadCount());
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
            dispatch(fetchUnreadCount());
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (notificationId) => {
        if (!confirm("Remove this notification?")) return;
        try {
            await dispatch(deleteNotificationById(notificationId)).unwrap();
            toast.success("Notification removed");
        } catch (error) {
            toast.error("Failed to remove notification");
        }
    };

    const handlePageChange = (newPage) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        dispatch(
            fetchNotifications({
                page: newPage,
                limit: 10,
                read: activeTab === "all" ? null : activeTab === "unread" ? false : true,
            })
        );
    };

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle size={20} className="text-green-500" />;
            case "error":
            case "warning":
                return <AlertCircle size={20} className="text-amber-500" />;
            default:
                return <Info size={20} className="text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                        Manage your alerts and messages
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline font-medium"
                    >
                        <CheckCheck size={16} />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--color-border)] flex gap-6">
                {["all", "unread", "read"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`pb-3 text-sm font-medium border-b-2 transition capitalize ${
                            activeTab === tab
                                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading && notifications.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={24} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">No notifications</h3>
                        <p className="text-[var(--color-text-secondary)]">
                            You don't have any {activeTab !== "all" ? activeTab : ""} notifications
                            yet.
                        </p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`bg-white rounded-xl border p-5 transition ${
                                !n.read
                                    ? "border-[var(--color-primary)] shadow-sm bg-blue-50/10"
                                    : "border-[var(--color-border)]"
                            }`}
                        >
                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0">{getIcon(n.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3
                                            className={`font-medium text-base ${
                                                !n.read
                                                    ? "text-[var(--color-text-primary)]"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {n.title}
                                        </h3>
                                        <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                                            {formatDistanceToNow(new Date(n.createdAt))} ago
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                                        {n.message}
                                    </p>

                                    {/* Action Button */}
                                    {n.actionUrl && (
                                        <div className="mt-3">
                                            <button
                                                onClick={() => {
                                                    if (!n.read) handleMarkAsRead(n._id);
                                                    router.push(n.actionUrl);
                                                }}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                                            >
                                                {n.actionLabel || "View Details"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {!n.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(n._id)}
                                            className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition"
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(n._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-4 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-[var(--color-text-secondary)]">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-4 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
