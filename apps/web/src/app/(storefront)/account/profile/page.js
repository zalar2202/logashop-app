"use client";

import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    Lock,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    Shield,
    Download,
    Trash2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Modal } from "@/components/common/Modal";
import {
    updatePreferences,
    exportData,
    deactivateAccount,
    deleteAccount,
    downloadFile,
} from "@/services/settings.service";
import { Avatar } from "@/components/common/Avatar";

export default function ProfilePage() {
    const { user, checkAuth, updateUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");

    // Profile form
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password form
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});

    // Preferences
    const [preferences, setPreferences] = useState({});
    const [savingPrefs, setSavingPrefs] = useState(false);

    // Modals
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Load user data
    useEffect(() => {
        if (user) {
            const nameParts = (user.name || "").split(" ");
            setProfile({
                firstName: user.firstName || nameParts[0] || "",
                lastName: user.lastName || nameParts.slice(1).join(" ") || "",
                email: user.email || "",
                phone: user.phone || "",
                bio: user.bio || "",
            });
            setPreferences(user.preferences || {});
        }
    }, [user]);

    const handleProfileSave = async () => {
        setSavingProfile(true);
        try {
            if (avatarFile) {
                const formData = new FormData();
                formData.append("firstName", profile.firstName);
                formData.append("lastName", profile.lastName);
                formData.append("phone", profile.phone);
                formData.append("bio", profile.bio);
                formData.append("avatar", avatarFile);
                const { data } = await axios.put("/api/auth/profile", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                });
                if (data.success && data.user) {
                    updateUser?.(data.user);
                    toast.success("Profile updated successfully!");
                }
            } else {
                const { data } = await axios.put("/api/auth/profile", {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone,
                    bio: profile.bio,
                }, { withCredentials: true });
                if (data.success && data.user) {
                    updateUser?.(data.user);
                    toast.success("Profile updated successfully!");
                }
            }
            setAvatarFile(null);
            checkAuth?.();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        setSavingPrefs(true);
        try {
            const response = await updatePreferences({ [key]: value });
            if (response.success) {
                setPreferences((p) => ({ ...p, [key]: value }));
                updateUser?.({ ...user, preferences: response.preferences || { ...preferences, [key]: value } });
                toast.success("Preference saved");
            }
        } catch (error) {
            toast.error(error.message || "Failed to save preference");
        } finally {
            setSavingPrefs(false);
        }
    };

    const handleExportData = async (format) => {
        setExportLoading(true);
        try {
            const blob = await exportData(format);
            downloadFile(blob, `user-data-${Date.now()}.${format}`);
            toast.success(`Data exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error("Failed to export data");
        } finally {
            setExportLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        const errors = {};
        if (!passwords.currentPassword) errors.current = "Current password is required";
        if (!passwords.newPassword) errors.new = "New password is required";
        if (passwords.newPassword.length < 8) errors.new = "Minimum 8 characters";
        if (passwords.newPassword !== passwords.confirmPassword) {
            errors.confirm = "Passwords don't match";
        }
        setPasswordErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSavingPassword(true);
        try {
            const { data } = await axios.put("/api/auth/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            }, { withCredentials: true });
            if (data.success) {
                toast.success("Password changed successfully!");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setPasswordModalOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "preferences", label: "Preferences", icon: Shield },
        { id: "account", label: "Account", icon: Shield },
        { id: "password", label: "Password", icon: Lock },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Profile Settings</h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-[var(--color-background-secondary)] p-1 rounded-xl w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                activeTab === tab.id
                                    ? "bg-white text-[var(--color-primary)] shadow-sm"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                    <h3 className="font-bold mb-5">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">First Name</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, firstName: e.target.value }))
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Last Name</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, lastName: e.target.value }))
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                                <Mail size={14} /> Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-gray-50 text-sm text-[var(--color-text-secondary)] cursor-not-allowed"
                            />
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                Email cannot be changed.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                                <Phone size={14} /> Phone
                            </label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, phone: e.target.value }))
                                }
                                placeholder="Optional"
                                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm bg-white"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1.5">Bio</label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, bio: e.target.value }))
                            }
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm bg-white"
                        />
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">Max 500 characters</p>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1.5">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={user?.avatar}
                                alt={user?.name}
                                size="xl"
                            />
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-[var(--color-border)] file:text-sm file:font-medium file:bg-[var(--color-background-secondary)] hover:file:bg-gray-100"
                                />
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">PNG, JPG, WEBP up to 5MB</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-border)]">
                        <button
                            type="button"
                            onClick={() => setPasswordModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition"
                        >
                            <Lock size={16} /> Change Password
                        </button>
                        <button
                            onClick={handleProfileSave}
                            disabled={savingProfile}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
                        >
                            {savingProfile ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                        <h3 className="font-bold mb-4">Notification Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Email Notifications</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Receive notifications via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences.emailNotifications ?? true}
                                        onChange={(e) =>
                                            handlePreferenceChange("emailNotifications", e.target.checked)
                                        }
                                        disabled={savingPrefs}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">Push Notifications</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Receive push notifications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences.pushNotifications ?? true}
                                        onChange={(e) =>
                                            handlePreferenceChange("pushNotifications", e.target.checked)
                                        }
                                        disabled={savingPrefs}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Notification Frequency</label>
                                <select
                                    value={preferences.notificationFrequency || "immediate"}
                                    onChange={(e) =>
                                        handlePreferenceChange("notificationFrequency", e.target.value)
                                    }
                                    disabled={savingPrefs}
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm bg-white"
                                >
                                    <option value="immediate">Immediate</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="weekly">Weekly Summary</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                        <h3 className="font-bold mb-4">Display Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Theme</label>
                                <select
                                    value={preferences.theme || "system"}
                                    onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                                    disabled={savingPrefs}
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm bg-white"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System Default</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date Format</label>
                                <select
                                    value={preferences.dateFormat || "MM/DD/YYYY"}
                                    onChange={(e) =>
                                        handlePreferenceChange("dateFormat", e.target.value)
                                    }
                                    disabled={savingPrefs}
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm bg-white"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                        <h3 className="font-bold mb-4">Privacy</h3>
                        <div>
                            <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                            <select
                                value={preferences.profileVisibility || "public"}
                                onChange={(e) =>
                                    handlePreferenceChange("profileVisibility", e.target.value)
                                }
                                disabled={savingPrefs}
                                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm bg-white"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                        <h3 className="font-bold mb-4">Account Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">Status</span>
                                <span className="font-medium capitalize text-green-600">{user?.status || "active"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">Created</span>
                                <span className="font-medium">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">Last Login</span>
                                <span className="font-medium">
                                    {user?.lastLogin
                                        ? new Date(user.lastLogin).toLocaleString()
                                        : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                        <h3 className="font-bold mb-4">Export Your Data</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                            Download a copy of your data (GDPR compliance)
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleExportData("json")}
                                disabled={exportLoading}
                                className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                <Download size={16} /> Export JSON
                            </button>
                            <button
                                onClick={() => handleExportData("csv")}
                                disabled={exportLoading}
                                className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border-2 border-red-200 p-6">
                        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} /> Danger Zone
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm mb-1">Deactivate Account</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                                    Temporarily suspend your account. Can be reactivated by an administrator.
                                </p>
                                <button
                                    onClick={() => setDeactivateModalOpen(true)}
                                    className="px-4 py-2 text-sm border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition"
                                >
                                    Deactivate Account
                                </button>
                            </div>
                            <div>
                                <h4 className="font-medium text-red-600 text-sm mb-1">Delete Account</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                                    Permanently delete your account. This cannot be undone.
                                </p>
                                <button
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    <Trash2 size={16} /> Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                    <h3 className="font-bold mb-5">Change Password</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        Update your password to keep your account secure.
                    </p>
                    <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition"
                    >
                        <Lock size={16} /> Open Password Change
                    </button>
                </div>
            )}

            {/* Password Modal */}
            <Modal
                isOpen={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                title="Change Password"
            >
                <div className="space-y-4">
                    {[
                        {
                            key: "current",
                            label: "Current Password",
                            field: "currentPassword",
                            error: passwordErrors.current,
                        },
                        {
                            key: "new",
                            label: "New Password",
                            field: "newPassword",
                            error: passwordErrors.new,
                        },
                        {
                            key: "confirm",
                            label: "Confirm New Password",
                            field: "confirmPassword",
                            error: passwordErrors.confirm,
                        },
                    ].map(({ key, label, field, error }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium mb-1.5">{label}</label>
                            <div className="relative">
                                <input
                                    type={showPasswords[key] ? "text" : "password"}
                                    value={passwords[field]}
                                    onChange={(e) =>
                                        setPasswords((p) => ({ ...p, [field]: e.target.value }))
                                    }
                                    className={`w-full px-3 py-2.5 rounded-lg border text-sm pr-10 ${
                                        error ? "border-red-500" : "border-[var(--color-border)]"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswords((s) => ({ ...s, [key]: !s[key] }))
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} /> {error}
                                </p>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setPasswordModalOpen(false)}
                            className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePasswordChange}
                            disabled={savingPassword}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
                        >
                            {savingPassword ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} /> Change Password
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Deactivate Modal */}
            <DeactivateModal
                isOpen={deactivateModalOpen}
                onClose={() => setDeactivateModalOpen(false)}
                onSuccess={() => {
                    setDeactivateModalOpen(false);
                    logout?.();
                }}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onSuccess={() => {
                    setDeleteModalOpen(false);
                    logout?.();
                }}
            />
        </div>
    );
}

