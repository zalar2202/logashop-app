"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Loader } from "@/components/common/Loader";
import { Avatar } from "@/components/common/Avatar";
import { ArrowLeft, Edit, Mail, Phone, Calendar, User } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

export default function ViewUserPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await userService.getUserById(unwrappedParams.id);
                setUser(response.data.user);
            } catch (err) {
                setError(err.message || "Failed to load user");
                toast.error("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        if (unwrappedParams.id) {
            fetchUser();
        }
    }, [unwrappedParams.id]);

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case "active":
                return "success";
            case "inactive":
                return "warning";
            case "suspended":
                return "danger";
            default:
                return "default";
        }
    };

    // Get role badge variant
    const getRoleVariant = (role) => {
        switch (role) {
            case "admin":
                return "primary";
            case "manager":
                return "info";
            case "user":
                return "default";
            default:
                return "default";
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <p style={{ color: "var(--color-error)" }}>{error || "User not found"}</p>
                        <Button
                            variant="primary"
                            className="mt-4"
                            onClick={() => router.push("/panel/users")}
                        >
                            Back to Users
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    Back
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            User Details
                        </h1>
                        <p
                            className="text-sm mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            View user information
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        icon={<Edit size={18} />}
                        onClick={() => router.push(`/panel/users/${unwrappedParams.id}/edit`)}
                    >
                        Edit User
                    </Button>
                </div>
            </div>

            {/* User Info Card */}
            <Card>
                <div className="space-y-6">
                    {/* Avatar & Name Header */}
                    <div
                        className="flex items-center gap-4 pb-6 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <Avatar src={user.avatar} alt={user.name} size="2xl" />
                        <div>
                            <h2
                                className="text-2xl font-bold mb-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {user.name}
                            </h2>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label
                            className="text-sm font-medium block mb-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <User size={16} className="inline mr-2" />
                            Full Name
                        </label>
                        <p
                            className="text-lg font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {user.name}
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            className="text-sm font-medium block mb-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <Mail size={16} className="inline mr-2" />
                            Email Address
                        </label>
                        <p className="text-lg" style={{ color: "var(--color-text-primary)" }}>
                            {user.email}
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label
                            className="text-sm font-medium block mb-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <Phone size={16} className="inline mr-2" />
                            Phone Number
                        </label>
                        <p className="text-lg" style={{ color: "var(--color-text-primary)" }}>
                            {user.phone || "Not provided"}
                        </p>
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Role
                            </label>
                            <Badge variant={getRoleVariant(user.role)} size="lg">
                                {user.role}
                            </Badge>
                        </div>
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Status
                            </label>
                            <Badge variant={getStatusVariant(user.status)} size="lg">
                                {user.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div
                        className="grid grid-cols-2 gap-6 pt-6 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <Calendar size={16} className="inline mr-2" />
                                Created At
                            </label>
                            <p style={{ color: "var(--color-text-primary)" }}>
                                {new Date(user.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <Calendar size={16} className="inline mr-2" />
                                Last Updated
                            </label>
                            <p style={{ color: "var(--color-text-primary)" }}>
                                {new Date(user.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Last Login */}
                    {user.lastLogin && (
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <Calendar size={16} className="inline mr-2" />
                                Last Login
                            </label>
                            <p style={{ color: "var(--color-text-primary)" }}>
                                {new Date(user.lastLogin).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </ContentWrapper>
    );
}
