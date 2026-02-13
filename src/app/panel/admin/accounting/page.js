"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import AccountingStats from "@/components/accounting/AccountingStats";
import TransactionsTable from "@/components/accounting/TransactionsTable";
import ExpensesTable from "@/components/accounting/ExpensesTable";
import AddIcon from "@mui/icons-material/Add";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import { Download, FileDown, FileSpreadsheet } from "lucide-react";

export default function AdminAccountingPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("invoices"); // 'invoices' or 'expenses'

    // Data
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // Expenses Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "other",
        date: new Date().toISOString().split("T")[0],
        status: "paid",
        notes: "",
        recurring: false,
        frequency: "",
    });

    const metrics = useMemo(() => {
        const revenue = invoices
            .filter((inv) => inv.status === "paid")
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const outstanding = invoices
            .filter((inv) => ["sent", "overdue", "partial"].includes(inv.status))
            .reduce((sum, inv) => {
                if (inv.status === "partial" && inv.paymentPlan?.isInstallment) {
                    return sum + (inv.total - (inv.paymentPlan?.downPayment || 0));
                }
                return sum + (inv.total || 0);
            }, 0);

        const totalExpenses = expenses
            .filter((exp) => exp.status === "paid")
            .reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const netProfit = revenue - totalExpenses;
        const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

        const paidCount = invoices.filter((inv) => inv.status === "paid").length;
        const pendingCount = invoices.filter((inv) =>
            ["sent", "partial"].includes(inv.status)
        ).length;

        return {
            totalRevenue: revenue,
            totalExpenses,
            netProfit,
            outstanding,
            paidCount,
            pendingCount,
            profitMargin,
        };
    }, [invoices, expenses]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [invoicesRes, expensesRes] = await Promise.all([
                axios.get("/api/invoices"),
                axios.get("/api/expenses"), // Assume this route exists
            ]);

            if (invoicesRes.data.success) {
                setInvoices(invoicesRes.data.data);
            }
            if (expensesRes.data.success) {
                setExpenses(expensesRes.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch accounting data:", error);
            toast.error("Failed to load financial data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Form Handling
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setFormData({
            description: "",
            amount: "",
            category: "other",
            date: new Date().toISOString().split("T")[0],
            status: "paid",
            notes: "",
            recurring: false,
            frequency: "",
        });
        setIsModalOpen(true);
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setFormData({
            ...expense,
            date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
            amount: expense.amount || "",
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Sanitize payload
            const payload = { ...formData };
            if (!payload.recurring || !payload.frequency) {
                payload.frequency = null;
            }

            if (editingExpense) {
                await axios.put(`/api/expenses/${editingExpense._id}`, payload);
                toast.success("Expense updated");
            } else {
                await axios.post("/api/expenses", payload);
                toast.success("Expense added");
            }
            await fetchData(); // Refresh all data
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            await axios.delete(`/api/expenses/${id}`);
            toast.success("Expense deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete expense");
        }
    };

    const handleExport = async (type) => {
        try {
            toast.loading(`Preparing ${type} report...`, { id: "export" });
            const response = await axios.get(`/api/admin/reports/export?type=${type}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${type}-report-${new Date().toISOString().split("T")[0]}.csv`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`${capitalize(type)} exported successfully`, { id: "export" });
        } catch (error) {
            toast.error("Failed to export report", { id: "export" });
        }
    };

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const stats = [
        {
            title: "Total Revenue",
            value: `$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            percentage: `${metrics.paidCount} Paid`,
            trend: "up",
            description: "Total fulfilled invoices",
            icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
        },
        {
            title: "Total Expenses",
            value: `$${metrics.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            percentage: `${expenses.length} Records`,
            trend: "down",
            description: "Operational costs",
            icon: <TrendingDown className="w-5 h-5 text-red-500" />,
        },
        {
            title: "Net Profit",
            value: `$${metrics.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            percentage: `${metrics.profitMargin}% Margin`,
            trend: metrics.netProfit >= 0 ? "up" : "down",
            description: "Revenue - Expenses",
            icon: <Wallet className="w-5 h-5 text-indigo-500" />,
        },
        {
            title: "Outstanding",
            value: `$${metrics.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            percentage: `${metrics.pendingCount} Pending`,
            trend: "neutral",
            description: "Waiting for payment",
            icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
        },
    ];

    if (loading && invoices.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h1
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "800",
                            marginBottom: "10px",
                            background: "var(--gradient-primary)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Financial Overview
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
                        Manage your business finances, invoices, and expenses.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex w-full sm:w-auto bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-border)] p-1 overflow-hidden">
                        <button
                            onClick={() => handleExport("invoices")}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            title="Export Invoices CSV"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Invoices
                        </button>
                        <div className="w-px bg-[var(--color-border)] my-1" />
                        <button
                            onClick={() => handleExport("expenses")}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            title="Export Expenses CSV"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Expenses
                        </button>
                    </div>
                    <Button variant="secondary" onClick={openAddModal}>
                        <AddIcon className="mr-2 w-4 h-4" /> Add Expense
                    </Button>
                    <Link href="/panel/invoices" passHref legacyBehavior>
                        <a
                            className="loga-btn bg-indigo-600 text-white hover:bg-indigo-700"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "0.5rem 1rem",
                                borderRadius: "0.5rem",
                                textDecoration: "none",
                                fontWeight: "600",
                            }}
                        >
                            <AddIcon style={{ fontSize: "1.2rem" }} /> New Invoice
                        </a>
                    </Link>
                </div>
            </div>

            <AccountingStats stats={stats} />

            <div style={{ marginTop: "40px" }} className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-[var(--color-border)]">
                    <button
                        onClick={() => setActiveTab("invoices")}
                        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === "invoices" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                    >
                        Income (Invoices)
                        {activeTab === "invoices" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("expenses")}
                        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === "expenses" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                    >
                        Expenses
                        {activeTab === "expenses" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                        )}
                    </button>
                </div>

                {activeTab === "invoices" ? (
                    <TransactionsTable transactions={invoices} type="admin" />
                ) : (
                    <ExpensesTable
                        expenses={expenses}
                        onEdit={openEditModal}
                        onDelete={handleDeleteExpense}
                    />
                )}
            </div>

            {/* Expense Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExpense ? "Edit Expense" : "Add New Expense"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Server Hosting"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Amount ($)
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="hosting">Hosting</option>
                                <option value="domain">Domain</option>
                                <option value="software">Software</option>
                                <option value="marketing">Marketing</option>
                                <option value="salary">Salary</option>
                                <option value="office">Office</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="recurring"
                            name="recurring"
                            checked={formData.recurring}
                            onChange={handleInputChange}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                            htmlFor="recurring"
                            className="text-sm text-[var(--color-text-primary)] cursor-pointer"
                        >
                            Recurring Expense
                        </label>
                    </div>

                    {formData.recurring && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                Frequency
                            </label>
                            <select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Frequency</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes || ""}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={isSubmitting}>
                            {editingExpense ? "Update Expense" : "Save Expense"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
