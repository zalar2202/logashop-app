"use client";

import { useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { ConfirmModal } from "@/components/common/Modal";
import axios from "@/lib/axios";
import { Database, Loader2 } from "lucide-react";

const SEED_SCRIPTS = [
    { id: "admin", label: "Admin User" },
    { id: "manager", label: "Manager User" },
    { id: "users", label: "Sample Users" },
    { id: "categories", label: "Categories" },
    { id: "products", label: "Products" },
    { id: "tags", label: "Tags" },
    { id: "shippingzones", label: "Shipping Zones" },
];

const REMOVABLE_COLLECTIONS = [
    { id: "categories", label: "Categories" },
    { id: "products", label: "Products" },
    { id: "tags", label: "Tags" },
    { id: "shippingzones", label: "Shipping Zones" },
    { id: "users", label: "Sample Users (user role only)" },
];

export default function DBToolsPage() {
    const [loading, setLoading] = useState(null);
    const [message, setMessage] = useState({ type: null, text: null });
    const [confirmRemoveAll, setConfirmRemoveAll] = useState(false);

    const runAction = async (action, payload, key) => {
        setLoading(key);
        setMessage({ type: null, text: null });
        try {
            const res = await axios.post(`/api/manager/db/${action}`, payload, { timeout: 120000 });
            const data = res.data;
            if (data.success) {
                setMessage({
                    type: "success",
                    text: data.message + (data.detail ? `\n${data.detail}` : ""),
                });
            } else {
                setMessage({ type: "error", text: data.error || "Failed" });
            }
        } catch (err) {
            const text = err.response?.data?.error || err.message || "Request failed";
            setMessage({ type: "error", text });
        } finally {
            setLoading(null);
        }
    };

    const handleSeed = (scriptId) => runAction("seed", { script: scriptId }, `seed-${scriptId}`);
    const handleRemove = (collectionId) => runAction("remove", { collection: collectionId }, `remove-${collectionId}`);
    const handleSeedAll = () => runAction("seed-all", {}, "seed-all");
    const handleRemoveAll = () => {
        setConfirmRemoveAll(true);
    };
    const confirmRemoveAllAction = () => {
        setConfirmRemoveAll(false);
        runAction("remove-all", {}, "remove-all");
    };

    return (
        <ContentWrapper>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <Database className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Database Tools
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                            Seed and clear data for development
                        </p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div
                    className="mb-6 p-4 rounded-lg text-sm whitespace-pre-wrap"
                    style={{
                        backgroundColor:
                            message.type === "success"
                                ? "var(--color-success-light, #d1fae5)"
                                : "var(--color-error-light, #fee2e2)",
                        color:
                            message.type === "success"
                                ? "var(--color-success, #059669)"
                                : "var(--color-error, #dc2626)",
                    }}
                >
                    {message.text}
                </div>
            )}

            {/* Seed All / Remove All */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card className="p-5">
                    <div className="mb-4">
                        <h2 className="font-semibold text-lg" style={{ color: "var(--color-text-primary)" }}>
                            Bulk Actions
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            Seed all scripts in order, or remove all data except users.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSeedAll}
                            disabled={loading === "seed-all"}
                            style={{ flex: 1 }}
                        >
                            {loading === "seed-all" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Seed All"
                            )}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleRemoveAll}
                            disabled={loading === "remove-all"}
                            style={{ flex: 1 }}
                        >
                            {loading === "remove-all" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Remove All (except users)"
                            )}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Individual Seed / Remove */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEED_SCRIPTS.map((script) => {
                    const collection = REMOVABLE_COLLECTIONS.find((c) => c.id === script.id);
                    const seedLoading = loading === `seed-${script.id}`;
                    const removeLoading = loading === `remove-${script.id}`;
                    return (
                        <Card key={script.id} className="p-5">
                            <h3 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                                {script.label}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleSeed(script.id)}
                                    disabled={seedLoading}
                                >
                                    {seedLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Seed"
                                    )}
                                </Button>
                                {collection && (
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleRemove(collection.id)}
                                        disabled={removeLoading}
                                    >
                                        {removeLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Remove"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <ConfirmModal
                isOpen={confirmRemoveAll}
                onClose={() => setConfirmRemoveAll(false)}
                onConfirm={confirmRemoveAllAction}
                title="Remove All Data?"
                message="This will delete all data from every collection except users. Your login will remain. This cannot be undone."
                confirmText="Remove All"
                variant="danger"
            />
        </ContentWrapper>
    );
}
