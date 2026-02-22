"use client";

import React from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

const formatPrice = (cents) => {
    return `$${((cents || 0) / 100).toFixed(2)}`;
};

const getStatusStyle = (status) => {
    if (!status)
        return {
            background: "var(--color-background-tertiary)",
            color: "var(--color-text-secondary)",
        };
    switch ((status || "").toLowerCase()) {
        case "paid":
            return {
                background: "var(--color-success-surface)",
                color: "var(--color-success-foreground)",
            };
        case "pending":
            return {
                background: "var(--color-warning-surface)",
                color: "var(--color-warning-foreground)",
            };
        case "failed":
        case "refunded":
        case "partially_refunded":
            return {
                background: "var(--color-error-surface)",
                color: "var(--color-error-foreground)",
            };
        default:
            return {
                background: "var(--color-background-tertiary)",
                color: "var(--color-text-secondary)",
            };
    }
};

const SalesTable = ({ orders }) => {
    return (
        <div className="loga-card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Recent Sales (Paid Orders)</h3>
            </div>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                    <thead>
                        <tr
                            style={{
                                background: "var(--color-background-secondary)",
                                textAlign: "left",
                            }}
                        >
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                }}
                            >
                                Order #
                            </th>
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                }}
                            >
                                Customer
                            </th>
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                }}
                            >
                                Date
                            </th>
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                }}
                            >
                                Amount
                            </th>
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                }}
                            >
                                Status
                            </th>
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                }}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        padding: "40px 20px",
                                        textAlign: "center",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    No paid orders yet.
                                </td>
                            </tr>
                        ) : (
                            orders?.map((order) => {
                                const orderId = order._id || order.id;
                                const customerName =
                                    order.shippingAddress?.firstName && order.shippingAddress?.lastName
                                        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                                        : order.guestEmail || "—";
                                const dateStr = order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString()
                                    : "N/A";
                                const status = order.paymentStatus || "paid";

                                return (
                                    <tr
                                        key={orderId}
                                        style={{
                                            borderBottom: "1px solid var(--color-border)",
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        <td style={{ padding: "15px 20px", fontFamily: "monospace" }}>
                                            <Link
                                                href={`/panel/admin/orders/${orderId}`}
                                                className="hover:underline"
                                                style={{
                                                    color: "var(--color-primary)",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {order.orderNumber || `#${orderId}`}
                                            </Link>
                                        </td>
                                        <td style={{ padding: "15px 20px", fontWeight: "500" }}>
                                            {customerName}
                                        </td>
                                        <td
                                            style={{
                                                padding: "15px 20px",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {dateStr}
                                        </td>
                                        <td style={{ padding: "15px 20px", fontWeight: "700" }}>
                                            {formatPrice(order.total)}
                                        </td>
                                        <td style={{ padding: "15px 20px" }}>
                                            <span
                                                style={{
                                                    ...getStatusStyle(status),
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "600",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {status?.replace(/_/g, " ") || "—"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "15px 20px" }}>
                                            <Link
                                                href={`/panel/admin/orders/${orderId}`}
                                                className="loga-btn"
                                                style={{
                                                    padding: "5px 10px",
                                                    fontSize: "0.8rem",
                                                    borderRadius: "8px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    background: "var(--color-background-tertiary)",
                                                    color: "var(--color-text-secondary)",
                                                    textDecoration: "none",
                                                }}
                                                title="View Order"
                                            >
                                                <Eye className="w-4 h-4" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesTable;
