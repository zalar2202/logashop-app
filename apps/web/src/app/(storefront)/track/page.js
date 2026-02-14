"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Package,
    MapPin,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import axios from "axios";

const STATUS_STEPS = [
    { key: "pending_payment", label: "Pending", icon: Clock },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function TrackOrderPage() {
    const [trackingCode, setTrackingCode] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        const code = trackingCode.trim().toUpperCase();
        if (!code) {
            setError("Please enter a tracking code.");
            return;
        }

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const { data } = await axios.get(
                `/api/orders?trackingCode=${encodeURIComponent(code)}`
            );
            if (data.success && data.data) {
                setOrder(data.data);
            } else {
                setError("No order found with that tracking code.");
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError("No order found with that tracking code.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const currentStatusIdx = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;
    const isCancelled = order?.status === "cancelled" || order?.status === "refunded";

    return (
        <div className="py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search size={28} className="text-[var(--color-primary)]" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Track Your Order</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Enter the tracking code from your order confirmation email.
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                    <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                        placeholder="Enter tracking code (e.g. ABCD1234)"
                        className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-center text-lg font-mono tracking-widest bg-white"
                        maxLength={12}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Track"
                        )}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-700">{error}</p>
                            <p className="text-xs text-red-600 mt-1">
                                Double-check your tracking code and try again.
                            </p>
                        </div>
                    </div>
                )}

                {/* Order Result */}
                {order && (
                    <div className="space-y-6">
                        {/* Order Header */}
                        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Order Number
                            </p>
                            <p className="text-xl font-bold font-mono">#{order.orderNumber}</p>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                Placed{" "}
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        {/* Status Progress */}
                        {!isCancelled && (
                            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                <h3 className="font-bold text-sm mb-5 text-center">Order Status</h3>
                                <div className="flex items-center justify-between">
                                    {STATUS_STEPS.map((step, idx) => {
                                        const Icon = step.icon;
                                        const isComplete = idx <= currentStatusIdx;
                                        const isCurrent = idx === currentStatusIdx;

                                        return (
                                            <div
                                                key={step.key}
                                                className="flex items-center flex-1 last:flex-none"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                            isComplete
                                                                ? "bg-[var(--color-primary)] text-white"
                                                                : "bg-gray-100 text-gray-400"
                                                        } ${
                                                            isCurrent
                                                                ? "ring-4 ring-[var(--color-primary)]/20"
                                                                : ""
                                                        }`}
                                                    >
                                                        <Icon size={18} />
                                                    </div>
                                                    <span
                                                        className={`text-xs mt-2 font-medium ${
                                                            isComplete
                                                                ? "text-[var(--color-primary)]"
                                                                : "text-[var(--color-text-secondary)]"
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                </div>
                                                {idx < STATUS_STEPS.length - 1 && (
                                                    <div
                                                        className={`flex-1 h-0.5 mx-3 mt-[-18px] ${
                                                            idx < currentStatusIdx
                                                                ? "bg-[var(--color-primary)]"
                                                                : "bg-gray-200"
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isCancelled && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                                <p className="font-bold text-red-700">
                                    Order {order.status === "cancelled" ? "Cancelled" : "Refunded"}
                                </p>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-[var(--color-border)]">
                            <div className="p-4 border-b border-[var(--color-border)]">
                                <h3 className="font-bold text-sm">
                                    Items ({order.items?.length || 0})
                                </h3>
                            </div>
                            <div className="divide-y divide-[var(--color-border)]">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Package size={16} className="text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold text-sm">
                                            ${(item.lineTotal / 100).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-[var(--color-border)] flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-[var(--color-primary)]">
                                    ${(order.total / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-[var(--color-primary)]" />
                                    Shipping Address
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {order.shippingAddress.firstName}{" "}
                                    {order.shippingAddress.lastName}
                                    <br />
                                    {order.shippingAddress.address1}
                                    <br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zipCode}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Help link */}
                <div className="text-center mt-8">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Have an account?{" "}
                        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
                            Sign in
                        </Link>{" "}
                        to see all your orders.
                    </p>
                </div>
            </div>
        </div>
    );
}
