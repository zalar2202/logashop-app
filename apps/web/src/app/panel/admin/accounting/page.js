"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import SalesTable from "@/components/accounting/SalesTable";
import ExpensesTable from "@/components/accounting/ExpensesTable";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Loader2, TrendingDown, DollarSign, Wallet, Plus, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";

export default function AdminAccountingPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("sales"); // 'sales' or 'expenses'

    // Data
    const [orders, setOrders] = useState([]);
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
        // Orders store total in cents
        const revenueCents = orders
            .filter((o) => o.paymentStatus === "paid")
            .reduce((sum, o) => sum + (o.total || 0), 0);
        const revenue = revenueCents / 100;

        const totalExpenses = expenses
            .filter((exp) => exp.status === "paid")
            .reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const netProfit = revenue - totalExpenses;
        const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;

        const paidCount = orders.filter((o) => o.paymentStatus === "paid").length;

        return {
            totalRevenue: revenue,
            totalExpenses,
            netProfit,
            paidCount,
            profitMargin,
        };
    }, [orders, expenses]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [ordersRes, expensesRes] = await Promise.all([
                axios.get("/api/orders", { params: { paymentStatus: "paid", limit: 100 } }),
                axios.get("/api/expenses"),
            ]);

            if (ordersRes.data.success) {
                setOrders(ordersRes.data.data);
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

    if (loading && orders.length === 0 && expenses.length === 0) {
        return (
            <ContentWrapper>
                <div className="min-h-[400px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Accounting
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage your business finances, sales, and expenses.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-1 overflow-hidden">
                        <button
                            onClick={() => handleExport("orders")}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all rounded-md"
                            title="Export Orders CSV"
                        >
                            <FileSpreadsheet size={14} /> Orders
                        </button>
                        <div className="w-px bg-[var(--color-border)] my-1" />
                        <button
                            onClick={() => handleExport("expenses")}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all rounded-md"
                            title="Export Expenses CSV"
                        >
                            <FileSpreadsheet size={14} /> Expenses
                        </button>
                    </div>
                    <Button
                        icon={<Plus size={18} />}
                        onClick={openAddModal}
                        className="w-full md:w-auto"
                    >
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Stats Row - matching Support Tickets style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                ${metrics.totalRevenue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                            <p className="text-xs text-gray-500">Total Revenue</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                ${metrics.totalExpenses.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                            <p className="text-xs text-gray-500">Total Expenses</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                metrics.netProfit >= 0
                                    ? "bg-indigo-100 dark:bg-indigo-900/30"
                                    : "bg-red-100 dark:bg-red-900/30"
                            }`}
                        >
                            <Wallet
                                className={`w-5 h-5 ${
                                    metrics.netProfit >= 0 ? "text-indigo-600" : "text-red-600"
                                }`}
                            />
                        </div>
                        <div>
                            <p
                                className={`text-2xl font-bold ${
                                    metrics.netProfit >= 0 ? "text-indigo-600" : "text-red-600"
                                }`}
                            >
                                ${metrics.netProfit.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                            <p className="text-xs text-gray-500">Net Profit</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-6 space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-[var(--color-border)]">
                    <button
                        onClick={() => setActiveTab("sales")}
                        className={`px-6 py-3 font-semibold text-sm transition-colors relative ${activeTab === "sales" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                    >
                        Sales (Orders)
                        {activeTab === "sales" && (
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

                {activeTab === "sales" ? (
                    <SalesTable orders={orders} />
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
        </ContentWrapper>
    );
}
