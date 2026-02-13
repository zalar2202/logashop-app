"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    User,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    Download,
    ExternalLink,
    Store,
    Printer,
    Save,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
    pending_payment: { label: "Pending Payment", color: "text-amber-600 bg-amber-50", icon: Clock },
    processing: { label: "Processing", color: "text-blue-600 bg-blue-50", icon: Package },
    shipped: { label: "Shipped", color: "text-purple-600 bg-purple-50", icon: Truck },
    delivered: { label: "Delivered", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
};

const PAYMENT_CONFIG = {
    pending: { label: "Unpaid", color: "text-amber-600 bg-amber-50" },
    paid: { label: "Paid", color: "text-green-600 bg-green-50" },
    failed: { label: "Failed", color: "text-red-600 bg-red-50" },
};

export default function OrderDetailPage({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form for status update
    const [status, setStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/orders/${id}`);
                if (data.success) {
                    setOrder(data.data);
                    setStatus(data.data.status);
                    setTrackingNumber(data.data.trackingNumber || "");
                    setPaymentStatus(data.data.paymentStatus);
                }
            } catch (error) {
                console.error("Fetch order error:", error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const { data } = await axios.put(`/api/orders/${id}`, {
                status,
                trackingNumber,
                paymentStatus,
            });

            if (data.success) {
                setOrder(data.data);
                toast.success("Order updated successfully");
            }
        } catch (error) {
            console.error("Update order error:", error);
            toast.error(error.response?.data?.error || "Failed to update order");
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (amount) => {
        return `$${(amount / 100).toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold">Order not found</h3>
                <Link
                    href="/panel/admin/orders"
                    className="text-[var(--color-primary)] hover:underline mt-2 inline-block"
                >
                    Return to orders
                </Link>
            </div>
        );
    }

    const currentStatusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
    const StatusIcon = currentStatusConfig.icon;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/panel/admin/orders"
                        className="p-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition bg-[var(--color-bg-primary)]"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${currentStatusConfig.color}`}
                            >
                                <StatusIcon size={14} />
                                {currentStatusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy · HH:mm")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm hover:bg-[var(--color-bg-secondary)] transition bg-[var(--color-bg-primary)]">
                        <Printer size={16} />
                        Invoice
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:bg-[var(--color-primary-dark)] transition shadow-md disabled:opacity-50"
                    >
                        <Save size={16} />
                        {updating ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Line Items & Fulfillment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Management */}
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-blue-500" />
                            Fulfillment Control
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                                    Order Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-bg-primary)] text-sm"
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                                    Tracking Number
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter carrier tracking ID"
                                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-bg-primary)] text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                                    Payment Status
                                </label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-bg-primary)] text-sm"
                                >
                                    {Object.entries(PAYMENT_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden text-sm">
                        <div className="p-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                            <h2 className="font-bold flex items-center gap-2">
                                <Package size={18} className="text-[var(--color-primary)]" />
                                Order Items
                            </h2>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">
                                            Qty
                                        </th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {order.items.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm line-clamp-1">
                                                        {item.name}
                                                    </span>
                                                    {item.variantName && (
                                                        <span className="text-[10px] text-gray-500 uppercase mt-0.5">
                                                            {item.variantName}
                                                        </span>
                                                    )}
                                                    {item.productType === "digital" && (
                                                        <span className="text-[10px] text-blue-500 font-bold mt-1 flex items-center gap-1 uppercase tracking-wide">
                                                            <Download size={10} />
                                                            Digital Download
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {formatPrice(item.price)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold">
                                                {formatPrice(item.lineTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-[var(--color-border)]">
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex justify-between w-full max-w-[200px] text-[var(--color-text-secondary)]">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">
                                        {formatPrice(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between w-full max-w-[200px] text-[var(--color-text-secondary)]">
                                    <span>Shipping:</span>
                                    <span className="font-medium">
                                        {formatPrice(order.shippingCost)}
                                    </span>
                                </div>
                                <div className="flex justify-between w-full max-w-[200px] text-[var(--color-text-secondary)]">
                                    <span>Tax:</span>
                                    <span className="font-medium">
                                        {formatPrice(order.taxAmount)}
                                    </span>
                                </div>
                                <div className="h-px w-full max-w-[200px] bg-gray-200 my-2"></div>
                                <div className="flex justify-between w-full max-w-[200px] text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-[var(--color-primary)]">
                                        {formatPrice(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Note */}
                    {order.customerNote && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <AlertCircle size={14} />
                                Customer Note
                            </h3>
                            <p className="text-sm text-amber-800 leading-relaxed italic">
                                &quot;{order.customerNote}&quot;
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Customer & Address Info */}
                <div className="space-y-6">
                    {/* Customer Snapshot */}
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-sm p-6 text-sm">
                        <h2 className="text-sm font-bold border-b border-[var(--color-border)] pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide text-gray-500">
                            <User size={16} />
                            Customer
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
                                    {order.shippingAddress.firstName[0]}
                                    {order.shippingAddress.lastName[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold">
                                        {order.shippingAddress.firstName}{" "}
                                        {order.shippingAddress.lastName}
                                    </span>
                                    {order.userId ? (
                                        <span className="text-xs text-green-600 font-medium tracking-wide">
                                            Registered Customer
                                        </span>
                                    ) : (
                                        <span className="text-xs text-amber-600 font-medium tracking-wide">
                                            Guest Account
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                    <Mail size={16} className="shrink-0" />
                                    <span className="truncate">
                                        {order.userId?.email || order.guestEmail}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                    <Phone size={16} className="shrink-0" />
                                    <span>
                                        {order.shippingAddress.phone || "No phone provided"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-sm p-6 text-sm">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-gray-500">
                                <MapPin size={16} />
                                Shipping
                            </h2>
                            <button className="text-[var(--color-primary)] hover:underline text-xs font-medium">
                                Edit
                            </button>
                        </div>
                        <div className="space-y-1 text-[var(--color-text-primary)]">
                            <p className="font-bold">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            {order.shippingAddress.company && (
                                <p>{order.shippingAddress.company}</p>
                            )}
                            <p>{order.shippingAddress.address1}</p>
                            {order.shippingAddress.address2 && (
                                <p>{order.shippingAddress.address2}</p>
                            )}
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                {order.shippingAddress.zipCode}
                            </p>
                            <p className="font-medium text-[var(--color-primary)]">
                                {order.shippingAddress.country}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Method
                                    </span>
                                    <span className="font-medium">{order.shippingMethodLabel}</span>
                                </div>
                                <Truck size={24} className="text-gray-300" />
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-sm p-6 text-sm">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-gray-500">
                                <CreditCard size={16} />
                                Billing
                            </h2>
                            {order.billingSameAsShipping && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                                    Same as Shipping
                                </span>
                            )}
                        </div>
                        <div className="space-y-1 text-[var(--color-text-primary)]">
                            <p className="font-bold">
                                {order.billingAddress.firstName} {order.billingAddress.lastName}
                            </p>
                            <p>{order.billingAddress.address1}</p>
                            <p>
                                {order.billingAddress.city}, {order.billingAddress.state}{" "}
                                {order.billingAddress.zipCode}
                            </p>
                            <p className="font-medium">{order.billingAddress.country}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Payment Status
                                    </span>
                                    <span
                                        className={`font-bold mt-1 inline-block px-2 py-0.5 rounded text-[10px] ${PAYMENT_CONFIG[order.paymentStatus].color}`}
                                    >
                                        {PAYMENT_CONFIG[order.paymentStatus].label.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
