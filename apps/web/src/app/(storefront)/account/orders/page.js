"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag, Search, Filter, ChevronLeft } from "lucide-react";
import axios from "axios";

const STATUS_OPTIONS = [
    { value: "", label: "All Orders" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page, limit: 10 });
                if (statusFilter) params.set("status", statusFilter);

                const { data } = await axios.get(`/api/orders?${params}`);
                if (data.success) {
                    setOrders(data.data);
                    setPagination(data.pagination || { total: 0, pages: 1 });
                }
            } catch (error) {
                console.error("Fetch orders error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [page, statusFilter]);

    const getStatusBadge = (status) => {
        const styles = {
            pending_payment: "bg-amber-100 text-amber-700",
            processing: "bg-blue-100 text-blue-700",
            shipped: "bg-purple-100 text-purple-700",
            delivered: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
            refunded: "bg-gray-100 text-gray-700",
        };
        return (
            <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    styles[status] || "bg-gray-100 text-gray-700"
                }`}
            >
                {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold">My Orders</h2>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--color-border)] text-center py-16 px-4">
                    <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-lg font-medium mb-1">No orders found</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        {statusFilter
                            ? "Try a different filter."
                            : "You haven't placed any orders yet."}
                    </p>
                    {!statusFilter && (
                        <Link
                            href="/products"
                            className="inline-block px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition"
                        >
                            Start Shopping
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order._id}
                            href={`/account/orders/${order._id}`}
                            className="block bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition"
                        >
                            {/* Order Header */}
                            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-bold text-sm">#{order.orderNumber}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(order.status)}
                                    <ChevronRight size={18} className="text-gray-300" />
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Item thumbnails */}
                                    <div className="flex -space-x-2">
                                        {order.items?.slice(0, 3).map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white overflow-hidden"
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {(order.items?.length || 0) > 3 && (
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {order.items?.length || 0} item
                                            {(order.items?.length || 0) !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <p className="font-bold text-[var(--color-primary)]">
                                        ${(order.total / 100).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={page >= pagination.pages}
                        className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
