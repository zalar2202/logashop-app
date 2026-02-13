"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Debug Authentication Issues
 * Shows exactly what's in cookies and what the API sees
 */
export default function DebugAuthPage() {
    const { user } = useAuth();
    const [debugInfo, setDebugInfo] = useState(null);

    const handleDebugCookies = () => {
        const cookies = document.cookie;
        const cookieObj = {};

        cookies.split(";").forEach((cookie) => {
            const [key, value] = cookie.trim().split("=");
            cookieObj[key] = value;
        });

        setDebugInfo({
            allCookies: cookies,
            parsedCookies: cookieObj,
            hasTokenCookie: !!cookieObj.token,
            tokenLength: cookieObj.token ? cookieObj.token.length : 0,
            tokenPreview: cookieObj.token ? cookieObj.token.substring(0, 50) + "..." : "None",
        });
    };

    const handleTestAPI = async () => {
        try {
            // Test both auth check and cookie check
            const [authResponse, cookieResponse] = await Promise.all([
                fetch("/api/auth/check", {
                    method: "GET",
                    credentials: "include",
                }),
                fetch("/api/debug/check-cookie", {
                    method: "GET",
                    credentials: "include",
                }),
            ]);

            const authData = await authResponse.json();
            const cookieData = await cookieResponse.json();

            setDebugInfo((prev) => ({
                ...prev,
                apiResponse: authResponse.status,
                apiData: authData,
                apiWorked: authResponse.ok,
                serverCookieCheck: cookieData,
                serverCanReadCookie: cookieData.success,
            }));
        } catch (error) {
            setDebugInfo((prev) => ({
                ...prev,
                apiError: error.message,
            }));
        }
    };

    const handleManualLogin = async () => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "admin@logatech.net",
                    password: "Admin@123",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Login successful! Check cookies now.");
                handleDebugCookies();
            } else {
                alert(`❌ Login failed: ${data.error}`);
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    return (
        <ContentWrapper>
            <Card>
                <h1
                    className="text-2xl font-bold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    🔍 Authentication Debug Tool
                </h1>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">User from Context:</h3>
                        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={handleDebugCookies}>1. Check Browser Cookies</Button>
                        <Button onClick={handleTestAPI} variant="secondary">
                            2. Test Auth API
                        </Button>
                        <Button onClick={handleManualLogin} variant="secondary">
                            3. Manual Login
                        </Button>
                    </div>

                    {debugInfo && (
                        <div className="mt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Debug Information:</h3>
                                <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-96">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>

                            {debugInfo.hasTokenCookie === false && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                                    <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                                        ℹ️ COOKIE NOT VISIBLE TO JAVASCRIPT
                                    </h3>
                                    <p className="text-sm">
                                        <strong>This is normal if your cookie is httpOnly!</strong>
                                        <br />
                                        <br />
                                        JavaScript cannot see httpOnly cookies (security feature).
                                        <br />
                                        <br />
                                        Check Application → Cookies in DevTools to verify it exists.
                                        <br />
                                        <br />
                                        <strong>What matters:</strong> Can the SERVER read it?
                                        <br />
                                        Click &quot;Test Auth API&quot; to check server-side access.
                                    </p>
                                </div>
                            )}

                            {debugInfo.serverCookieCheck && (
                                <div
                                    className={`p-4 border-l-4 rounded ${
                                        debugInfo.serverCanReadCookie
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                                            : "bg-red-50 dark:bg-red-900/20 border-red-500"
                                    }`}
                                >
                                    <h3
                                        className={`font-bold mb-2 ${
                                            debugInfo.serverCanReadCookie
                                                ? "text-green-700 dark:text-green-400"
                                                : "text-red-700 dark:text-red-400"
                                        }`}
                                    >
                                        {debugInfo.serverCanReadCookie
                                            ? "✅ SERVER CAN READ AUTH COOKIE!"
                                            : "❌ SERVER CANNOT READ AUTH COOKIE"}
                                    </h3>
                                    <p className="text-sm">{debugInfo.serverCookieCheck.message}</p>
                                    {debugInfo.serverCookieCheck.decoded && (
                                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                            {JSON.stringify(
                                                debugInfo.serverCookieCheck.decoded,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    )}
                                </div>
                            )}

                            {debugInfo.hasTokenCookie && !debugInfo.apiWorked && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                                    <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                                        ⚠️ COOKIE EXISTS BUT API FAILS!
                                    </h3>
                                    <p className="text-sm">
                                        The cookie exists but verification is failing.
                                        <br />
                                        <br />
                                        <strong>This means:</strong>
                                        <br />
                                        • JWT_SECRET in .env.local might be wrong/missing
                                        <br />
                                        • Or the token format is corrupted
                                        <br />
                                        <br />
                                        <strong>Check your .env.local has:</strong>
                                        <br />
                                        <code>
                                            JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
                                        </code>
                                    </p>
                                </div>
                            )}

                            {debugInfo.apiWorked && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
                                    <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">
                                        ✅ AUTHENTICATION WORKING!
                                    </h3>
                                    <p className="text-sm">
                                        Everything is fine! You can now use the Backend Notification
                                        Test page.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <h2
                    className="text-xl font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    📋 Common Issues & Solutions
                </h2>
                <div className="space-y-3 text-sm">
                    <div>
                        <strong className="text-red-600">Issue: No token cookie</strong>
                        <p className="ml-4 text-gray-600 dark:text-gray-400">
                            → Login is not setting httpOnly cookie
                            <br />→ Try &quot;Manual Login&quot; button above
                        </p>
                    </div>
                    <div>
                        <strong className="text-red-600">Issue: JWT_SECRET mismatch</strong>
                        <p className="ml-4 text-gray-600 dark:text-gray-400">
                            → Check .env.local has JWT_SECRET
                            <br />→ Restart dev server after changing .env
                        </p>
                    </div>
                    <div>
                        <strong className="text-red-600">Issue: Cookie not sent to API</strong>
                        <p className="ml-4 text-gray-600 dark:text-gray-400">
                            → Check credentials: &apos;include&apos; in fetch
                            <br />→ Check browser allows cookies for localhost
                        </p>
                    </div>
                </div>
            </Card>
        </ContentWrapper>
    );
}
