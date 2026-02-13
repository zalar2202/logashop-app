"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
    requestNotificationPermission,
    getCurrentToken,
    onForegroundMessage,
    getNotificationPermission,
    isNotificationSupported,
} from "@/lib/firebase/client";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

// Force dynamic rendering to avoid SSR issues with navigator
export const dynamic = "force-dynamic";

/**
 * Firebase Cloud Messaging Test Page
 *
 * This is a development/testing page to verify Firebase FCM setup.
 * Use this page to:
 * 1. Check if notifications are supported
 * 2. Request notification permission
 * 3. Get and display FCM token
 * 4. Test foreground message handling
 *
 * TODO: Remove this page in production or gate it behind admin-only access
 */
export default function FirebaseTestPage() {
    const [token, setToken] = useState(null);
    const [permission, setPermission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);
    const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Only run browser-specific checks after component mounts
    useEffect(() => {
        setIsMounted(true);
        setPermission(getNotificationPermission());
        setServiceWorkerSupported(typeof navigator !== "undefined" && "serviceWorker" in navigator);
    }, []);

    const handleRequestPermission = async () => {
        setLoading(true);
        try {
            const fcmToken = await requestNotificationPermission();

            if (fcmToken) {
                setToken(fcmToken);
                setPermission("granted");
                toast.success("Notification permission granted!");
                console.log("FCM Token:", fcmToken);
            } else {
                toast.error("Failed to get notification permission");
                setPermission(Notification.permission);
            }
        } catch (error) {
            console.error("Error requesting permission:", error);
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGetCurrentToken = async () => {
        setLoading(true);
        try {
            const currentToken = await getCurrentToken();

            if (currentToken) {
                setToken(currentToken);
                toast.success("Token retrieved successfully!");
            } else {
                toast.info("No token available. Request permission first.");
            }
        } catch (error) {
            console.error("Error getting token:", error);
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleListenForMessages = () => {
        if (listening) {
            toast.info("Already listening for messages");
            return;
        }

        try {
            const unsubscribe = onForegroundMessage((payload) => {
                console.log("Foreground message received:", payload);

                toast.success(payload.notification?.title || "New Notification", {
                    description: payload.notification?.body || "",
                    duration: 5000,
                });
            });

            setListening(true);
            toast.success("Now listening for foreground messages!");

            // Store unsubscribe function for cleanup
            window.__fcmUnsubscribe = unsubscribe;
        } catch (error) {
            console.error("Error setting up listener:", error);
            toast.error("Error: " + error.message);
        }
    };

    const handleCopyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            toast.success("Token copied to clipboard!");
        }
    };

    const handleTestServiceWorker = async () => {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();

                if (registration) {
                    toast.success("Service Worker is registered!", {
                        description: `State: ${registration.active?.state || "inactive"}`,
                    });
                    console.log("Service Worker registration:", registration);
                } else {
                    toast.warning("Service Worker not registered");
                }
            } catch (error) {
                console.error("Error checking service worker:", error);
                toast.error("Error: " + error.message);
            }
        } else {
            toast.error("Service Workers not supported in this browser");
        }
    };

    const supported = isNotificationSupported();

    return (
        <ContentWrapper>
            <div>
                <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Firebase Cloud Messaging Test
                </h1>
                <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
                    Test Firebase FCM setup and notification functionality
                </p>
            </div>

            {/* Browser Support Status */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Browser Support
                </h2>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            Notifications Supported:
                        </span>
                        <span
                            className={
                                supported
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                            }
                        >
                            {supported ? "✅ Yes" : "❌ No"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            Permission Status:
                        </span>
                        <span
                            className={`font-semibold ${
                                permission === "granted"
                                    ? "text-green-600"
                                    : permission === "denied"
                                      ? "text-red-600"
                                      : "text-yellow-600"
                            }`}
                        >
                            {permission || "unknown"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            Service Worker:
                        </span>
                        <span
                            className={`font-semibold ${
                                serviceWorkerSupported ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {serviceWorkerSupported ? "✅ Supported" : "❌ Not Supported"}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Actions */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={handleRequestPermission}
                        loading={loading}
                        disabled={!supported || permission === "granted"}
                    >
                        Request Notification Permission
                    </Button>

                    <Button
                        onClick={handleGetCurrentToken}
                        loading={loading}
                        variant="secondary"
                        disabled={!supported}
                    >
                        Get Current FCM Token
                    </Button>

                    <Button
                        onClick={handleListenForMessages}
                        variant="secondary"
                        disabled={!supported || !token || listening}
                    >
                        {listening ? "✅ Listening for Messages" : "Listen for Foreground Messages"}
                    </Button>

                    <Button onClick={handleTestServiceWorker} variant="secondary">
                        Test Service Worker
                    </Button>
                </div>
            </Card>

            {/* FCM Token Display */}
            {token && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2
                            className="text-xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            FCM Token
                        </h2>
                        <Button onClick={handleCopyToken} variant="secondary" size="sm">
                            Copy Token
                        </Button>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <code
                            className="text-sm break-all"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {token}
                        </code>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        💡 This token is unique to this browser/device. Save it to your database to
                        send push notifications.
                    </p>
                </Card>
            )}

            {/* Instructions */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Testing Instructions
                </h2>
                <div className="space-y-4" style={{ color: "var(--color-text-secondary)" }}>
                    <div>
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Step 1: Request Permission
                        </h3>
                        <p>
                            Click &quot;Request Notification Permission&quot; button. Your browser
                            will show a popup asking for permission.
                        </p>
                    </div>

                    <div>
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Step 2: Get Token
                        </h3>
                        <p>
                            After granting permission, click &quot;Get Current FCM Token&quot; to
                            retrieve your device token.
                        </p>
                    </div>

                    <div>
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Step 3: Listen for Messages
                        </h3>
                        <p>
                            Click &quot;Listen for Foreground Messages&quot; to start receiving
                            notifications when the app is open.
                        </p>
                    </div>

                    <div>
                        <h3
                            className="font-semibold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Step 4: Test Push Notification
                        </h3>
                        <p>
                            Use the Firebase Console Composer to send a test message to your token,
                            or implement the backend sender.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Troubleshooting */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Troubleshooting
                </h2>
                <ul
                    className="space-y-2 list-disc list-inside"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    <li>Make sure you&apos;ve added VAPID key to .env.local</li>
                    <li>Check browser console for error messages</li>
                    <li>Ensure you&apos;re on localhost or HTTPS (required for notifications)</li>
                    <li>Try in Incognito mode if issues persist</li>
                    <li>
                        Check that firebase-messaging-sw.js is accessible at
                        /firebase-messaging-sw.js
                    </li>
                </ul>
            </Card>
        </ContentWrapper>
    );
}
