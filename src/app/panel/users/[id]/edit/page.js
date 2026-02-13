"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { useAppDispatch } from "@/lib/hooks";
import { updateUser } from "@/features/users/usersSlice";
import { userService } from "@/services/user.service";
import { userSchema, getUserEditInitialValues } from "@/schemas/user.schema";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Avatar } from "@/components/common/Avatar";
import { Loader } from "@/components/common/Loader";
import { ArrowLeft, Upload, Globe, Server, Key, Cpu, User as UserIcon } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

export default function EditUserPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);

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

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            // Remove password if empty (don't update password)
            const updateData = { ...values };
            if (!updateData.password) {
                delete updateData.password;
            }

            await dispatch(
                updateUser({
                    id: unwrappedParams.id,
                    userData: updateData,
                })
            ).unwrap();

            toast.success("User updated successfully");
            router.push("/panel/users");
        } catch (error) {
            toast.error(error.message || "Failed to update user");

            // Handle validation errors
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setSubmitting(false);
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
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Edit User
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Update user information
                </p>
            </div>

            {/* Form */}
            <Card>
                <Formik
                    initialValues={getUserEditInitialValues(user)}
                    validationSchema={userSchema}
                    onSubmit={handleSubmit}
                    context={{ isEdit: true }}
                    enableReinitialize
                >
                    {({ isSubmitting }) => (
                        <Form>
                            {/* Avatar Section */}
                            <div
                                className="flex flex-col items-center pb-8 mb-8 border-b"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Avatar src={user.avatar} alt={user.name} size="2xl" />
                                <h3
                                    className="text-xl font-semibold mt-4"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {user.name}
                                </h3>
                                <p
                                    className="text-sm mb-4"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {user.email}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                        color: "var(--color-primary)",
                                        backgroundColor: "var(--color-primary-light)",
                                    }}
                                >
                                    <Upload size={16} />
                                    {showAvatarUpload ? "Hide Avatar Upload" : "Update Avatar"}
                                </button>
                            </div>

                            {/* Avatar Upload Field (Conditional) */}
                            {showAvatarUpload && (
                                <div className="mb-8">
                                    <FileUploadField
                                        name="avatar"
                                        label="Upload New Avatar"
                                        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                        maxSize={5 * 1024 * 1024}
                                        helperText="Upload a new profile picture to replace the existing one (PNG, JPG, WEBP - Max 5MB)"
                                        showPreview={true}
                                    />
                                </div>
                            )}

                            {/* Form Fields - 2 Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Name */}
                                <InputField
                                    name="name"
                                    label="Full Name"
                                    placeholder="Enter full name"
                                    required
                                />

                                {/* Email */}
                                <InputField
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter email address"
                                    required
                                />

                                {/* Password */}
                                <InputField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Leave empty to keep current"
                                    helperText="Leave empty to keep current password"
                                />

                                {/* Phone */}
                                <InputField
                                    name="phone"
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="Enter phone number (optional)"
                                />

                                {/* Role */}
                                <SelectField name="role" label="Role" required>
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </SelectField>

                                {/* Status */}
                                <SelectField name="status" label="Status" required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </SelectField>
                            </div>

                            {/* Technical Details Section */}
                            <div className="pt-6 mt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                    <Cpu className="w-5 h-5 text-[var(--color-primary)]" />
                                    Technical Details (Pro)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <InputField
                                        name="technicalDetails.domainName"
                                        label="Domain Name"
                                        placeholder="example.com"
                                        icon={<Globe className="w-4 h-4" />}
                                    />
                                    <InputField
                                        name="technicalDetails.serverIP"
                                        label="Server IP Address"
                                        placeholder="1.2.3.4"
                                        icon={<Server className="w-4 h-4" />}
                                    />
                                    <InputField
                                        name="technicalDetails.serverUser"
                                        label="Server Username"
                                        placeholder="root"
                                        icon={<UserIcon className="w-4 h-4" />}
                                    />
                                    <InputField
                                        name="technicalDetails.serverPassword"
                                        label="Server Password"
                                        type="password"
                                        placeholder="********"
                                        icon={<Key className="w-4 h-4" />}
                                    />
                                    <InputField
                                        name="technicalDetails.serverPort"
                                        label="SSH/FTP Port"
                                        placeholder="22"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex gap-3 pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    Update User
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </ContentWrapper>
    );
}
