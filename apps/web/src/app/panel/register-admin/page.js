"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { CheckboxField } from "@/components/forms/CheckboxField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { TimePickerField } from "@/components/forms/TimePickerField";
import { FormError } from "@/components/forms/FormError";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/common/Button";
import { adminRegistrationSchema } from "@/schemas/adminRegistration.schema";
import { toast } from "sonner";
import { UserPlus, Save, X } from "lucide-react";

const roleOptions = [
    { value: "super_admin", label: "Super Administrator" },
    { value: "admin", label: "Administrator" },
    { value: "moderator", label: "Moderator" },
];

export default function RegisterAdminPage() {
    const [serverError, setServerError] = useState(null);

    const initialValues = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        confirmPassword: "",
        bio: "",
        avatar: null,
        hireDate: "",
        startTime: "",
        isActive: true,
        acceptTerms: false,
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setServerError(null);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock success
            console.log("Form submitted:", values);

            toast.success("Admin registered successfully!", {
                description: `${values.firstName} ${values.lastName} has been added as ${values.role.replace("_", " ")}.`,
            });

            resetForm();
        } catch (error) {
            setServerError(error.message || "Failed to register admin. Please try again.");
            toast.error("Registration failed", {
                description: "Please check the form and try again.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ContentWrapper>
            <div className="max-w-3xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary)",
                            }}
                        >
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Register New Admin
                        </h1>
                    </div>
                    <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
                        Create a new administrator account with access to the panel
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="rounded-lg p-8"
                    style={{
                        backgroundColor: "var(--color-background-elevated)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >
                    <Formik
                        initialValues={initialValues}
                        validationSchema={adminRegistrationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, isValid, dirty, resetForm }) => (
                            <Form className="space-y-6">
                                {/* Server Error */}
                                {serverError && <FormError message={serverError} />}

                                {/* Personal Information */}
                                <div>
                                    <h2
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            name="firstName"
                                            label="First Name"
                                            placeholder="John"
                                            required
                                        />
                                        <InputField
                                            name="lastName"
                                            label="Last Name"
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h2
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Contact Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            name="email"
                                            label="Email Address"
                                            type="email"
                                            placeholder="john.doe@logatech.net"
                                            required
                                        />
                                        <InputField
                                            name="phone"
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Account Settings */}
                                <div>
                                    <h2
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Account Settings
                                    </h2>
                                    <div className="space-y-4">
                                        <SelectField
                                            name="role"
                                            label="Admin Role"
                                            options={roleOptions}
                                            placeholder="Select a role"
                                            required
                                            helperText="Choose the appropriate access level for this admin"
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <DatePickerField
                                                name="hireDate"
                                                label="Hire Date (Optional)"
                                                helperText="Select the hire date"
                                                max={new Date().toISOString().split("T")[0]}
                                            />

                                            <TimePickerField
                                                name="startTime"
                                                label="Start Time (Optional)"
                                                helperText="Select the work start time"
                                                step="300"
                                            />
                                        </div>

                                        <TextareaField
                                            name="bio"
                                            label="Bio (Optional)"
                                            placeholder="Brief description about the admin..."
                                            rows={3}
                                            helperText="Maximum 500 characters"
                                        />

                                        <CheckboxField
                                            name="isActive"
                                            label="Account is active (can login immediately)"
                                        />
                                    </div>
                                </div>

                                {/* Profile Picture */}
                                <div>
                                    <h2
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Profile Picture
                                    </h2>
                                    <FileUploadField
                                        name="avatar"
                                        label="Avatar (Optional)"
                                        accept={{
                                            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                                        }}
                                        maxSize={5 * 1024 * 1024}
                                        helperText="Upload a profile picture. Max 5MB. Supported formats: PNG, JPG, GIF, WEBP"
                                        showPreview={true}
                                    />
                                </div>

                                {/* Security */}
                                <div>
                                    <h2
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Security
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            name="password"
                                            label="Password"
                                            type="password"
                                            placeholder="Enter a strong password"
                                            required
                                            helperText="Min 8 characters, with uppercase, lowercase, number, and special character"
                                        />
                                        <InputField
                                            name="confirmPassword"
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="Re-enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div
                                    className="border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                />

                                {/* Terms & Conditions */}
                                <CheckboxField
                                    name="acceptTerms"
                                    label="I confirm that the information provided is accurate and I accept the terms and conditions"
                                    required
                                />

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={isSubmitting}
                                        disabled={!dirty}
                                    >
                                        <Save className="w-4 h-4" />
                                        Register Admin
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => resetForm()}
                                        disabled={isSubmitting || !dirty}
                                    >
                                        <X className="w-4 h-4" />
                                        Reset
                                    </Button>
                                </div>

                                {/* Form Status */}
                                {dirty && !isValid && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Please fill in all required fields correctly
                                    </p>
                                )}
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </ContentWrapper>
    );
}
