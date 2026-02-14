"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
                toast.success("Instructions sent!", {
                    description: "Check your email for the reset link.",
                });
            } else {
                toast.error(data.error || "Failed to send reset link");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-green-500 w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
                <p className="text-gray-600 mb-6">
                    If an account exists for {email}, we've sent instructions to reset your
                    password.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                <p className="text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Send Reset Link"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
