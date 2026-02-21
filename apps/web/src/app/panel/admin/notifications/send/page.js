"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { UserSelectField } from "@/components/forms/UserSelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Badge } from "@/components/common/Badge";
import { Send, Users, User, Shield, AlertCircle } from "lucide-react";
import { Formik, Form } from "formik";
import { sendNotificationSchema } from "@/schemas/notificationSchemas";
import { sendNotification } from "@/services/notification.service";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Send Notification Page (Admin/Manager Only)
 *
 * Allows admins and managers to send custom notifications to:
 * - All users
 * - Specific role (admin/manager/user)
 * - Single user
 * - Multiple users
 */
export default function SendNotificationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Check authorization
    useEffect(() => {
        if (user && !["admin", "manager"].includes(user.role)) {
            toast.error("Access denied: Admin or Manager role required");
            router.push("/panel/admin/notifications");
        }
    }, [user, router]);

    // Fetch users for selection (Single User / Multiple Users dropdowns)
    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axios.get("/api/users?limit=1000");
                setUsers(response.data.data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load users");
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, []);

    // Handle form submit
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            await sendNotification(values);

            toast.success("Notification sent successfully!", {
                description: `Sent to ${
                    values.recipientType === "all"
                        ? "all users"
                        : values.recipientType === "role"
                        ? `all ${values.recipients}s`
                        : "1 user"
                }`,
            });

            resetForm();
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error(error.response?.data?.error || "Failed to send notification");
        } finally {
            setSubmitting(false);
        }
    };

    // Pre-defined templates
    const templates = [
        {
            name: "Welcome",
            title: "Welcome to LogaShop Panel!",
            message: "Your account has been created successfully. Start exploring the platform!",
            type: "success",
        },
        {
            name: "Maintenance",
            title: "Scheduled Maintenance",
            message:
                "System maintenance is scheduled for tonight at 11 PM. Expected downtime: 30 minutes.",
            type: "warning",
        },
        {
            name: "Feature Update",
            title: "New Features Available!",
            message:
                "We've added exciting new features to the platform. Check them out in your dashboard!",
            type: "info",
        },
        {
            name: "Important Alert",
            title: "Important: Action Required",
            message: "Please review your account settings and update your profile information.",
            type: "error",
        },
    ];

    if (!user || !["admin", "manager"].includes(user.role)) {
        return null;
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Send Notification
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Send custom notifications to users
                </p>
            </div>

            {/* Alert */}
            <Card
                className="border-l-4 shadow-sm"
                style={{
                    backgroundColor: "var(--color-info-surface)",
                    borderColor: "var(--color-info)",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                }}
            >
                <div className="flex gap-3">
                    <AlertCircle
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--color-info)" }}
                    />
                    <div>
                        <h3
                            className="font-semibold mb-1"
                            style={{ color: "var(--color-info-foreground)" }}
                        >
                            Admin Notification Sender
                        </h3>
                        <p className="text-sm" style={{ color: "var(--color-info-foreground)" }}>
                            Notifications will be saved to the database and delivered via push to
                            all selected recipients.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Main Form */}
            <Card
                style={{
                    marginBottom: "1rem",
                }}
            >
                <Formik
                    initialValues={{
                        recipientType: "all",
                        recipients: "",
                        title: "",
                        message: "",
                        type: "info",
                        actionUrl: "",
                        actionLabel: "",
                        email: false,
                    }}
                    validationSchema={sendNotificationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form className="space-y-6">
                            {/* Quick Templates */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Quick Templates (Optional)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {templates.map((template) => (
                                        <button
                                            key={template.name}
                                            type="button"
                                            onClick={() => {
                                                setFieldValue("title", template.title);
                                                setFieldValue("message", template.message);
                                                setFieldValue("type", template.type);
                                            }}
                                            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            style={{
                                                borderColor: "var(--color-border)",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recipient Type */}
                            <SelectField name="recipientType" label="Send To">
                                <option value="all">All Users</option>
                                <option value="role">Specific Role</option>
                                <option value="single">Single User</option>
                            </SelectField>

                            {/* Role Selection */}
                            {values.recipientType === "role" && (
                                <SelectField name="recipients" label="Select Role">
                                    <option value="">Select a role...</option>
                                    <option value="admin">Admins</option>
                                    <option value="manager">Managers</option>
                                    <option value="user">Regular Users</option>
                                </SelectField>
                            )}

                            {/* Single User Selection */}
                            {values.recipientType === "single" && (
                                <UserSelectField
                                    name="recipients"
                                    label="Select User"
                                    users={users}
                                    placeholder="Search by name or email..."
                                    disabled={loadingUsers}
                                />
                            )}

                            {/* Notification Content */}
                            <InputField
                                name="title"
                                label="Notification Title"
                                placeholder="Enter notification title"
                                maxLength={100}
                            />

                            <TextareaField
                                name="message"
                                label="Notification Message"
                                placeholder="Enter notification message"
                                rows={4}
                                maxLength={500}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SelectField name="type" label="Notification Type">
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="admin">Admin</option>
                                    <option value="system">System</option>
                                </SelectField>

                                {/* Email Checkbox */}
                                <div className="flex items-center h-full pt-6">
                                    <label
                                        className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg w-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={values.email}
                                            onChange={(e) =>
                                                setFieldValue("email", e.target.checked)
                                            }
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <div>
                                            <span
                                                className="font-medium block"
                                                style={{ color: "var(--color-text-primary)" }}
                                            >
                                                Send via Email
                                            </span>
                                            <span
                                                className="text-xs block"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                Send a copy to user's email inbox
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Optional Action */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    name="actionUrl"
                                    label="Action URL (Optional)"
                                    placeholder="/dashboard"
                                    helperText="URL to navigate to when notification is clicked"
                                />

                                <InputField
                                    name="actionLabel"
                                    label="Action Label (Optional)"
                                    placeholder="View Details"
                                    helperText="Button text for the action"
                                />
                            </div>

                            {/* Preview */}
                            {values.title && values.message && (
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Preview
                                    </label>
                                    <div
                                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4
                                                        className="font-semibold"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {values.title}
                                                    </h4>
                                                    <Badge
                                                        variant={
                                                            values.type === "success"
                                                                ? "success"
                                                                : values.type === "error"
                                                                ? "danger"
                                                                : values.type === "warning"
                                                                ? "warning"
                                                                : "primary"
                                                        }
                                                    >
                                                        {values.type}
                                                    </Badge>
                                                </div>
                                                <div
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: values.message,
                                                    }}
                                                />
                                                {values.actionLabel && (
                                                    <button
                                                        className="mt-2 text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-primary)",
                                                        }}
                                                    >
                                                        {values.actionLabel} →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div
                                className="flex gap-3 pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Button
                                    type="submit"
                                    loading={isSubmitting}
                                    icon={<Send className="w-4 h-4" />}
                                >
                                    Send Notification
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push("/panel/admin/notifications")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Total Users
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {users.length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Your Role
                            </p>
                            <p
                                className="text-xl font-bold capitalize"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {user?.role}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Delivery
                            </p>
                            <p
                                className="text-xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Push + DB
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </ContentWrapper>
    );
}
