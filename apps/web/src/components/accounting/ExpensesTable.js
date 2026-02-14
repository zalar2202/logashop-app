"use client";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LoopIcon from "@mui/icons-material/Loop";

const ExpensesTable = ({ expenses, onEdit, onDelete }) => {
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
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
            default:
                return {
                    background: "var(--color-background-tertiary)",
                    color: "var(--color-text-secondary)",
                };
        }
    };

    return (
        <div className="loga-card" style={{ padding: "0", overflow: "hidden" }}>
            <div
                style={{
                    padding: "20px",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Company Expenses</h3>
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
                                Category
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
                                Rec
                            </th>
                            <th
                                style={{
                                    padding: "15px 20px",
                                    fontSize: "0.9rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: "600",
                                    textAlign: "right",
                                }}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    No expenses recorded yet.
                                </td>
                            </tr>
                        ) : (
                            expenses?.map((ex) => (
                                <tr
                                    key={ex._id}
                                    style={{
                                        borderBottom: "1px solid var(--color-border)",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "15px 20px",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {new Date(ex.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "15px 20px", fontWeight: "500" }}>
                                        {ex.description}
                                        {ex.notes && (
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--color-text-tertiary)",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {ex.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                background: "var(--color-background-tertiary)",
                                                fontSize: "0.75rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                            }}
                                        >
                                            {ex.category}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "15px 20px",
                                            fontWeight: "700",
                                            color: "var(--color-error)",
                                        }}
                                    >
                                        - $
                                        {ex.amount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <span
                                            style={{
                                                ...getStatusStyle(ex.status),
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {ex.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "15px 20px" }}>
                                        {ex.recurring && (
                                            <LoopIcon
                                                style={{
                                                    fontSize: "1.2rem",
                                                    color: "var(--color-primary)",
                                                }}
                                                titleAccess={`Recurring: ${ex.frequency}`}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: "15px 20px", textAlign: "right" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <button
                                                onClick={() => onEdit(ex)}
                                                className="loga-btn"
                                                style={{
                                                    padding: "5px",
                                                    fontSize: "0.8rem",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    background: "var(--color-background-tertiary)",
                                                    color: "var(--color-text-secondary)",
                                                    border: "none",
                                                    cursor: "pointer",
                                                }}
                                                title="Edit"
                                            >
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(ex._id)}
                                                className="loga-btn"
                                                style={{
                                                    padding: "5px",
                                                    fontSize: "0.8rem",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    background: "var(--color-error-surface)",
                                                    color: "var(--color-error)",
                                                    border: "none",
                                                    cursor: "pointer",
                                                }}
                                                title="Delete"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpensesTable;
