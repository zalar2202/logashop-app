"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { RichEditor } from "@/components/forms/RichEditor";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Mail, Send, Users, Sparkles, Tag, Gift, Eye } from "lucide-react";
import Image from "next/image";
import * as Yup from "yup";

// Schema for email campaign
const emailCampaignSchema = Yup.object().shape({
    recipientType: Yup.string().required("Recipient type is required"),
    recipients: Yup.mixed().when("recipientType", {
        is: (val) => val === "role" || val === "single",
        then: () => Yup.string().required("This field is required"),
        otherwise: () => Yup.mixed().notRequired(),
    }),
    subject: Yup.string().required("Subject is required").max(150, "Subject is too long"),
    preheader: Yup.string().max(100, "Preheader text is too long"),
    headline: Yup.string().required("Headline is required"),
    content: Yup.string().required("Content is required"),
    ctaText: Yup.string(),
    ctaUrl: Yup.string().url("Must be a valid URL"),
    templateType: Yup.string().required("Template type is required"),
});

/**
 * Marketing Email Page
 * Send formatted HTML emails for promotions, offers, and announcements.
 */
export default function MarketingEmailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (user && !["admin", "manager"].includes(user.role)) {
            toast.error("Access denied");
            router.push("/panel");
        }
    }, [user, router]);

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axios.get("/api/users?limit=1000");
                setUsers(response.data.data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, []);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = {
                ...values,
                email: true, // Force email
                type: "marketing", // Special type for formatting
                message: values.content, // Map content to message
                title: values.subject, // Map subject to title
                actionLabel: values.ctaText,
                actionUrl: values.ctaUrl,
            };

            await axios.post("/api/notifications", payload);

            toast.success("Marketing campaign sent successfully!", {
                description: "Emails are being queued for delivery.",
            });
            resetForm();
        } catch (error) {
            console.error("Marketing send error:", error);
            toast.error(error.response?.data?.error || "Failed to send campaign");
        } finally {
            setSubmitting(false);
        }
    };

    const templates = [
        {
            id: "offer",
            name: "Special Offer",
            icon: <Tag className="w-4 h-4" />,
            desc: "Discount or sale announcement",
        },
        {
            id: "newsletter",
            name: "Newsletter",
            icon: <Mail className="w-4 h-4" />,
            desc: "General news and updates",
        },
        {
            id: "product",
            name: "Product Launch",
            icon: <Sparkles className="w-4 h-4" />,
            desc: "New feature or product",
        },
        {
            id: "gift",
            name: "Holiday/Gift",
            icon: <Gift className="w-4 h-4" />,
            desc: "Seasonal greeting",
        },
    ];

    return (
        <ContentWrapper>
            <div className="mb-8">
                <h1
                    className="text-2xl font-bold flex items-center gap-2"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    <Mail className="w-6 h-6 text-purple-600" />
                    Email Marketing
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Send beautiful, branded promotional emails to your customers.
                </p>
            </div>

            <Formik
                initialValues={{
                    recipientType: "all",
                    recipients: "",
                    subject: "",
                    preheader: "",
                    headline: "Big News!",
                    content: "",
                    ctaText: "Learn More",
                    ctaUrl: "https://logatech.net",
                    templateType: "offer",
                }}
                validationSchema={emailCampaignSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Editor Column */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <div className="space-y-6">
                                        {/* Audience Section */}
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider">
                                                <Users className="w-4 h-4" /> Target Audience
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SelectField name="recipientType" label="Send To">
                                                    <option value="all">All Subscribers</option>
                                                    <option value="role">Specific Role</option>
                                                    <option value="single">
                                                        Test User (Single)
                                                    </option>
                                                </SelectField>

                                                {values.recipientType === "role" && (
                                                    <SelectField name="recipients" label="Role">
                                                        <option value="">Select...</option>
                                                        <option value="user">Regular Users</option>
                                                        <option value="manager">Managers</option>
                                                    </SelectField>
                                                )}

                                                {values.recipientType === "single" && (
                                                    <SelectField name="recipients" label="User">
                                                        <option value="">Select...</option>
                                                        {users.map((u) => (
                                                            <option key={u._id} value={u._id}>
                                                                {u.name} ({u.email})
                                                            </option>
                                                        ))}
                                                    </SelectField>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div>
                                            <h3 className="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wider">
                                                Campaign Content
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField
                                                        name="subject"
                                                        label="Email Subject"
                                                        placeholder="e.g., 50% Off Premium Plans!"
                                                    />
                                                    <InputField
                                                        name="preheader"
                                                        label="Preheader Text (Optional)"
                                                        placeholder="Short summary shown in inbox..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-4 gap-3 mb-4">
                                                    {templates.map((t) => (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setFieldValue("templateType", t.id)
                                                            }
                                                            className={`p-3 rounded-lg border text-left transition-all ${
                                                                values.templateType === t.id
                                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`mb-2 ${
                                                                    values.templateType === t.id
                                                                        ? "text-purple-600"
                                                                        : "text-gray-400"
                                                                }`}
                                                            >
                                                                {t.icon}
                                                            </div>
                                                            <div className="font-medium text-xs dark:text-gray-200">
                                                                {t.name}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                <InputField
                                                    name="headline"
                                                    label="Main Headline"
                                                    placeholder="e.g., Summer Sale Starts Now"
                                                />

                                                <RichEditor
                                                    label="Body Content"
                                                    value={values.content}
                                                    onChange={(content) =>
                                                        setFieldValue("content", content)
                                                    }
                                                    error={undefined} // Formik error handling if needed
                                                    touched={undefined}
                                                    height="400px"
                                                />

                                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                                                    <InputField
                                                        name="ctaText"
                                                        label="Button Text"
                                                    />
                                                    <InputField name="ctaUrl" label="Button URL" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => router.push("/panel")}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                icon={<Send className="w-4 h-4" />}
                                            >
                                                Send Campaign
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Preview Column */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <Eye className="w-4 h-4" /> Live Preview
                                        </h3>
                                        <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                            Auto-updating
                                        </div>
                                    </div>

                                    {/* Live Preview Component with values passed */}
                                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
                                        <PreviewCard values={values} />
                                    </div>

                                    <p className="text-xs text-center mt-3 text-gray-400">
                                        This is an approximation. Actual email rendering varies by
                                        client.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </ContentWrapper>
    );
}

// Preview Component that processes the live values
function PreviewCard({ values }) {
    return (
        <div className="flex flex-col h-[600px]">
            {/* Fake Browser Toolbar */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 ml-4 bg-white dark:bg-black/20 rounded-md py-1 px-3 text-xs text-gray-400 truncate">
                    Subject:{" "}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {values.subject || "No Subject"}
                    </span>
                </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-black font-sans">
                {/* Preheader Hint */}
                {values.preheader && (
                    <div className="text-center text-xs text-gray-400 mb-2 pb-2 border-b border-dashed border-gray-200">
                        {values.preheader}
                    </div>
                )}

                <div className="max-w-sm mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* Header Accent */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                    <div className="p-6 text-center">
                        {/* Logo */}
                        <div className="font-bold text-xl text-gray-900 mb-2 flex justify-center items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/assets/logo/LogaTech-512.webp"
                                    alt="LogaShop"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain brightness-0 invert"
                                />
                            </div>
                            LogaShop
                        </div>

                        <div className="h-px bg-gray-100 my-4"></div>

                        {/* Template Badge */}
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-purple-100 text-purple-600">
                                {values.templateType}
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
                            {values.headline || "Your Headline Here"}
                        </h1>

                        {/* Body Content */}
                        <div className="text-gray-600 mb-6 text-sm leading-relaxed whitespace-pre-wrap">
                            {values.content || "Start typing to see your content appear here..."}
                        </div>

                        {/* CTA Button */}
                        {values.ctaText && (
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium text-sm transition-colors shadow-sm"
                            >
                                {values.ctaText}
                            </a>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                        <p>© 2026 LogaShop Inc.</p>
                        <p className="mt-1">123 Tech Avenue, Silicon Valley</p>
                        <div className="mt-2 flex justify-center gap-2 text-indigo-500">
                            <span>Unsubscribe</span> • <span>View in Browser</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
