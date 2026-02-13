"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Package,
    MapPin,
    ShoppingBag,
    TrendingUp,
    Clock,
    ChevronRight,
    CheckCircle,
    Truck,
    AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountDashboard() {
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, processing: 0, delivered: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const { data } = await axios.get("/api/orders?limit=5");
                if (data.success) {
                    setRecentOrders(data.data);
                    setStats({
                        total: data.pagination?.total || data.data.length,
                        processing: data.data.filter(
                            (o) => o.status === "processing" || o.status === "pending_payment"
                        ).length,
                        delivered: data.data.filter((o) => o.status === "delivered").length,
                    });
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

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
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    styles[status] || "bg-gray-100 text-gray-700"
                }`}
            >
                {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <ShoppingBag size={22} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Total Orders</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock size={22} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.processing}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">In Progress</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <CheckCircle size={22} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.delivered}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Delivered</p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    href="/account/orders"
                    className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center justify-between hover:border-[var(--color-primary)]/50 hover:shadow-sm transition group"
                >
                    <div className="flex items-center gap-3">
                        <Package size={20} className="text-[var(--color-primary)]" />
                        <div>
                            <p className="font-medium text-sm">View All Orders</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                Track and manage your orders
                            </p>
                        </div>
                    </div>
                    <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-[var(--color-primary)] transition"
                    />
                </Link>
                <Link
                    href="/account/addresses"
                    className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex items-center justify-between hover:border-[var(--color-primary)]/50 hover:shadow-sm transition group"
                >
                    <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-[var(--color-primary)]" />
                        <div>
                            <p className="font-medium text-sm">Address Book</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                Manage your shipping addresses
                            </p>
                        </div>
                    </div>
                    <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-[var(--color-primary)] transition"
                    />
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-[var(--color-border)]">
                <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                    <h2 className="font-bold text-lg">Recent Orders</h2>
                    <Link
                        href="/account/orders"
                        className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-3" />
                        <p className="font-medium">No orders yet</p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Start shopping to see your orders here.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]">
                        {recentOrders.map((order) => (
                            <Link
                                key={order._id}
                                href={`/account/orders/${order._id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Package
                                            size={18}
                                            className="text-[var(--color-text-secondary)]"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">#{order.orderNumber}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}{" "}
                                            · {order.items?.length || 0} item
                                            {(order.items?.length || 0) !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(order.status)}
                                    <span className="font-bold text-sm">
                                        ${(order.total / 100).toFixed(2)}
                                    </span>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
