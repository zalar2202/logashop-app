"use client";

import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import {
    User,
    Settings as SettingsIcon,
    Shield,
    Download,
    AlertTriangle,
    Trash2,
    Lock,
    Mail,
    Terminal,
    Wand2,
    Globe,
    Server,
    Key,
    Cpu,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs } from "@/components/common/Tabs";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { TextareaField } from "@/components/forms/TextareaField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Loader } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Avatar } from "@/components/common/Avatar";
import {
    profileUpdateSchema,
    passwordChangeSchema,
    preferencesSchema,
    accountDeactivationSchema,
    accountDeletionSchema,
} from "@/schemas/settingsSchemas";
import {
    updateProfile,
    changePassword,
    updatePreferences,
    exportData,
    deactivateAccount,
    deleteAccount,
    downloadFile,
} from "@/services/settings.service";

/**
 * Settings Page
 * Comprehensive settings page with Profile, Preferences, and Account management
 */
export default function SettingsPage() {
    const { user, updateUser, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // If auth is still loading, show loader
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size="lg" />
            </div>
        );
    }

    // If no user, show error (shouldn't happen with RouteGuard)
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="p-6">
                    <p className="text-[var(--color-error)]">Not authenticated. Please log in.</p>
                </Card>
            </div>
        );
    }

    // Profile Tab Content
    const ProfileTab = () => (
        <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Avatar src={user.avatar} alt={user.name} size="2xl" />
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {user.name}
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">{user.email}</p>
                    <p className="text-sm text-[var(--color-text-tertiary)] capitalize">
                        {user.role}
                    </p>
                </div>
            </div>

            <Formik
                initialValues={{
                    name: user.name || "",
                    phone: user.phone || "",
                    bio: user.bio || "",
                    avatar: null,
                    technicalDetails: {
                        domainName: user.technicalDetails?.domainName || "",
                        serverIP: user.technicalDetails?.serverIP || "",
                        serverUser: user.technicalDetails?.serverUser || "",
                        serverPassword: user.technicalDetails?.serverPassword || "",
                        serverPort: user.technicalDetails?.serverPort || "22",
                    }
                }}
                validationSchema={profileUpdateSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const response = await updateProfile(values);

                        if (response.success) {
                            updateUser(response.user);
                            toast.success("Profile updated successfully");
                        } else {
                            toast.error(response.message || "Failed to update profile");
                        }
                    } catch (error) {
                        console.error("Profile update error:", error);
                        toast.error(error.response?.data?.message || "Failed to update profile");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className="space-y-4">
                        <InputField
                            label="Full Name"
                            name="name"
                            placeholder="Enter your full name"
                            required
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <InputField
                                label="Email (Username)"
                                name="email"
                                value={user.email}
                                disabled
                                helperText="Email cannot be changed as it's used for login"
                            />
                        </div>

                        <InputField
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                        />

                        <TextareaField
                            label="Bio"
                            name="bio"
                            placeholder="Tell us about yourself..."
                            rows={4}
                            helperText="Maximum 500 characters"
                        />

                        <FileUploadField
                            label="Profile Picture"
                            name="avatar"
                            accept={{
                                "image/png": [".png"],
                                "image/jpeg": [".jpg", ".jpeg"],
                                "image/webp": [".webp"],
                                "image/svg+xml": [".svg"],
                            }}
                            helperText="PNG, JPG, WEBP up to 5MB"
                            onChange={(file) => setFieldValue("avatar", file)}
                        />

                        {/* Technical Details Section */}
                        <div className="pt-6 mt-6 border-t border-[var(--color-border)]">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5" />
                                Technical Details (Pro)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Domain Name"
                                    name="technicalDetails.domainName"
                                    placeholder="example.com"
                                    icon={<Globe className="w-4 h-4" />}
                                />
                                <InputField
                                    label="Server IP Address"
                                    name="technicalDetails.serverIP"
                                    placeholder="1.2.3.4"
                                    icon={<Server className="w-4 h-4" />}
                                />
                                <InputField
                                    label="Server Username"
                                    name="technicalDetails.serverUser"
                                    placeholder="root"
                                    icon={<User className="w-4 h-4" />}
                                />
                                <InputField
                                    label="Server Password"
                                    name="technicalDetails.serverPassword"
                                    type="password"
                                    placeholder="********"
                                    icon={<Key className="w-4 h-4" />}
                                />
                                <InputField
                                    label="SSH/FTP Port"
                                    name="technicalDetails.serverPort"
                                    placeholder="22"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsPasswordModalOpen(true)}
                                icon={<Lock className="w-4 h-4" />}
                            >
                                Change Password
                            </Button>

                            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );

    // Preferences Tab Content
    const PreferencesTab = () => {
        const [preferences, setPreferences] = useState(user.preferences || {});
        const [saving, setSaving] = useState(false);

        const handlePreferenceChange = async (key, value) => {
            const newPreferences = { ...preferences, [key]: value };
            setPreferences(newPreferences);

            setSaving(true);
            try {
                const response = await updatePreferences({ [key]: value });
                if (response.success) {
                    updateUser({ ...user, preferences: response.preferences });
                    toast.success("Preference saved");
                } else {
                    toast.error("Failed to save preference");
                    // Revert on failure
                    setPreferences(preferences);
                }
            } catch (error) {
                console.error("Preference update error:", error);
                toast.error("Failed to save preference");
                setPreferences(preferences);
            } finally {
                setSaving(false);
            }
        };

        return (
            <div className="space-y-6">
                {/* Notification Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        Notification Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    Email Notifications
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Receive notifications via email
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.emailNotifications ?? true}
                                    onChange={(e) =>
                                        handlePreferenceChange(
                                            "emailNotifications",
                                            e.target.checked
                                        )
                                    }
                                    disabled={saving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    Push Notifications
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Receive push notifications in browser
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferences.pushNotifications ?? true}
                                    onChange={(e) =>
                                        handlePreferenceChange(
                                            "pushNotifications",
                                            e.target.checked
                                        )
                                    }
                                    disabled={saving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                Notification Frequency
                            </label>
                            <select
                                value={preferences.notificationFrequency || "immediate"}
                                onChange={(e) =>
                                    handlePreferenceChange("notificationFrequency", e.target.value)
                                }
                                disabled={saving}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            >
                                <option value="immediate">Immediate</option>
                                <option value="daily">Daily Digest</option>
                                <option value="weekly">Weekly Summary</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Display Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        Display Settings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                Theme Preference
                            </label>
                            <select
                                value={preferences.theme || "system"}
                                onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                                disabled={saving}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System Default</option>
                            </select>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                You can also use the theme toggle in the header
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                Date Format
                            </label>
                            <select
                                value={preferences.dateFormat || "MM/DD/YYYY"}
                                onChange={(e) =>
                                    handlePreferenceChange("dateFormat", e.target.value)
                                }
                                disabled={saving}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Privacy Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        Privacy Settings
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Profile Visibility
                        </label>
                        <select
                            value={preferences.profileVisibility || "public"}
                            onChange={(e) =>
                                handlePreferenceChange("profileVisibility", e.target.value)
                            }
                            disabled={saving}
                            className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Control who can view your profile information
                        </p>
                    </div>
                </Card>
            </div>
        );
    };

    // Account Tab Content
    const AccountTab = () => {
        const handleExportData = async (format) => {
            setExportLoading(true);
            try {
                const blob = await exportData(format);
                const filename = `user-data-${Date.now()}.${format}`;
                downloadFile(blob, filename);
                toast.success(`Data exported successfully as ${format.toUpperCase()}`);
            } catch (error) {
                console.error("Export error:", error);
                toast.error("Failed to export data");
            } finally {
                setExportLoading(false);
            }
        };

        return (
            <div className="space-y-6">
                {/* Account Status */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        Account Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-secondary)]">
                                Account Status:
                            </span>
                            <span
                                className={`font-medium capitalize ${
                                    user.status === "active" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {user.status}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-secondary)]">
                                Account Created:
                            </span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-secondary)]">Last Login:</span>
                            <span className="font-medium text-[var(--color-text-primary)]">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Data Export */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                        Export Your Data
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        Download a copy of your data for your records (GDPR compliance)
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => handleExportData("json")}
                            loading={exportLoading}
                            disabled={exportLoading}
                            icon={<Download className="w-4 h-4" />}
                        >
                            Export as JSON
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleExportData("csv")}
                            loading={exportLoading}
                            disabled={exportLoading}
                            icon={<Download className="w-4 h-4" />}
                        >
                            Export as CSV
                        </Button>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-2 border-red-200 dark:border-red-900">
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                                Deactivate Account
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                Temporarily suspend your account. Can be reactivated by an
                                administrator.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeactivateModalOpen(true)}
                            >
                                Deactivate Account
                            </Button>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <h4 className="font-medium text-red-600 mb-2">
                                Delete Account Permanently
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                                Permanently delete your account and all data. This action cannot be
                                undone.
                            </p>
                            <Button
                                variant="danger"
                                onClick={() => setIsDeleteModalOpen(true)}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    // System Tab content removed

    // Tab configuration
    const tabs = [
        {
            id: "profile",
            label: "Profile",
            icon: <User className="w-4 h-4" />,
            content: <ProfileTab />,
        },
        {
            id: "preferences",
            label: "Preferences",
            icon: <SettingsIcon className="w-4 h-4" />,
            content: <PreferencesTab />,
        },
        {
            id: "account",
            label: "Account",
            icon: <Shield className="w-4 h-4" />,
            content: <AccountTab />,
        },
        // System tab removed as per request
    ];

    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                        Settings
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>

                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    variant="line"
                    size="md"
                />

                {/* Password Change Modal */}
                <PasswordChangeModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />

                {/* Deactivate Account Modal */}
                <DeactivateAccountModal
                    isOpen={isDeactivateModalOpen}
                    onClose={() => setIsDeactivateModalOpen(false)}
                />

                {/* Delete Account Modal */}
                <DeleteAccountModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            </div>
        </ContentWrapper>
    );
}

// Password Change Modal Component
function PasswordChangeModal({ isOpen, onClose }) {
    const generatePassword = (setFieldValue) => {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const special = "@$!%*?&#";
        const allChars = uppercase + lowercase + digits + special;

        const pickRandom = (chars) => chars.charAt(Math.floor(Math.random() * chars.length));

        const passwordChars = [
            pickRandom(uppercase),
            pickRandom(lowercase),
            pickRandom(digits),
            pickRandom(special),
        ];

        for (let i = passwordChars.length; i < 12; i++) {
            passwordChars.push(pickRandom(allChars));
        }

        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
        }

        const password = passwordChars.join("");
        setFieldValue("newPassword", password);
        setFieldValue("confirmPassword", password);
        toast.info("Secure password generated!");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="md">
            <Formik
                initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }}
                validationSchema={passwordChangeSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    try {
                        const response = await changePassword({
                            currentPassword: values.currentPassword,
                            newPassword: values.newPassword,
                        });

                        if (response.success) {
                            toast.success("Password changed successfully");
                            resetForm();
                            onClose();
                        } else {
                            toast.error(response.message || "Failed to change password");
                        }
                    } catch (error) {
                        console.error("Password change error:", error);
                        toast.error(error.response?.data?.message || "Failed to change password");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className="space-y-4">
                        <InputField
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            required
                        />

                        <InputField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            required
                            action={
                                <button
                                    type="button"
                                    onClick={() => generatePassword(setFieldValue)}
                                    className="text-xs font-bold flex items-center gap-1 hover:underline transition-all"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    <Wand2 size={12} />
                                    Generate
                                </button>
                            }
                            helperText="Min 8 chars, must include uppercase, lowercase, number, and special character"
                        />

                        <InputField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            required
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                                Change Password
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

// Deactivate Account Modal Component
function DeactivateAccountModal({ isOpen, onClose }) {
    const { logout } = useAuth();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Your Account" size="md">
            <Formik
                initialValues={{
                    password: "",
                    reason: "",
                }}
                validationSchema={accountDeactivationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const response = await deactivateAccount(values);

                        if (response.success) {
                            toast.success("Account deactivated successfully");
                            onClose();
                            // Logout user after deactivation
                            setTimeout(() => logout(), 1500);
                        } else {
                            toast.error(response.message || "Failed to deactivate account");
                        }
                    } catch (error) {
                        console.error("Deactivation error:", error);
                        toast.error(
                            error.response?.data?.message || "Failed to deactivate account"
                        );
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <p className="text-sm text-[var(--color-text-primary)]">
                                <strong>What happens when you deactivate:</strong>
                            </p>
                            <ul className="text-sm text-[var(--color-text-secondary)] list-disc list-inside mt-2 space-y-1">
                                <li>Your account will be suspended temporarily</li>
                                <li>You will not be able to log in</li>
                                <li>An administrator can reactivate your account</li>
                                <li>Your data will be retained</li>
                            </ul>
                        </div>

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            required
                            helperText="Verify your identity"
                        />

                        <TextareaField
                            label="Reason (Optional)"
                            name="reason"
                            placeholder="Tell us why you're leaving..."
                            rows={3}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                Deactivate Account
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

// Delete Account Modal Component
function DeleteAccountModal({ isOpen, onClose }) {
    const { logout } = useAuth();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Your Account Permanently" size="md">
            <Formik
                initialValues={{
                    password: "",
                    confirmation: "",
                }}
                validationSchema={accountDeletionSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        const response = await deleteAccount(values);

                        if (response.success) {
                            toast.success("Account deleted permanently");
                            onClose();
                            // Logout user after deletion
                            setTimeout(() => logout(), 1500);
                        } else {
                            toast.error(response.message || "Failed to delete account");
                        }
                    } catch (error) {
                        console.error("Deletion error:", error);
                        toast.error(error.response?.data?.message || "Failed to delete account");
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-3 mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-600 mb-2">
                                        This action cannot be undone!
                                    </p>
                                    <p className="text-sm text-[var(--color-text-primary)] mb-2">
                                        <strong>What will be deleted:</strong>
                                    </p>
                                    <ul className="text-sm text-[var(--color-text-secondary)] list-disc list-inside space-y-1">
                                        <li>Your profile and all personal information</li>
                                        <li>Your uploaded files and avatar</li>
                                        <li>All your preferences and settings</li>
                                        <li>Your account history</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            required
                            helperText="Verify your identity"
                        />

                        <InputField
                            label="Type DELETE to confirm"
                            name="confirmation"
                            placeholder="DELETE"
                            required
                            helperText="Type the word DELETE in capital letters"
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                Delete Permanently
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
