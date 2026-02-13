"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { InputField } from "@/components/forms/InputField";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, loginInitialValues } from "@/schemas/auth.schema";
import { LogIn, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Captcha } from "@/components/forms/Captcha";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);
    const [captchaError, setCaptchaError] = useState("");

    useEffect(() => {
        // Check for error in URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");
        if (errorParam) {
            setError(errorParam);
            toast.error(errorParam);
        }
    }, []);

    const handleSubmit = async (values, { setSubmitting }) => {
        setError("");
        setCaptchaError("");

        if (!isCaptchaSolved) {
            setCaptchaError("Please solve the security check correctly.");
            setSubmitting(false);
            return;
        }

        try {
            const result = await login(values.email, values.password);

            if (result.success) {
                toast.success("Login successful! Welcome back.");

                // Check if there's a redirect path
                const redirectPath = sessionStorage.getItem("redirect_after_login");

                if (redirectPath) {
                    sessionStorage.removeItem("redirect_after_login");
                    router.push(redirectPath);
                } else {
                    router.push("/panel/dashboard");
                }
            } else {
                setError(result.message || "Login failed. Please try again.");
                toast.error(result.message || "Login failed");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 items-center">
                {/* Left Side - Branding */}
                <div className="hidden md:block">
                    <div className="text-center md:text-left">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 overflow-hidden shadow-lg"
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

                        <h1
                            className="text-4xl font-bold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            LogaTech Panel
                        </h1>

                        <p
                            className="text-lg mb-8"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Secure authentication with httpOnly cookies. Manage your business with
                            confidence.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: "🔒", title: "Secure", desc: "XSS & CSRF protected" },
                                { icon: "⚡", title: "Fast", desc: "Optimized performance" },
                                {
                                    icon: "🎨",
                                    title: "Modern",
                                    desc: "Beautiful UI with dark mode",
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

                {/* Right Side - Login Form */}
                <Card className="w-full relative">
                    <div className="p-6">
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
                                LogaTech Admin
                            </h2>
                        </div>

                        <h2
                            className="text-xl font-bold mb-1 hidden md:block"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Welcome Back
                        </h2>

                        <p
                            className="mb-4 hidden md:block"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Sign in to your account
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
                            initialValues={loginInitialValues}
                            validationSchema={loginSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form className="space-y-4">
                                    <InputField
                                        name="email"
                                        type="email"
                                        label="Email Address"
                                        placeholder="admin@logatech.net"
                                        autoComplete="email"
                                    />

                                    <InputField
                                        name="password"
                                        type="password"
                                        label="Password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />

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
                                    >
                                        {!isSubmitting && <LogIn className="mr-2" size={20} />}
                                        {isSubmitting ? "Signing in..." : "Sign In"}
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
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="font-bold hover:underline"
                                    style={{ color: "var(--color-primary)" }}
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="mt-6 text-center">
                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                🔒 Secured with httpOnly cookies
                                <br />
                                Protected against XSS and CSRF attacks
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
