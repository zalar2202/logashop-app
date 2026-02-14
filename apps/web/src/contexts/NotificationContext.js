"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/lib/hooks";
import {
    requestNotificationPermission,
    onForegroundMessage,
    getCurrentToken,
} from "@/lib/firebase/client";
import { registerFcmToken } from "@/services/notification.service";
import { fetchUnreadCount, addNotification } from "@/features/notifications/notificationsSlice";
import { toast } from "sonner";
import { getBrowserName } from "@/lib/utils";

/**
 * NotificationContext
 * 
 * Manages:
 * - Auto FCM token registration after login
 * - Foreground message listener (when app is open)
 * - Real-time notification updates
 * - Periodic unread count refresh
 */
const NotificationContext = createContext({});
const isDebugLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_DEBUG === "true";

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const dispatch = useAppDispatch();
    const [tokenRegistered, setTokenRegistered] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);

    /**
     * Auto-register FCM token after login
     */
    useEffect(() => {
        const registerToken = async () => {
            // Only register if user is authenticated and token not yet registered
            if (!isAuthenticated || tokenRegistered) return;

            try {
                if (isDebugLoggingEnabled) {
                    console.log("🔔 Attempting to register FCM token...");
                }

                // Check current permission status
                const permission = Notification?.permission;

                let token = null;

                if (permission === "granted") {
                    // Permission already granted, get token
                    token = await getCurrentToken();
                } else if (permission === "default") {
                    // Permission not yet requested, request it
                    token = await requestNotificationPermission();
                } else {
                    // Permission denied
                    if (isDebugLoggingEnabled) {
                        console.log("ℹ️ Notification permission denied by user");
                    }
                    return;
                }

                if (!token) {
                    if (isDebugLoggingEnabled) {
                        console.log("ℹ️ No FCM token available");
                    }
                    return;
                }

                setFcmToken(token);

                // Register token in database
                await registerFcmToken(token, "web", getBrowserName());

                setTokenRegistered(true);
                if (isDebugLoggingEnabled) {
                    console.log("✅ FCM token registered successfully");
                }

                // Don't show toast - silent registration for better UX
            } catch (error) {
                console.error("❌ Error registering FCM token:", error);
                // Silent fail - don't interrupt user experience
            }
        };

        // Delay registration slightly to avoid blocking initial render
        const timeout = setTimeout(registerToken, 2000);

        return () => clearTimeout(timeout);
    }, [isAuthenticated, tokenRegistered]);

    /**
     * Listen for foreground messages (when app is open)
     */
    useEffect(() => {
        if (!isAuthenticated) return;

        if (isDebugLoggingEnabled) {
            console.log("🔔 Setting up foreground message listener...");
        }

        const unsubscribe = onForegroundMessage((payload) => {
            if (isDebugLoggingEnabled) {
                console.log("📬 Foreground notification received:", payload);
            }

            const { notification, data } = payload;

            // Show toast notification
            toast.success(notification?.title || "New Notification", {
                description: notification?.body || "",
                duration: 5000,
                action: data?.actionUrl
                    ? {
                          label: data.actionLabel || "View",
                          onClick: () => {
                              window.location.href = data.actionUrl;
                          },
                      }
                    : undefined,
            });

            // Add notification to Redux state (real-time update)
            if (data?.notificationId) {
                // Fetch updated notifications to reflect new one
                dispatch(fetchUnreadCount());
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
                if (isDebugLoggingEnabled) {
                    console.log("🔕 Foreground message listener removed");
                }
            }
        };
    }, [isAuthenticated, dispatch]);

    /**
     * Periodic unread count refresh (every 30 seconds)
     */
    useEffect(() => {
        if (!isAuthenticated) return;

        // Initial fetch
        dispatch(fetchUnreadCount());

        // Refresh every 30 seconds
        const interval = setInterval(() => {
            dispatch(fetchUnreadCount());
        }, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated, dispatch]);

    const value = {
        fcmToken,
        tokenRegistered,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