function DeactivateModal({ isOpen, onClose, onSuccess }) {
    const [password, setPassword] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            toast.error("Password is required");
            return;
        }
        setLoading(true);
        try {
            const result = await deactivateAccount({ password, reason });
            if (result.success) {
                toast.success("Account deactivated");
                onSuccess?.();
            } else {
                toast.error(result.message || "Failed to deactivate");
            }
        } catch (error) {
            toast.error(error.message || "Failed to deactivate account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)]">
                    Your account will be suspended temporarily. An administrator can reactivate it.
                </p>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Reason (optional)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
                    >
                        {loading ? "Deactivating..." : "Deactivate"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function DeleteModal({ isOpen, onClose, onSuccess }) {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || confirmation !== "DELETE") {
            toast.error("Password required and you must type DELETE to confirm");
            return;
        }
        setLoading(true);
        try {
            const result = await deleteAccount({ password, confirmation });
            if (result.success) {
                toast.success("Account deleted");
                onSuccess?.();
            } else {
                toast.error(result.message || "Failed to delete");
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Account Permanently">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-red-600 font-medium">
                    This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Type DELETE to confirm</label>
                    <input
                        type="text"
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder="DELETE"
                        required
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] text-sm"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || confirmation !== "DELETE"}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete Permanently"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
