"use client";

import { useEffect } from "react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

/**
 * Dashboard error boundary
 * Catches errors within dashboard pages and provides recovery options
 */
export default function DashboardError({ error, reset }) {
    useEffect(() => {
        console.error("Dashboard Error:", error);
    }, [error]);

    return (
        <div className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="max-w-lg w-full text-center">
                <div className="flex flex-col items-center gap-4">
                    {/* Error Icon */}
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>

                    {/* Error Message */}
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                            Oops! Something Went Wrong
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mb-1">
                            We encountered an error while loading this page. Please try refreshing
                            or go back to the dashboard.
                        </p>
                        {process.env.NODE_ENV === "development" && error.message && (
                            <div className="mt-4 text-left">
                                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                                    Error Details (dev only):
                                </p>
                                <pre className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded overflow-auto text-left">
                                    {error.message}
                                    {error.stack && "\n\n" + error.stack}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                        <Button
                            variant="secondary"
                            onClick={() => (window.location.href = "/")}
                            className="flex-1"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Button>
                        <Button variant="primary" onClick={reset} className="flex-1">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
