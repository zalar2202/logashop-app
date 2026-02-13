"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { CheckCircle2, XCircle, Database, RefreshCw } from "lucide-react";

export default function TestConnectionPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const testConnection = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/test-db");
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                message: "Failed to connect to API",
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContentWrapper>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Database Connection Test
                </h1>
                <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
                    Test the MongoDB database connection to ensure everything is working properly.
                </p>
            </div>

            <Card>
                <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <Database size={40} style={{ color: "var(--color-primary)" }} />
                    </div>

                    <h2
                        className="text-xl font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        MongoDB Connection Test
                    </h2>

                    <Button onClick={testConnection} disabled={loading} className="mb-8">
                        {loading ? (
                            <>
                                <RefreshCw className="animate-spin mr-2" size={18} />
                                Testing Connection...
                            </>
                        ) : (
                            <>
                                <Database className="mr-2" size={18} />
                                Test Connection
                            </>
                        )}
                    </Button>

                    {result && (
                        <div className="w-full max-w-2xl">
                            <div
                                className={`rounded-lg p-6 ${
                                    result.success
                                        ? "bg-green-50 dark:bg-green-900/20"
                                        : "bg-red-50 dark:bg-red-900/20"
                                }`}
                                style={{
                                    borderLeft: `4px solid ${result.success ? "var(--color-success)" : "var(--color-error)"}`,
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
                                        <h3
                                            className="font-semibold text-lg mb-2"
                                            style={{
                                                color: result.success
                                                    ? "var(--color-success)"
                                                    : "var(--color-error)",
                                            }}
                                        >
                                            {result.message}
                                        </h3>

                                        {result.success && result.details && (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Status:
                                                        </span>
                                                        <span
                                                            className="ml-2"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {result.details.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Database:
                                                        </span>
                                                        <span
                                                            className="ml-2"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {result.details.database}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Host:
                                                        </span>
                                                        <span
                                                            className="ml-2"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {result.details.host}:
                                                            {result.details.port}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="font-medium"
                                                            style={{
                                                                color: "var(--color-text-primary)",
                                                            }}
                                                        >
                                                            Mongo Version:
                                                        </span>
                                                        <span
                                                            className="ml-2"
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {result.details.mongoVersion}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!result.success && (
                                            <div className="mt-2">
                                                <p
                                                    className="text-sm"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                >
                                                    {result.error}
                                                </p>
                                                {result.details && (
                                                    <pre
                                                        className="mt-2 p-3 rounded text-xs overflow-auto"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--color-background-secondary)",
                                                        }}
                                                    >
                                                        {JSON.stringify(result.details, null, 2)}
                                                    </pre>
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

            <Card className="mt-6">
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Connection Details
                </h3>
                <div className="space-y-3 text-sm">
                    <div
                        className="flex justify-between py-2"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                        <span
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            MongoDB URI:
                        </span>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            mongodb://localhost:27017/logatech
                        </span>
                    </div>
                    <div
                        className="flex justify-between py-2"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                        <span
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            API Endpoint:
                        </span>
                        <span style={{ color: "var(--color-text-secondary)" }}>/api/test-db</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Mongoose Version:
                        </span>
                        <span style={{ color: "var(--color-text-secondary)" }}>8.19.2</span>
                    </div>
                </div>
            </Card>
        </ContentWrapper>
    );
}
