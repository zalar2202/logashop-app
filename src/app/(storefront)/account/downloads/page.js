"use client";

import { useState, useEffect } from "react";
import { Download, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns"; // Wait, date-fns installed? Or use native Intl.
// I'll stick to native Intl if date-fns not verified. Or use existing helper.
import { Loader2 } from "lucide-react";
import Link from "next/link"; // Lucide conflicts? No, Link component.

// Helper to format date
const formatDate = (date) => {
    if (!date) return "Unlimited";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export default function DownloadsPage() {
    const { user, isAuthenticated } = useAuth();
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDownloads();
        }
    }, [isAuthenticated]);

    const fetchDownloads = async () => {
        try {
            const res = await fetch("/api/account/downloads");
            if (res.ok) {
                const data = await res.json();
                setDownloads(data.downloads);
            }
        } catch (error) {
            console.error("Failed to fetch downloads:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Downloads</h1>
            <p className="text-[var(--color-text-secondary)]">
                Access your digital purchases and files.
            </p>

            {downloads.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download size={24} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">No downloads yet</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        You haven't purchased any digital products.
                    </p>
                    <Link
                        href="/products?type=digital"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition"
                    >
                        Browse Digital Store
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {downloads.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                        >
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-lg">
                                        {item.productId?.name || "Digital Product"}
                                    </h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-[var(--color-text-secondary)]">
                                        <span className="flex items-center gap-1">
                                            <Download size={14} />
                                            {item.downloadCount} / {item.maxDownloads || "∞"}{" "}
                                            downloads
                                        </span>
                                        {item.expiresAt && (
                                            <span className="flex items-center gap-1 text-orange-600">
                                                <Clock size={14} />
                                                Expires: {formatDate(item.expiresAt)}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-gray-500">
                                            Order #{item.orderId?.orderNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {item.status === "active" ? (
                                    <a
                                        href={`/api/download/${item.downloadToken}`}
                                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-opacity-90 transition text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download size={16} />
                                        Download File
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed text-sm"
                                    >
                                        <AlertCircle size={16} />
                                        {item.status === "revoked" ? "Revoked" : "Expired"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
