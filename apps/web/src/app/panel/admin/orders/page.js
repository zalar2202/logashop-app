"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Search,
    Filter,
    ChevronRight,
    Eye,
    CheckCircle2,
    Clock,
    Truck,
    XCircle,
    Package,
    ArrowUpDown,
    Download,
    Calendar,
    User,
    CreditCard,
    FileSpreadsheet,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses", color: "bg-gray-100 text-gray-700" },
    { value: "pending_payment", label: "Pending Payment", color: "bg-amber-100 text-amber-700" },
    { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
    { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
    { value: "paid", label: "Paid", color: "bg-green-100 text-green-700" },
    { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    // Filters
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/orders", {
                params: {
                    page,
                    limit: 10,
                    status: statusFilter || undefined,
                    search: searchQuery || undefined,
                },
            });

            if (data.success) {
                setOrders(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchOrders]);

    const handleExport = async () => {
        try {
            toast.loading("Preparing orders report...", { id: "export-orders" });
            const response = await axios.get("/api/admin/reports/export?type=orders", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `orders-report-${new Date().toISOString().split("T")[0]}.csv`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Orders exported successfully", { id: "export-orders" });
        } catch (error) {
            toast.error("Failed to export orders", { id: "export-orders" });
        }
    };

    const getStatusBadge = (status) => {
        const option = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
        return (
            <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${option.color}`}
            >
                {option.label}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const option =
            PAYMENT_STATUS_OPTIONS.find((o) => o.value === status) || PAYMENT_STATUS_OPTIONS[0];
        return (
            <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${option.color}`}
            >
                {option.label}
            </span>
        );
    };

    const formatPrice = (amount) => {
        return `$${(amount / 100).toFixed(2)}`;
    };

    // Table rendering uses orders directly now

    return (
        <ContentWrapper>
            <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Order Management
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        View and manage customer orders and fulfillment
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm hover:opacity-90 transition shadow-sm font-medium"
                    >
                        <FileSpreadsheet size={18} />
                        Report Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-5 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            +12%
                        </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">{pagination.total}</h3>
                </div>
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-5 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Pending Fulfillment
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                        {
                            orders.filter((o) =>
                                ["pending_payment", "processing"].includes(o.status)
                            ).length
                        }
                    </h3>
                </div>
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-5 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Completed Orders</p>
                    <h3 className="text-2xl font-bold mt-1">
                        {orders.filter((o) => o.status === "delivered").length}
                    </h3>
                </div>
                <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-5 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">
                        {formatPrice(
                            orders
                                .filter((o) => o.paymentStatus === "paid")
                                .reduce((acc, curr) => acc + curr.total, 0)
                        )}
                    </h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by order #, email, or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm bg-[var(--color-bg-primary)]"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                        <Filter size={16} />
                        <span>Filter:</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="flex-1 md:flex-none px-3 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm bg-[var(--color-bg-primary)]"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    <div className="flex items-center gap-2 cursor-pointer group">
                                        Order Info
                                        <ArrowUpDown
                                            size={12}
                                            className="opacity-0 group-hover:opacity-100 transition"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] text-right">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading ? (
                                Array(5)
                                    .fill(0)
                                    .map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="5" className="px-6 py-8">
                                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-[var(--color-bg-secondary)]/50 transition"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-[var(--color-primary)]">
                                                    #{order.orderNumber}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-0.5">
                                                    <Calendar size={12} />
                                                    {format(
                                                        new Date(order.createdAt),
                                                        "MMM dd, yyyy · HH:mm"
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 font-medium text-sm">
                                                    <User size={14} className="text-gray-400" />
                                                    {order.shippingAddress.firstName}{" "}
                                                    {order.shippingAddress.lastName}
                                                </div>
                                                <span className="text-xs text-[var(--color-text-secondary)] ml-5">
                                                    {order.userId?.email || order.guestEmail}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} className="text-gray-400" />
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    {getPaymentBadge(order.paymentStatus)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-[var(--color-text-primary)]">
                                                {formatPrice(order.total)}
                                            </div>
                                            <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 uppercase tracking-wide">
                                                {order.items.length} items
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/panel/admin/orders/${order._id}`}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition"
                                                    title="More Options"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <ShoppingBag size={48} />
                                            <p className="text-lg font-medium">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-between">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Showing <span className="font-medium">1</span> to{" "}
                            <span className="font-medium">{orders.length}</span> of{" "}
                            <span className="font-medium">{pagination.total}</span> orders
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-sm disabled:opacity-50 hover:bg-white transition bg-[var(--color-bg-primary)]"
                            >
                                Previous
                            </button>
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition ${
                                        page === p
                                            ? "bg-[var(--color-primary)] text-white font-medium"
                                            : "border border-[var(--color-border)] hover:bg-white bg-[var(--color-bg-primary)]"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setPage((prev) => Math.min(pagination.pages, prev + 1))
                                }
                                disabled={page === pagination.pages}
                                className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-sm disabled:opacity-50 hover:bg-white transition bg-[var(--color-bg-primary)]"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </ContentWrapper>
    );
}
