"use client";
import React from "react";

const AccountingStats = ({ stats }) => {
    return (
        <div
            className="stats-grid"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
            }}
        >
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="loga-card stat-card"
                    style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                            {stat.title}
                        </span>
                        {stat.percentage && (
                            <span
                                className="icon-wrapper"
                                style={{
                                    backgroundColor:
                                        stat.trend === "up"
                                            ? "var(--color-success-surface)"
                                            : "var(--color-error-surface)",
                                    color:
                                        stat.trend === "up"
                                            ? "var(--color-success-foreground)"
                                            : "var(--color-error-foreground)",
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                }}
                            >
                                {stat.percentage}
                            </span>
                        )}
                    </div>
                    <div
                        className="stat-value"
                        style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            color: "var(--color-primary)",
                        }}
                    >
                        {stat.value}
                    </div>
                    <div
                        className="stat-desc"
                        style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}
                    >
                        {stat.description}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AccountingStats;
