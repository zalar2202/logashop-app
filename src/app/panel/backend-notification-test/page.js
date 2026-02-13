"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { requestNotificationPermission, getCurrentToken } from "@/lib/firebase/client";
import { toast } from "sonner";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Backend Notification Test Page
 *
 * Complete end-to-end testing of notification system:
 * 1. Register FCM token in database
 * 2. Send notification from backend (server-side)
 * 3. Receive push notification
 *
 * This page tests the entire notification flow!
 */
export default function BackendNotificationTestPage() {
    const { user } = useAuth();
    const [fcmToken, setFcmToken] = useState(null);
    const [tokenRegistered, setTokenRegistered] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get FCM token on mount
    useEffect(() => {
        const fetchToken = async () => {
            const token = await getCurrentToken();
            if (token) {
                setFcmToken(token);
            }
        };
        fetchToken();
    }, []);

    // Request permission and get token
    const handleRequestPermission = async () => {
        setLoading(true);
        try {
            const token = await requestNotificationPermission();
            if (token) {
                setFcmToken(token);
                toast.success("FCM token generated!");
            } else {
                toast.error("Failed to get notification permission");
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Register token in database
    const handleRegisterToken = async () => {
        if (!fcmToken) {
            toast.error("No FCM token available. Request permission first.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/notifications/fcm-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    token: fcmToken,
                    device: "web",
                    browser: navigator.userAgent.split(" ").pop(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setTokenRegistered(true);
                addTestResult(
                    "✅ Token Registered",
                    `Token saved to database. You now have ${data.tokenCount} token(s).`,
                    "success"
                );
                toast.success("Token registered in database!");
            } else {
                addTestResult("❌ Registration Failed", data.error, "error");
                toast.error(data.error);
            }
        } catch (error) {
            addTestResult("❌ Registration Error", error.message, "error");
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Send test notification (backend)
    const handleSendTestNotification = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    recipientType: "single",
                    recipients: user.id,
                    title: values.title,
                    message: values.message,
                    type: values.type,
                    actionUrl: values.actionUrl || null,
                    actionLabel: values.actionLabel || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                addTestResult(
                    "✅ Notification Sent!",
                    `Backend successfully sent notification. Push sent: ${data.result.pushSent ? "Yes" : "No"}. Check your browser for the notification!`,
                    "success"
                );
                toast.success("Notification sent! Check for push notification!");
            } else {
                addTestResult("❌ Send Failed", data.error, "error");
                toast.error(data.error);
            }
        } catch (error) {
            addTestResult("❌ Send Error", error.message, "error");
            toast.error("Error: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Fetch notifications list
    const handleFetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/notifications?limit=5", {
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                addTestResult(
                    "✅ Notifications Fetched",
                    `Found ${data.pagination.total} total notifications. Recent: ${data.data.length}`,
                    "success"
                );
                console.log("Notifications:", data.data);
                toast.success(`Found ${data.pagination.total} notifications (check console)`);
            } else {
                addTestResult("❌ Fetch Failed", data.error, "error");
                toast.error(data.error);
            }
        } catch (error) {
            addTestResult("❌ Fetch Error", error.message, "error");
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get unread count
    const handleGetUnreadCount = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/notifications/count", {
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                addTestResult(
                    "✅ Unread Count",
                    `You have ${data.count} unread notifications.`,
                    "success"
                );
                toast.success(`Unread count: ${data.count}`);
            } else {
                addTestResult("❌ Count Failed", data.error, "error");
                toast.error(data.error);
            }
        } catch (error) {
            addTestResult("❌ Count Error", error.message, "error");
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Add test result to list
    const addTestResult = (title, message, type) => {
        setTestResults((prev) => [
            {
                title,
                message,
                type,
                timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
        ]);
    };

    const validationSchema = Yup.object({
        title: Yup.string().required("Title is required").max(100),
        message: Yup.string().required("Message is required").max(500),
        type: Yup.string().required("Type is required"),
    });

    return (
        <ContentWrapper>
            <div>
                <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Backend Notification Test
                </h1>
                <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
                    Complete end-to-end testing: Token registration → Backend send → Push delivery
                </p>
            </div>

            {/* Current Status */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Current Status
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span style={{ color: "var(--color-text-secondary)" }}>Logged in as:</span>
                        <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {user?.name} ({user?.role})
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: "var(--color-text-secondary)" }}>FCM Token:</span>
                        <span
                            className={
                                fcmToken
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                            }
                        >
                            {fcmToken ? "✅ Generated" : "❌ Not Generated"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            Token Registered in DB:
                        </span>
                        <span
                            className={
                                tokenRegistered
                                    ? "text-green-600 font-semibold"
                                    : "text-yellow-600 font-semibold"
                            }
                        >
                            {tokenRegistered ? "✅ Yes" : "⏳ Pending"}
                        </span>
                    </div>
                    {fcmToken && (
                        <div className="mt-4">
                            <p
                                className="text-sm mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Your FCM Token:
                            </p>
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs break-all">
                                <code>{fcmToken}</code>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Step-by-Step Instructions */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    🎯 Testing Steps
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            1
                        </div>
                        <div className="flex-1">
                            <h3
                                className="font-semibold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Request Permission & Get Token
                            </h3>
                            <Button
                                onClick={handleRequestPermission}
                                loading={loading}
                                disabled={!!fcmToken}
                            >
                                {fcmToken
                                    ? "✅ Token Generated"
                                    : "Request Notification Permission"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            2
                        </div>
                        <div className="flex-1">
                            <h3
                                className="font-semibold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Register Token in Database
                            </h3>
                            <Button
                                onClick={handleRegisterToken}
                                loading={loading}
                                disabled={!fcmToken || tokenRegistered}
                            >
                                {tokenRegistered
                                    ? "✅ Token Registered"
                                    : "Register Token in MongoDB"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            3
                        </div>
                        <div className="flex-1">
                            <h3
                                className="font-semibold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Send Notification from Backend
                            </h3>
                            <p
                                className="text-sm mb-3"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                This will create a notification in MongoDB AND send push via
                                Firebase Admin SDK
                            </p>

                            <Formik
                                initialValues={{
                                    title: "Backend Test Notification",
                                    message:
                                        "This notification was sent from your Next.js server using Firebase Admin SDK!",
                                    type: "success",
                                    actionUrl: "/notifications",
                                    actionLabel: "View All",
                                }}
                                validationSchema={validationSchema}
                                onSubmit={handleSendTestNotification}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="space-y-4">
                                        <InputField
                                            name="title"
                                            label="Notification Title"
                                            placeholder="Enter title"
                                        />
                                        <TextareaField
                                            name="message"
                                            label="Notification Message"
                                            placeholder="Enter message"
                                            rows={3}
                                        />
                                        <SelectField name="type" label="Notification Type">
                                            <option value="info">Info</option>
                                            <option value="success">Success</option>
                                            <option value="warning">Warning</option>
                                            <option value="error">Error</option>
                                        </SelectField>
                                        <InputField
                                            name="actionUrl"
                                            label="Action URL (Optional)"
                                            placeholder="/dashboard"
                                        />
                                        <InputField
                                            name="actionLabel"
                                            label="Action Label (Optional)"
                                            placeholder="View Details"
                                        />
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            disabled={!tokenRegistered}
                                        >
                                            🚀 Send Notification from Backend
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            4
                        </div>
                        <div className="flex-1">
                            <h3
                                className="font-semibold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Verify & Test Database
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleFetchNotifications}
                                    loading={loading}
                                    variant="secondary"
                                >
                                    Fetch My Notifications
                                </Button>
                                <Button
                                    onClick={handleGetUnreadCount}
                                    loading={loading}
                                    variant="secondary"
                                >
                                    Get Unread Count
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2
                            className="text-xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Test Results
                        </h2>
                        <Button onClick={() => setTestResults([])} variant="secondary" size="sm">
                            Clear
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-l-4 ${
                                    result.type === "success"
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                                        : "bg-red-50 dark:bg-red-900/20 border-red-500"
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3
                                        className="font-semibold"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {result.title}
                                    </h3>
                                    <span
                                        className="text-xs"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {result.timestamp}
                                    </span>
                                </div>
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {result.message}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Troubleshooting */}
            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    🐛 Troubleshooting
                </h2>
                <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <li>
                        • <strong>Firebase Admin not initialized:</strong> Check .env.local has
                        FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
                    </li>
                    <li>
                        • <strong>Failed to send push:</strong> Ensure FCM API is enabled in Google
                        Cloud Console
                    </li>
                    <li>
                        • <strong>Invalid token:</strong> Token may have expired. Request permission
                        again
                    </li>
                    <li>
                        • <strong>403 Forbidden:</strong> Make sure you are logged in as admin or
                        manager
                    </li>
                    <li>
                        • <strong>No push received:</strong> Check browser notification settings,
                        try different browser
                    </li>
                    <li>
                        • <strong>Check server logs:</strong> Open terminal running `npm run dev`
                        for detailed errors
                    </li>
                </ul>
            </Card>
        </ContentWrapper>
    );
}
