"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { CheckCircle2, XCircle, Network, Send, Key, RefreshCw, LogIn, LogOut } from "lucide-react";
import { api } from "@/lib/axios";
import { InputField } from "@/components/forms/InputField";

export default function TestAxiosPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    // Login form state
    const [email, setEmail] = useState("admin@logatech.net");
    const [password, setPassword] = useState("Admin@123");

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Check if user is authenticated
    const checkAuth = async () => {
        setAuthChecking(true);
        try {
            const response = await api.get("/api/auth/check");
            setIsAuthenticated(response.data.authenticated);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setAuthChecking(false);
        }
    };

    // Login function
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post("/api/auth/login", { email, password });

            if (response.data.success) {
                setIsAuthenticated(true);
                setResult({
                    success: true,
                    type: "LOGIN",
                    data: response.data,
                });
            }
        } catch (error) {
            setResult({
                success: false,
                type: "LOGIN",
                error: error.message || "Login failed",
                details: error,
            });
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const handleLogout = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post("/api/auth/logout");

            if (response.data.success) {
                setIsAuthenticated(false);
                setResult({
                    success: true,
                    type: "LOGOUT",
                    data: response.data,
                });
            }
        } catch (error) {
            setResult({
                success: false,
                type: "LOGOUT",
                error: error.message || "Logout failed",
                details: error,
            });
        } finally {
            setLoading(false);
        }
    };

    // Test GET request
    const testGet = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await api.get("/api/test-axios");
            setResult({
                success: true,
                type: "GET",
                data: response.data,
            });
        } catch (error) {
            setResult({
                success: false,
                type: "GET",
                error: error.message || "Request failed",
                details: error,
            });
        } finally {
            setLoading(false);
        }
    };

    // Test POST request
    const testPost = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post("/api/test-axios", {
                testData: "Hello from Axios with cookies!",
                timestamp: new Date().toISOString(),
                random: Math.random(),
            });
            setResult({
                success: true,
                type: "POST",
                data: response.data,
            });
        } catch (error) {
            setResult({
                success: false,
                type: "POST",
                error: error.message || "Request failed",
                details: error,
            });
        } finally {
            setLoading(false);
        }
    };

    if (authChecking) {
        return (
            <ContentWrapper>
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="animate-spin mr-2" size={24} />
                    <span>Checking authentication...</span>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Axios + httpOnly Cookies Test
                </h1>
                <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
                    Test Axios HTTP client with httpOnly cookies for secure authentication.
                </p>
            </div>

            {/* Auth Status Card */}
            <Card className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: isAuthenticated
                                    ? "var(--color-success-light)"
                                    : "var(--color-error-light)",
                            }}
                        >
                            <Key
                                size={24}
                                style={{
                                    color: isAuthenticated
                                        ? "var(--color-success)"
                                        : "var(--color-error)",
                                }}
                            />
                        </div>
                        <div>
                            <h3
                                className="font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Authentication Status
                            </h3>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                {isAuthenticated
                                    ? "✓ Authenticated (httpOnly cookie is set)"
                                    : "✗ Not authenticated (no cookie)"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={checkAuth}
                            size="sm"
                            variant="secondary"
                            disabled={loading}
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Refresh Status
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Login/Logout Card */}
            {!isAuthenticated ? (
                <Card className="mb-6">
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Test Login (Sets httpOnly Cookie)
                    </h3>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <InputField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@logatech.net"
                        />
                        <InputField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin@123"
                        />
                        <Button type="submit" disabled={loading} fullWidth>
                            {loading ? (
                                <>
                                    <RefreshCw className="animate-spin mr-2" size={18} />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2" size={18} />
                                    Login (Mock)
                                </>
                            )}
                        </Button>
                    </form>
                    <p
                        className="mt-3 text-sm text-center"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Use: admin@logatech.net / Admin@123
                    </p>
                </Card>
            ) : (
                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                You are logged in!
                            </h3>
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                JWT token is stored in httpOnly cookie (invisible to JavaScript)
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="danger" disabled={loading}>
                            {loading ? (
                                <>
                                    <RefreshCw className="animate-spin mr-2" size={18} />
                                    Logging out...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2" size={18} />
                                    Logout
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Test API Calls Card */}
            <Card>
                <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <Network size={40} style={{ color: "var(--color-primary)" }} />
                    </div>

                    <h2
                        className="text-xl font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Test API Requests
                    </h2>

                    <p
                        className="text-sm mb-6 text-center max-w-md"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        These requests will automatically send your authentication cookie. Try
                        before and after logging in!
                    </p>

                    <div className="flex gap-3 mb-8">
                        <Button onClick={testGet} disabled={loading}>
                            {loading ? (
                                <RefreshCw className="animate-spin mr-2" size={18} />
                            ) : (
                                <Network className="mr-2" size={18} />
                            )}
                            Test GET
                        </Button>

                        <Button onClick={testPost} disabled={loading} variant="success">
                            {loading ? (
                                <RefreshCw className="animate-spin mr-2" size={18} />
                            ) : (
                                <Send className="mr-2" size={18} />
                            )}
                            Test POST
                        </Button>
                    </div>

                    {/* Results Display */}
                    {result && (
                        <div className="w-full max-w-2xl">
                            <div
                                className={`rounded-lg p-6 ${
                                    result.success
                                        ? "bg-green-50 dark:bg-green-900/20"
                                        : "bg-red-50 dark:bg-red-900/20"
                                }`}
                                style={{
                                    borderLeft: `4px solid ${
                                        result.success
                                            ? "var(--color-success)"
                                            : "var(--color-error)"
                                    }`,
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    {result.success ? (
                                        <CheckCircle2
                                            size={24}
                                            style={{ color: "var(--color-success)" }}
                                            className="flex-shrink-0 mt-0.5"
                                        />
                                    ) : (
                                        <XCircle
                                            size={24}
                                            style={{ color: "var(--color-error)" }}
                                            className="flex-shrink-0 mt-0.5"
                                        />
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3
                                                className="font-semibold text-lg"
                                                style={{
                                                    color: result.success
                                                        ? "var(--color-success)"
                                                        : "var(--color-error)",
                                                }}
                                            >
                                                {result.type} Request
                                            </h3>
                                            <span
                                                className="px-2 py-1 text-xs rounded"
                                                style={{
                                                    backgroundColor: result.success
                                                        ? "var(--color-success)"
                                                        : "var(--color-error)",
                                                    color: "white",
                                                }}
                                            >
                                                {result.success ? "SUCCESS" : "FAILED"}
                                            </span>
                                        </div>

                                        {result.success ? (
                                            <div className="space-y-3">
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {result.data.message}
                                                </p>

                                                <details className="mt-3">
                                                    <summary
                                                        className="cursor-pointer text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        View Full Response
                                                    </summary>
                                                    <pre
                                                        className="mt-2 p-3 rounded text-xs overflow-auto"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--color-background-secondary)",
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {JSON.stringify(result.data, null, 2)}
                                                    </pre>
                                                </details>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {result.error}
                                                </p>
                                                {result.details && (
                                                    <details>
                                                        <summary
                                                            className="cursor-pointer text-sm font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            View Error Details
                                                        </summary>
                                                        <pre
                                                            className="mt-2 p-3 rounded text-xs overflow-auto"
                                                            style={{
                                                                backgroundColor:
                                                                    "var(--color-background-secondary)",
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            {JSON.stringify(
                                                                result.details,
                                                                null,
                                                                2
                                                            )}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Features Card */}
            <Card className="mt-6">
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    httpOnly Cookie Features
                </h3>
                <div className="space-y-3">
                    {[
                        {
                            icon: "🔒",
                            title: "XSS Protection",
                            desc: "JavaScript cannot access the token (httpOnly flag)",
                        },
                        {
                            icon: "🔐",
                            title: "Automatic Transmission",
                            desc: "Cookies sent automatically with every request",
                        },
                        {
                            icon: "✅",
                            title: "CSRF Protection",
                            desc: "SameSite=lax prevents cross-site attacks",
                        },
                        {
                            icon: "🚀",
                            title: "Simpler Code",
                            desc: "No need for manual token management in frontend",
                        },
                        {
                            icon: "🛡️",
                            title: "Secure Flag",
                            desc: "Cookies only sent over HTTPS in production",
                        },
                        {
                            icon: "⚡",
                            title: "Server-Side Ready",
                            desc: "Works with Server Components and middleware",
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded"
                            style={{
                                backgroundColor: "var(--color-background-secondary)",
                            }}
                        >
                            <span className="text-xl">{feature.icon}</span>
                            <div>
                                <p
                                    className="font-medium"
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
            </Card>
        </ContentWrapper>
    );
}
