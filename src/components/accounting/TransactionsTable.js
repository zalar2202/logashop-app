"use client";
import React from "react";
import Link from "next/link";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

const TransactionsTable = ({ transactions, type = "user" }) => {
    // type: 'user' or 'admin'

    const getStatusStyle = (status) => {
        if (!status)
            return {
                background: "var(--color-background-tertiary)",
                color: "var(--color-text-secondary)",
            };
        switch (status.toLowerCase()) {
            case "completed":
            case "paid":
                return {
                    background: "var(--color-success-surface)",
                    color: "var(--color-success-foreground)",
                };
            case "pending":
            case "sent":
                return {
                    background: "var(--color-warning-surface)",
                    color: "var(--color-warning-foreground)",
                };
            case "failed":
            case "overdue":
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

    return (
        <div className="loga-card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Recent Transactions</h3>
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
                                ID
                            </th>
                            {type === "admin" && (
                                <th
                                    style={{
                                        padding: "15px 20px",
                                        fontSize: "0.9rem",
                                        color: "var(--color-text-secondary)",
                                        fontWeight: "600",
                                    }}
                                >
                                    Client
                                </th>
                            )}
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
                                Description
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
                        {transactions?.map((tx) => {
                            const txId = tx._id || tx.id;
                            const invoiceNo = tx.invoiceNumber || tx.id;
                            const clientName = tx.client?.name || tx.clientName || "Unknown";
                            const dateStr = tx.issueDate
                                ? new Date(tx.issueDate).toLocaleDateString()
                                : tx.date
                                  ? new Date(tx.date).toLocaleDateString()
                                  : "N/A";
                            const amountStr =
                                typeof tx.total === "number"
                                    ? `$${tx.total.toLocaleString()}`
                                    : typeof tx.amount === "number"
                                      ? `$${tx.amount.toLocaleString()}`
                                      : tx.amount;
                            const descriptionStr =
                                tx.items?.[0]?.description || tx.description || "Service Invoice";

                            return (
                                <tr
                                    key={txId}
                                    style={{
                                        borderBottom: "1px solid var(--color-border)",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    <td style={{ padding: "15px 20px", fontFamily: "monospace" }}>
                                        <Link
                                            href={`/panel/invoices?id=${txId}`}
                                            className="hover:underline"
                                            style={{
                                                color: "var(--color-primary)",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {invoiceNo}
                                        </Link>
                                    </td>
                                    {type === "admin" && (
                                        <td style={{ padding: "15px 20px", fontWeight: "500" }}>
                                            {clientName}
                                        </td>
                                    )}
                                    <td
                                        style={{
                                            padding: "15px 20px",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {dateStr}
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <Link
                                            href={`/panel/invoices?id=${txId}`}
                                            style={{ color: "inherit", textDecoration: "none" }}
                                            className="hover:text-[var(--color-primary)]"
                                        >
                                            {descriptionStr}
                                        </Link>
                                    </td>
                                    <td style={{ padding: "15px 20px", fontWeight: "700" }}>
                                        {amountStr}
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <span
                                            style={{
                                                ...getStatusStyle(tx.status),
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <Link
                                                href={`/panel/invoices?id=${txId}`}
                                                className="loga-btn"
                                                style={{
                                                    padding: "5px 10px",
                                                    fontSize: "0.8rem",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    background: "var(--color-background-tertiary)",
                                                    color: "var(--color-text-secondary)",
                                                    textDecoration: "none",
                                                }}
                                                title="View Details"
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </Link>
                                            <Link
                                                href={`/panel/invoices/${txId}/print`}
                                                className="loga-btn"
                                                style={{
                                                    padding: "5px 10px",
                                                    fontSize: "0.8rem",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    background: "var(--color-background-tertiary)",
                                                    color: "var(--color-text-secondary)",
                                                    textDecoration: "none",
                                                }}
                                                title="Download Invoice"
                                            >
                                                <DownloadIcon fontSize="small" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsTable;
