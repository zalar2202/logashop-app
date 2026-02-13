"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");

    // Profile form
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
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

    // Load user data
    useEffect(() => {
        if (user) {
            setProfile({
                firstName: user.firstName || user.name?.split(" ")[0] || "",
                lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleProfileSave = async () => {
        setSavingProfile(true);
        try {
            const { data } = await axios.put("/api/auth/profile", {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
            });
            if (data.success) {
                toast.success("Profile updated successfully!");
                if (refreshUser) refreshUser();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setSavingProfile(false);
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
            });
            if (data.success) {
                toast.success("Password changed successfully!");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "password", label: "Password", icon: Lock },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Profile Settings</h2>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
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

                    <div className="flex justify-end mt-6">
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

            {/* Password Tab */}
            {activeTab === "password" && (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                    <h3 className="font-bold mb-5">Change Password</h3>
                    <div className="max-w-md space-y-4">
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
                                            setPasswords((p) => ({
                                                ...p,
                                                [field]: e.target.value,
                                            }))
                                        }
                                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white pr-10 ${
                                            error
                                                ? "border-red-500"
                                                : "border-[var(--color-border)]"
                                        } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((s) => ({
                                                ...s,
                                                [key]: !s[key],
                                            }))
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords[key] ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                                {error && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle size={12} /> {error}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-6">
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
            )}
        </div>
    );
}
