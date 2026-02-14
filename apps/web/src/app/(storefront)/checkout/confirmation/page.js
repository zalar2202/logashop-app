"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle,
    Package,
    MapPin,
    Truck,
    Mail,
    Copy,
    ArrowRight,
    ShoppingBag,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get("order");
    const orderId = searchParams.get("order_id");

    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderNumber || orderId) {
            const query = orderNumber ? `orderNumber=${orderNumber}` : `id=${orderId}`;
            axios
                .get(`/api/orders?${query}`)
                .then(({ data }) => {
                    if (data.success && data.data) {
                        setOrder(data.data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [orderNumber, orderId]);

    const copyTrackingCode = () => {
        if (order?.trackingCode) {
            navigator.clipboard.writeText(order.trackingCode);
            toast.success("Tracking code copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={44} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-[var(--color-text-secondary)] text-lg">
                        Thank you for your order
                        {order?.orderNumber && (
                            <>
                                {" "}
                                <span className="font-mono font-bold text-[var(--color-text-primary)]">
                                    #{order.orderNumber}
                                </span>
                            </>
                        )}
                    </p>
                    {order?.guestEmail && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2 flex items-center justify-center gap-1">
                            <Mail size={14} /> Confirmation sent to{" "}
                            <span className="font-medium">{order.guestEmail}</span>
                        </p>
                    )}
                </div>

                {/* Tracking code for guest orders */}
                {order?.trackingCode && !isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
                        <h3 className="font-bold text-amber-800 mb-2">Save Your Tracking Code</h3>
                        <p className="text-sm text-amber-700 mb-3">
                            Use this code to track your order status anytime.
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-2xl font-mono font-bold text-amber-900 bg-white px-4 py-2 rounded-lg border border-amber-200">
                                {order.trackingCode}
                            </code>
                            <button
                                onClick={copyTrackingCode}
                                className="p-2 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 transition"
                                title="Copy"
                            >
                                <Copy size={20} className="text-amber-700" />
                            </button>
                        </div>
                    </div>
                )}

                {order && (
                    <div className="space-y-6">
                        {/* Order Details */}
                        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Package size={20} className="text-[var(--color-primary)]" />
                                Order Details
                            </h2>
                            <div className="divide-y divide-[var(--color-border)]">
                                {order.items?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                Qty: {item.quantity} × $
                                                {(item.price / 100).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-bold text-sm">
                                            ${(item.lineTotal / 100).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-[var(--color-border)] mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Subtotal
                                    </span>
                                    <span>${(order.subtotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Shipping ({order.shippingMethodLabel})
                                    </span>
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
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-[var(--color-primary)]">
                                        ${(order.total / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Address & Shipping Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-[var(--color-primary)]" />
                                    Shipping Address
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {order.shippingAddress?.firstName}{" "}
                                    {order.shippingAddress?.lastName}
                                    <br />
                                    {order.shippingAddress?.address1}
                                    {order.shippingAddress?.address2 && (
                                        <>
                                            <br />
                                            {order.shippingAddress.address2}
                                        </>
                                    )}
                                    <br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                                    {order.shippingAddress?.zipCode}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <Truck size={16} className="text-[var(--color-primary)]" />
                                    Delivery Method
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {order.shippingMethodLabel}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.status === "pending_payment"
                                                ? "bg-amber-100 text-amber-700"
                                                : order.status === "processing"
                                                ? "bg-blue-100 text-blue-700"
                                                : order.status === "shipped"
                                                ? "bg-purple-100 text-purple-700"
                                                : order.status === "delivered"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {order.status
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!order && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[var(--color-border)]">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium mb-2">Order not found</p>
                        <p className="text-[var(--color-text-secondary)]">
                            We couldn't find the order details. Please check your email for
                            confirmation.
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Link
                        href="/products"
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition"
                    >
                        <ShoppingBag size={18} /> Continue Shopping
                    </Link>
                    {isAuthenticated && (
                        <Link
                            href="/panel/orders"
                            className="flex items-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded-xl font-medium hover:bg-gray-50 transition"
                        >
                            View All Orders <ArrowRight size={18} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
                </div>
            }
        >
            <OrderConfirmationContent />
        </Suspense>
    );
}
