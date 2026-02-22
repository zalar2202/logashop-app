"use client";

import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { useAppDispatch } from "@/lib/hooks";
import { createUser } from "@/features/users/usersSlice";
import { userSchema, userInitialValues } from "@/schemas/user.schema";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { ArrowLeft } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

export default function CreateUserPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            await dispatch(createUser(values)).unwrap();
            toast.success("User created successfully");
            router.push("/panel/admin/users");
        } catch (error) {
            toast.error(error.message || "Failed to create user");

            // Handle validation errors
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

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
                    Create New User
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Add a new user to the system
                </p>
            </div>

            {/* Form */}
            <Card>
                <Formik
                    initialValues={userInitialValues}
                    validationSchema={userSchema}
                    onSubmit={handleSubmit}
                    context={{ isEdit: false }}
                >
                    {({ isSubmitting }) => (
                        <Form>
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
                                    placeholder="Enter password"
                                    required
                                    helperText="Minimum 6 characters"
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

                            {/* Avatar - Full Width */}
                            <div className="mb-6">
                                <FileUploadField
                                    name="avatar"
                                    label="Avatar Image (Optional)"
                                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                    maxSize={5 * 1024 * 1024}
                                    helperText="Upload a profile picture (PNG, JPG, WEBP - Max 5MB)"
                                    showPreview={true}
                                />
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
                                    Create User
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
