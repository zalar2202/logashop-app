"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Loader } from "@/components/common/Loader";
import { ChevronLeft, Users } from "lucide-react";
import Link from "next/link";

export default function SubscribersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (user && !["admin", "manager"].includes(user.role)) {
            toast.error("Access denied");
            router.push("/panel");
        }
    }, [user, router]);

    useEffect(() => {
        const fetchSubscribers = async () => {
            if (!user || !["admin", "manager"].includes(user.role)) return;
            setLoading(true);
            try {
                const res = await axios.get("/api/subscribers", {
                    params: { page, limit: 20, status: "subscribed" },
                });
                if (res.data?.success) {
                    setSubscribers(res.data.data?.subscribers || []);
                    setPages(res.data.data?.pagination?.pages || 1);
                    setTotal(res.data.data?.pagination?.total || 0);
                }
            } catch (err) {
                toast.error("Failed to load subscribers");
                setSubscribers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscribers();
    }, [user, page]);

    if (!user || !["admin", "manager"].includes(user.role)) {
        return null;
    }

    return (
        <ContentWrapper>
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href="/panel/admin/marketing"
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Marketing
                </Link>
            </div>

            <div className="mb-8">
                <h1
                    className="text-2xl font-bold flex items-center gap-2"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    <Users className="w-6 h-6" />
                    Newsletter Subscribers
                </h1>
                <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {total} subscriber{total !== 1 ? "s" : ""} in total
                </p>
            </div>

            <Card>
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <Loader />
                    </div>
                ) : subscribers.length === 0 ? (
                    <div
                        className="py-12 text-center"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        No subscribers yet. Subscriptions from the homepage and footer will appear
                        here.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr
                                    className="border-b"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <th
                                        className="text-left py-3 px-4 text-sm font-semibold"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Email
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 text-sm font-semibold"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Source
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 text-sm font-semibold"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Subscribed
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((s) => (
                                    <tr
                                        key={s._id}
                                        className="border-b"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <td
                                            className="py-3 px-4 text-sm"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {s.email}
                                        </td>
                                        <td
                                            className="py-3 px-4 text-sm capitalize"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {s.source}
                                        </td>
                                        <td
                                            className="py-3 px-4 text-sm"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {s.subscribedAt
                                                ? new Date(s.subscribedAt).toLocaleDateString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pages > 1 && (
                    <div className="flex justify-center gap-2 py-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1 rounded text-sm disabled:opacity-50"
                            style={{ backgroundColor: "var(--color-background-secondary)" }}
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Page {page} of {pages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(pages, p + 1))}
                            disabled={page >= pages}
                            className="px-3 py-1 rounded text-sm disabled:opacity-50"
                            style={{ backgroundColor: "var(--color-background-secondary)" }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </Card>
        </ContentWrapper>
    );
}
