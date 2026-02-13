"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { InputField } from "@/components/forms/InputField";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { signupSchema, signupInitialValues } from "@/schemas/auth.schema";
import { UserPlus, Shield, AlertCircle, Wand2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Captcha } from "@/components/forms/Captcha";

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);
    const [captchaError, setCaptchaError] = useState("");

    const generatePassword = (setFieldValue) => {
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setFieldValue("password", password);
        setFieldValue("confirmPassword", password);
        toast.info("Secure password generated!");
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setError("");
        setCaptchaError("");

        if (!isCaptchaSolved) {
            setCaptchaError("Please solve the security check correctly.");
            setSubmitting(false);
            return;
        }

        try {
            const response = await axios.post("/api/auth/signup", {
                name: values.name,
                email: values.email,
                password: values.password,
            });

            if (response.data.success) {
                toast.success("Account created successfully! Welcome.");
                router.push("/panel/dashboard");
            } else {
                setError(response.data.message || "Signup failed. Please try again.");
                toast.error(response.data.message || "Signup failed");
            }
        } catch (err) {
            const message =
                err.response?.data?.message || "An unexpected error occurred. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden md:block">
                    <div className="text-center md:text-left">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 overflow-hidden shadow-xl"
                            style={{ backgroundColor: "var(--color-primary)" }}
                        >
                            <Image
                                src="/assets/logo/LogaTech-512.webp"
                                alt="LogaTech"
                                width={64}
                                height={64}
                                className="w-16 h-16 object-contain brightness-0 invert"
                            />
                        </div>

                        <h1
                            className="text-4xl font-bold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            LogaTech User Panel
                        </h1>

                        <p
                            className="text-lg mb-8"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Join our community and manage your business with ease.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: "🚀", title: "Join Today", desc: "Get started in seconds" },
                                {
                                    icon: "🛡️",
                                    title: "Secure",
                                    desc: "Your data is always protected",
                                },
                                {
                                    icon: "📱",
                                    title: "Flexible",
                                    desc: "Access from any device",
                                },
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-3xl">{feature.icon}</span>
                                    <div>
                                        <p
                                            className="font-semibold"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {feature.title}
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <Card className="w-full relative">
                    <div className="p-8">
                        {/* Homepage Button */}
                        <Link
                            href="/"
                            className="absolute top-4 right-6 flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color: "var(--color-primary)" }}
                        >
                            <ArrowLeft size={16} />
                            Homepage
                        </Link>
                        {/* Mobile Logo */}
                        <div className="md:hidden text-center mb-6">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 overflow-hidden shadow-lg mx-auto"
                                style={{ backgroundColor: "var(--color-primary)" }}
                            >
                                <Image
                                    src="/assets/logo/LogaTech-512.webp"
                                    alt="LogaTech"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 object-contain brightness-0 invert"
                                />
                            </div>
                            <h2
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                LogaTech
                            </h2>
                        </div>

                        <h2
                            className="text-2xl font-bold mb-2 hidden md:block"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Create Account
                        </h2>

                        <p
                            className="mb-6 hidden md:block"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Get started with your new account
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div
                                className="mb-6 p-4 rounded-lg flex items-start gap-3"
                                style={{
                                    backgroundColor: "var(--color-error-light)",
                                    borderLeft: "4px solid var(--color-error)",
                                }}
                            >
                                <AlertCircle
                                    size={20}
                                    style={{ color: "var(--color-error)" }}
                                    className="flex-shrink-0 mt-0.5"
                                />
                                <p className="text-sm" style={{ color: "var(--color-error)" }}>
                                    {error}
                                </p>
                            </div>
                        )}

                        <Formik
                            initialValues={signupInitialValues}
                            validationSchema={signupSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, setFieldValue }) => (
                                <Form className="space-y-4">
                                    <InputField
                                        name="name"
                                        label="Full Name"
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />

                                    <InputField
                                        name="email"
                                        type="email"
                                        label="Email Address"
                                        placeholder="john@example.com"
                                        autoComplete="email"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField
                                            name="password"
                                            type="password"
                                            label="Password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
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
                                        />
                                        <InputField
                                            name="confirmPassword"
                                            type="password"
                                            label="Confirm Password"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <Captcha
                                        error={captchaError}
                                        onVerify={(solved) => {
                                            setIsCaptchaSolved(solved);
                                            if (solved) setCaptchaError("");
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                        fullWidth
                                        size="lg"
                                        className="mt-2"
                                    >
                                        {!isSubmitting && <UserPlus className="mr-2" size={20} />}
                                        {isSubmitting ? "Creating account..." : "Create Account"}
                                    </Button>
                                </Form>
                            )}
                        </Formik>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-[var(--color-border)]"></div>
                            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">
                                or
                            </span>
                            <div className="h-px flex-1 bg-[var(--color-border)]"></div>
                        </div>

                        {/* Google Login Button */}
                        <Button
                            variant="secondary"
                            fullWidth
                            size="lg"
                            className="bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 py-3"
                            onClick={() => (window.location.href = "/api/auth/google")}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M23.5 12.235c0-.822-.066-1.644-.206-2.441H12v4.628h6.456a5.57 5.57 0 0 1-2.407 3.65v3.016h3.882c2.269-2.087 3.569-5.161 3.569-8.853z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 24c3.24 0 5.957-1.071 7.942-2.912l-3.882-3.016c-1.077.729-2.464 1.156-4.06 1.156-3.114 0-5.751-2.099-6.696-4.918H1.423v3.111C3.401 21.365 7.426 24 12 24z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.304 14.31a7.197 7.197 0 0 1 0-4.619V6.58H1.423a12.003 12.003 0 0 0 0 10.84l3.881-3.11z"
                                    fill="#FBBC04"
                                />
                                <path
                                    d="M12 4.75c1.763 0 3.344.604 4.588 1.789l3.447-3.447C17.952 1.189 15.234 0 12 0 7.426 0 3.401 2.635 1.423 6.58L5.304 9.69C6.249 6.871 8.886 4.75 12 4.75z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-gray-700 font-medium">Continue with Google</span>
                        </Button>

                        <div className="mt-6 text-center">
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-bold hover:underline"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
