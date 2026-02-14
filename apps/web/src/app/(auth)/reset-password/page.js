"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { toast } from "sonner";
import { Loader2, Eye as EyeIcon, EyeOff as EyeOffIcon, Lock as LockIcon } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid link. Please request a new password reset.");
            router.push("/forgot-password");
        }
    }, [token, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                toast.success("Password reset successfully!");
            } else {
                toast.error(data.error || "Failed to reset password");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-green-500 w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
                <p className="text-gray-600 mb-6">
                    Your password has been updated successfully. You can now log in with your new
                    credentials.
                </p>
                <NextLink
                    href="/login"
                    className="w-full inline-block bg-[var(--color-primary)] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition"
                >
                    Log In Now
                </NextLink>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
                <p className="text-gray-600">Create a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                            placeholder="Min. 6 characters"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                            placeholder="Repeat password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                        </button>
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
                            Resetting...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <NextLink
                    href="/login"
                    className="text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition"
                >
                    Back to Login
                </NextLink>
            </div>
        </div>
    );
}

// Just a small helper for standard Check icon
function Check({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="max-w-md mx-auto p-6 flex items-center justify-center min-h-[200px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
