"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

/**
 * Quick Auth Test Page
 * Check if you're properly authenticated
 */
export default function TestAuthPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleTestAuthAPI = async () => {
        try {
            const response = await fetch("/api/auth/check", {
                credentials: "include",
            });
            const data = await response.json();

            if (response.ok) {
                alert(
                    `✅ Authenticated!\n\nUser: ${data.user.name}\nEmail: ${data.user.email}\nRole: ${data.user.role}`
                );
            } else {
                alert(
                    `❌ Not Authenticated!\n\nError: ${data.error}\n\nPlease log out and log in again.`
                );
            }
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    const handleLogoutAndLogin = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <ContentWrapper>
            <Card>
                <h1
                    className="text-2xl font-bold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Authentication Test
                </h1>

                <div className="space-y-4">
                    <div>
                        <strong>Current User:</strong>
                        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={handleTestAuthAPI}>Test Auth API</Button>
                        <Button onClick={handleLogoutAndLogin} variant="secondary">
                            Logout & Login Again
                        </Button>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            <strong>
                                If you&apos;re getting &quot;Invalid token&quot; errors:
                            </strong>
                            <br />
                            1. Click &quot;Logout & Login Again&quot;
                            <br />
                            2. Log in with: admin@logatech.net / Admin@123
                            <br />
                            3. Return to Backend Notification Test page
                        </p>
                    </div>
                </div>
            </Card>
        </ContentWrapper>
    );
}
