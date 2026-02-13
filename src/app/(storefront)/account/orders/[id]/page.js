"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    Package,
    MapPin,
    Truck,
    CreditCard,
    ChevronLeft,
    CheckCircle,
    Clock,
    AlertCircle,
    Copy,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const STATUS_STEPS = [
    { key: "pending_payment", label: "Pending", icon: Clock },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderDetailPage({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const { data } = await axios.get(`/api/orders/${id}`);
                if (data.success) {
                    setOrder(data.data);
                }
            } catch (error) {
                console.error("Fetch order error:", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white rounded-xl border border-[var(--color-border)] text-center py-16">
                <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-medium mb-1">Order not found</p>
                <Link
                    href="/account/orders"
                    className="text-sm text-[var(--color-primary)] hover:underline mt-2 inline-block"
                >
                    Back to orders
                </Link>
            </div>
        );
    }

    // Determine current status index for progress bar
    const currentStatusIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === "cancelled" || order.status === "refunded";

    return (
        <div className="space-y-6">
            {/* Back link & header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <Link
                        href="/account/orders"
                        className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1 mb-2"
                    >
                        <ChevronLeft size={16} /> Back to Orders
                    </Link>
                    <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <div>
                    <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "shipped"
                                  ? "bg-purple-100 text-purple-700"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
                        }`}
                    >
                        {order.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                </div>
            </div>

            {/* Status Progress Bar */}
            {!isCancelled && (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
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
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                                                isComplete
                                                    ? "bg-[var(--color-primary)] text-white"
                                                    : "bg-gray-100 text-gray-400"
                                            } ${isCurrent ? "ring-4 ring-[var(--color-primary)]/20" : ""}`}
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

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-[var(--color-border)]">
                <div className="p-5 border-b border-[var(--color-border)]">
                    <h3 className="font-bold flex items-center gap-2">
                        <Package size={18} className="text-[var(--color-primary)]" />
                        Items ({order.items?.length || 0})
                    </h3>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium">{item.name}</h4>
                                {item.variantLabel && (
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {item.variantLabel}
                                    </p>
                                )}
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Qty: {item.quantity} × ${(item.price / 100).toFixed(2)}
                                </p>
                            </div>
                            <p className="font-bold text-sm">
                                ${(item.lineTotal / 100).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="p-5 border-t border-[var(--color-border)] space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                        <span>${(order.subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Shipping</span>
                        <span>
                            {order.shippingCost === 0
                                ? "FREE"
                                : `$${(order.shippingCost / 100).toFixed(2)}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Tax</span>
                        <span>${(order.taxAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-[var(--color-primary)]">
                            ${(order.total / 100).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-[var(--color-primary)]" />
                        Shipping Address
                    </h3>
                    {order.shippingAddress ? (
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            <br />
                            {order.shippingAddress.address1}
                            {order.shippingAddress.address2 && (
                                <>
                                    <br />
                                    {order.shippingAddress.address2}
                                </>
                            )}
                            <br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode}
                        </p>
                    ) : (
                        <p className="text-sm text-[var(--color-text-secondary)]">Not available</p>
                    )}
                </div>
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <CreditCard size={16} className="text-[var(--color-primary)]" />
                        Billing Address
                    </h3>
                    {order.billingAddress ? (
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {order.billingAddress.firstName} {order.billingAddress.lastName}
                            <br />
                            {order.billingAddress.address1}
                            <br />
                            {order.billingAddress.city}, {order.billingAddress.state}{" "}
                            {order.billingAddress.zipCode}
                        </p>
                    ) : (
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Same as shipping
                        </p>
                    )}
                </div>
            </div>

            {/* Customer Note */}
            {order.customerNote && (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                    <h3 className="font-bold text-sm mb-2">Your Note</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {order.customerNote}
                    </p>
                </div>
            )}
        </div>
    );
}
