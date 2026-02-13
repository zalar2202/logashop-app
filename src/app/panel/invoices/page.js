"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form, Field, FieldArray } from "formik";
import { toast } from "sonner";
import {
    FileText,
    Plus,
    Search,
    Trash2,
    Edit,
    Download,
    MoreVertical,
    CheckCircle,
    Clock,
    XCircle,
    Send,
    Mail,
    CreditCard,
    Building2,
    Globe,
    DollarSign,
} from "lucide-react";
import * as Yup from "yup";

import { useSearchParams } from "next/navigation";

const invoiceSchema = Yup.object().shape({
    client: Yup.string().required("Client is required"),
    invoiceNumber: Yup.string(), // Auto-generated if empty
    issueDate: Yup.date().required("Issue date is required"),
    dueDate: Yup.date().required("Due date is required"),
    status: Yup.string().oneOf(["draft", "sent", "partial", "paid", "overdue", "cancelled"]),
    items: Yup.array()
        .of(
            Yup.object().shape({
                description: Yup.string().required("Description required"),
                quantity: Yup.number().min(1, "Qty >= 1").required("Required"),
                unitPrice: Yup.number().min(0, "Price >= 0").required("Required"),
            })
        )
        .min(1, "At least one item is required"),
    notes: Yup.string(),
    taxRate: Yup.number().min(0).max(100),
});

function InvoicesPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const invoiceIdParam = searchParams.get("id");
    const isAdmin = ["admin", "manager"].includes(user?.role);
    
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [sendingId, setSendingId] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchInvoices(), fetchClients(), fetchPackages()]);
        };
        init();
    }, []);

    // Effect to open detail view if ID is in URL
    useEffect(() => {
        if (invoiceIdParam && invoices.length > 0) {
            const inv = invoices.find(i => i._id === invoiceIdParam || i.id === invoiceIdParam);
            if (inv) {
                setSelectedInvoice(inv);
                setIsViewModalOpen(true);
            }
        }
    }, [invoiceIdParam, invoices]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/invoices");
            if (data.success) {
                setInvoices(data.data);
                return data.data;
            }
        } catch (error) {
            toast.error("Failed to fetch invoices");
        } finally {
            setLoading(false);
        }
        return [];
    };

    const fetchClients = async () => {
        try {
            const { data } = await axios.get("/api/clients");
            if (data.success) setClients(data.data || []);
        } catch (error) {
            console.error("Failed to fetch clients");
        }
    };

    const fetchPackages = async () => {
        try {
            const { data } = await axios.get("/api/packages");
            if (data.success) setPackages(data.data || []);
        } catch (error) {
            console.error("Failed to fetch packages");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            if (selectedInvoice) {
                const { data } = await axios.put(`/api/invoices/${selectedInvoice._id}`, values);
                if (data.success) {
                    toast.success("Invoice updated");
                    fetchInvoices();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post("/api/invoices", values);
                if (data.success) {
                    toast.success("Invoice created");
                    fetchInvoices();
                    setIsModalOpen(false);
                    resetForm();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await axios.delete(`/api/invoices/${id}`);
            toast.success("Invoice deleted");
            fetchInvoices();
        } catch (error) {
            toast.error("Failed to delete invoice");
        }
    };

    const handleSendInvoice = async (inv) => {
        if (!inv.client?.email) {
            toast.error("Client has no email address");
            return;
        }
        setSendingId(inv._id);
        try {
            const { data } = await axios.post(`/api/invoices/${inv._id}/send`);
            if (data.success) {
                toast.success(data.message || "Invoice sent!");
                fetchInvoices();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send invoice");
        } finally {
            setSendingId(null);
        }
    };

    const openCreateModal = () => {
        setSelectedInvoice(null);
        setIsModalOpen(true);
    };

    const openEditModal = (inv) => {
        setSelectedInvoice(inv);
        setIsModalOpen(true);
    };

    const filteredInvoices = invoices.filter(
        (inv) =>
            inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            inv.client?.name?.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate totals for live preview
    const calculateTotals = (values) => {
        const subtotal = values.items.reduce(
            (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
            0
        );
        const tax = subtotal * ((Number(values.taxRate) || 0) / 100);
        return { subtotal, tax, total: subtotal + tax };
    };

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1
                        className="text-2xl font-bold flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <FileText className="w-6 h-6 text-indigo-600" />
                        Invoices
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage client billing and track payments.
                    </p>
                </div>
                {["admin", "manager"].includes(user?.role) && (
                    <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                        Create Invoice
                    </Button>
                )}
            </div>

            <Card>
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-transparent text-[var(--color-text-primary)]"
                        style={{ borderColor: "var(--color-border)" }}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]/50">
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    Invoice Details
                                </th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Client</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Date</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Type</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] text-right">Amount</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] text-center">Status</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr
                                        key={inv._id}
                                        className="border-b last:border-0 border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    {inv.invoiceNumber}
                                                </span>
                                                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-medium">#{inv._id.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[var(--color-text-primary)]">
                                                    {inv.client?.name || "Unknown"}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-secondary)]">{inv.client?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                                            {new Date(inv.issueDate).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            {(() => {
                                                if (inv.paymentPlan?.isInstallment) {
                                                    // Check if this is a down payment invoice
                                                    if (inv.paymentPlan.downPayment && inv.paymentPlan.downPayment > 0) {
                                                        // If invoice total equals down payment amount, it's a down payment invoice
                                                        if (Math.abs(inv.total - inv.paymentPlan.downPayment) < 0.01) {
                                                            return (
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    Down Payment
                                                                </span>
                                                            );
                                                        }
                                                    }
                                                    // Regular installment invoice
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                                                            <Clock className="w-3 h-3" />
                                                            Installment
                                                        </span>
                                                    );
                                                }
                                                // Full payment invoice
                                                return (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Full Payment
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 font-black text-[var(--color-text-primary)] text-right">
                                            ${inv.total?.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {(() => {
                                                // Determine specific invoice status
                                                if (inv.status === "paid") {
                                                    return <Badge variant="success" size="sm">PAID IN FULL</Badge>;
                                                }
                                                
                                                if (inv.paymentPlan?.isInstallment) {
                                                    // Installment invoice
                                                    if (inv.paymentPlan.downPayment && inv.paymentPlan.downPayment > 0) {
                                                        // Has down payment
                                                        if (inv.status === "pending") {
                                                            return (
                                                                <Badge variant="warning" size="sm">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    DOWN PAYMENT DUE
                                                                </Badge>
                                                            );
                                                        } else if (inv.status === "partial") {
                                                            return (
                                                                <Badge variant="primary" size="sm">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    INSTALLMENTS ACTIVE
                                                                </Badge>
                                                            );
                                                        }
                                                    } else {
                                                        // No down payment, just installments
                                                        if (inv.status === "pending") {
                                                            return (
                                                                <Badge variant="warning" size="sm">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    1ST INSTALLMENT DUE
                                                                </Badge>
                                                            );
                                                        } else if (inv.status === "partial") {
                                                            return (
                                                                <Badge variant="primary" size="sm">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    INSTALLMENTS ACTIVE
                                                                </Badge>
                                                            );
                                                        }
                                                    }
                                                }
                                                
                                                // Standard statuses
                                                if (inv.status === "overdue") {
                                                    return <Badge variant="danger" size="sm">OVERDUE</Badge>;
                                                }
                                                if (inv.status === "pending") {
                                                    return <Badge variant="primary" size="sm">PENDING PAYMENT</Badge>;
                                                }
                                                if (inv.status === "partial") {
                                                    return <Badge variant="warning" size="sm">PARTIALLY PAID</Badge>;
                                                }
                                                
                                                return <Badge variant="secondary" size="sm">{inv.status.toUpperCase()}</Badge>;
                                            })()}
                                            {inv.paymentMethod && inv.status !== 'paid' && (
                                                <div className="mt-1">
                                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                                        METHOD: {inv.paymentMethod.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {["admin", "manager"].includes(user?.role) ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSendInvoice(inv);
                                                            }}
                                                            disabled={sendingId === inv._id}
                                                            className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors disabled:opacity-50"
                                                            title="Send to client"
                                                        >
                                                            {sendingId === inv._id ? (
                                                                <span className="animate-spin">
                                                                    ⏳
                                                                </span>
                                                            ) : (
                                                                <Mail className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(inv)}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(inv._id)}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {["sent", "overdue"].includes(inv.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedInvoice(inv);
                                                                    setIsPaymentModalOpen(true);
                                                                }}
                                                            >
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInvoice(inv);
                                                                setIsViewModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    selectedInvoice
                        ? `Edit Invoice ${selectedInvoice.invoiceNumber}`
                        : "New Invoice"
                }
                size="4xl"
            >
                <Formik
                    initialValues={{
                        client: selectedInvoice?.client?._id || selectedInvoice?.client || "",
                        package: selectedInvoice?.package?._id || selectedInvoice?.package || "",
                        invoiceNumber: selectedInvoice?.invoiceNumber || "",
                        issueDate: selectedInvoice?.issueDate
                            ? new Date(selectedInvoice.issueDate).toISOString().split("T")[0]
                            : new Date().toISOString().split("T")[0],
                        dueDate: selectedInvoice?.dueDate
                            ? new Date(selectedInvoice.dueDate).toISOString().split("T")[0]
                            : new Date(Date.now() + 12096e5).toISOString().split("T")[0],
                        status: selectedInvoice?.status || "draft",
                        items: selectedInvoice?.items || [
                            { description: "", quantity: 1, unitPrice: 0 },
                        ],
                        notes: selectedInvoice?.notes || "",
                        taxRate: selectedInvoice?.taxRate || 0,
                        paymentPlan: {
                            isInstallment: selectedInvoice?.paymentPlan?.isInstallment || false,
                            downPayment: selectedInvoice?.paymentPlan?.downPayment || 0,
                            installmentsCount: selectedInvoice?.paymentPlan?.installmentsCount || 0,
                            installmentAmount: selectedInvoice?.paymentPlan?.installmentAmount || 0,
                            period: selectedInvoice?.paymentPlan?.period || "monthly",
                        },
                    }}
                    validationSchema={invoiceSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, isSubmitting, setFieldValue }) => {
                        const totals = calculateTotals(values);
                        return (
                            <Form className="space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <SelectField name="client" label="Client">
                                        <option value="">-- Select Client --</option>
                                        {clients.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </SelectField>
                                    <SelectField name="package" label="Linked Package (Auto-Activation)">
                                        <option value="">-- None --</option>
                                        {packages.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} (${p.price})
                                            </option>
                                        ))}
                                    </SelectField>
                                    <SelectField name="status" label="Status">
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="partial">Partially Paid</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                    </SelectField>
                                    <InputField type="date" name="issueDate" label="Issue Date" />
                                    <InputField type="date" name="dueDate" label="Due Date" />
                                </div>

                                {/* Items Table */}
                                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 grid grid-cols-12 gap-2 text-sm font-semibold text-gray-500">
                                        <div className="col-span-6">Description</div>
                                        <div className="col-span-2">Qty</div>
                                        <div className="col-span-3">Price</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <FieldArray name="items">
                                        {({ push, remove }) => (
                                            <div className="p-2 space-y-2">
                                                {values.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-12 gap-2 items-start"
                                                    >
                                                        <div className="col-span-6">
                                                            <InputField
                                                                name={`items.${index}.description`}
                                                                placeholder="Item description"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <InputField
                                                                type="number"
                                                                name={`items.${index}.quantity`}
                                                                min="1"
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <InputField
                                                                type="number"
                                                                name={`items.${index}.unitPrice`}
                                                                min="0"
                                                                step="0.01"
                                                                prefix="$"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 pt-2 flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(index)}
                                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        push({
                                                            description: "",
                                                            quantity: 1,
                                                            unitPrice: 0,
                                                        })
                                                    }
                                                    icon={<Plus className="w-3 h-3" />}
                                                >
                                                    Add Item
                                                </Button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>

                                <div className="flex justify-end">
                                    <div className="w-full md:w-1/3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">
                                                ${totals.subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-2">
                                                Tax Rate (%):
                                            </span>
                                            <div className="w-20">
                                                <InputField
                                                    type="number"
                                                    name="taxRate"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                            <span>Total:</span>
                                            <span className="text-indigo-600">
                                                ${totals.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                 <div className="bg-[var(--color-background-secondary)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
                                     <div className="flex items-center justify-between">
                                         <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                             <CreditCard className="w-4 h-4 text-indigo-600" />
                                             Payment & Installment Options
                                         </h4>
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <input
                                                 type="checkbox"
                                                 className="rounded text-indigo-600"
                                                 name="paymentPlan.isInstallment"
                                                 checked={values.paymentPlan.isInstallment}
                                                 onChange={(e) => setFieldValue("paymentPlan.isInstallment", e.target.checked)}
                                             />
                                             <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Enable Installments</span>
                                         </label>
                                     </div>

                                     {values.paymentPlan.isInstallment && (
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                             <InputField
                                                 type="number"
                                                 name="paymentPlan.downPayment"
                                                 label="Down Payment"
                                                 prefix="$"
                                             />
                                             <InputField
                                                 type="number"
                                                 name="paymentPlan.installmentAmount"
                                                 label="Installment Amt"
                                                 prefix="$"
                                             />
                                             <InputField
                                                 type="number"
                                                 name="paymentPlan.installmentsCount"
                                                 label="Total Payments"
                                             />
                                             <SelectField name="paymentPlan.period" label="Period">
                                                 <option value="monthly">Monthly</option>
                                                 <option value="weekly">Weekly</option>
                                                 <option value="quarterly">Quarterly</option>
                                             </SelectField>
                                         </div>
                                     )}
                                 </div>

                                 <TextareaField
                                     name="notes"
                                     label="Notes / Payment Instructions"
                                     rows={2}
                                 />

                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" loading={isSubmitting}>
                                        {selectedInvoice ? "Save Changes" : "Create Invoice"}
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Invoice Details: ${selectedInvoice?.invoiceNumber}`}
                size="3xl"
            >
                {selectedInvoice && (
                    <div className="space-y-6 py-2">
                        <div className="grid grid-cols-2 gap-8 border-b pb-6 dark:border-gray-700">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Bill To</p>
                                <p className="font-bold text-lg text-[var(--color-text-primary)]">{selectedInvoice.client?.name || 'Unknown Client'}</p>
                                <p className="text-sm text-[var(--color-text-secondary)]">{selectedInvoice.client?.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Invoice Status</p>
                                <Badge
                                    variant={
                                        selectedInvoice.status === "paid"
                                            ? "success"
                                            : selectedInvoice.status === "overdue"
                                                ? "danger"
                                                : "primary"
                                    }
                                >
                                    {selectedInvoice.status.toUpperCase()}
                                </Badge>
                                {selectedInvoice.paymentMethod && selectedInvoice.status !== 'paid' && (
                                    <div className="mt-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                CLIENT CHOSE: {selectedInvoice.paymentMethod.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-amber-500 mt-1 italic">
                                            Payments instructions will be sant to you by admin.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="text-gray-400 mb-1">Invoice Number</p>
                                <p className="font-mono font-bold text-[var(--color-text-primary)]">{selectedInvoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">Issue Date</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{new Date(selectedInvoice.issueDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">Due Date</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{new Date(selectedInvoice.dueDate).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden border-[var(--color-border)]">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--color-background-secondary)]">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Service Description</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Qty</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {selectedInvoice.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-primary)] font-medium">{item.description}</td>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)] text-center">{item.quantity}</td>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-secondary)] text-right">${item.unitPrice?.toFixed(2)}</td>
                                            <td className="px-4 py-4 text-sm text-[var(--color-text-primary)] font-bold text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                                    <span>Subtotal</span>
                                    <span>${selectedInvoice.subtotal?.toFixed(2) || (selectedInvoice.total / (1 + (selectedInvoice.taxRate || 0)/100)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                                    <span>Tax ({selectedInvoice.taxRate || 0}%)</span>
                                    <span>${((selectedInvoice.total || 0) - (selectedInvoice.subtotal || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-[var(--color-text-primary)] border-t pt-3 dark:border-gray-700">
                                    <span>Total</span>
                                    <span className="text-indigo-600">${selectedInvoice.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {selectedInvoice.paymentPlan?.isInstallment && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/20">
                                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Payment Breakdown
                                </h4>
                                
                                <div className="space-y-3">
                                    {/* Down Payment */}
                                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                                        ['partial', 'paid'].includes(selectedInvoice.status) 
                                        ? 'bg-emerald-100/50 dark:bg-emerald-900/30' 
                                        : 'bg-amber-100/50 dark:bg-amber-900/30'
                                    }`}>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${
                                            ['partial', 'paid'].includes(selectedInvoice.status)
                                            ? 'text-emerald-800 dark:text-emerald-200'
                                            : 'text-amber-800 dark:text-amber-200'
                                        }`}>
                                            {['partial', 'paid'].includes(selectedInvoice.status) ? 'Down Payment (Paid)' : 'Down Payment (Due Now)'}
                                        </span>
                                        <span className={`text-lg font-bold ${
                                            ['partial', 'paid'].includes(selectedInvoice.status)
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            ${selectedInvoice.paymentPlan.downPayment?.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Remaining Balance */}
                                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                                        selectedInvoice.status === 'partial' 
                                        ? 'bg-amber-100/50 dark:bg-amber-900/30' 
                                        : selectedInvoice.status === 'paid'
                                            ? 'bg-emerald-100/50 dark:bg-emerald-900/30'
                                            : ''
                                    }`}>
                                        <span className={`text-xs ${
                                            selectedInvoice.status === 'partial'
                                            ? 'font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide'
                                            : selectedInvoice.status === 'paid'
                                                ? 'font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide'
                                                : 'text-indigo-400 dark:text-indigo-500 uppercase font-bold'
                                        }`}>
                                            {selectedInvoice.status === 'partial' 
                                                ? 'Remaining Balance (Due Now)' 
                                                : selectedInvoice.status === 'paid'
                                                    ? 'Remaining Balance (Paid)'
                                                    : 'Remaining Balance (Deferred)'
                                            }
                                        </span>
                                        <span className={`text-lg font-bold ${
                                            selectedInvoice.status === 'partial'
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : selectedInvoice.status === 'paid'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-indigo-900 dark:text-indigo-100'
                                        }`}>
                                            ${(selectedInvoice.total - selectedInvoice.paymentPlan.downPayment).toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    {selectedInvoice.paymentPlan.installmentAmount > 0 && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-indigo-200 dark:border-indigo-800/30">
                                            <div>
                                                <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-bold">Instalments</p>
                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                                                    {selectedInvoice.paymentPlan.installmentsCount} x ${selectedInvoice.paymentPlan.installmentAmount?.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-bold">Frequency</p>
                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 capitalize">{selectedInvoice.paymentPlan.period}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                         {selectedInvoice.notes && (
                             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-[var(--color-border)]">
                                 <p className="text-xs uppercase font-bold text-gray-400 mb-2">Notes</p>
                                 <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic whitespace-pre-wrap">{selectedInvoice.notes}</p>
                             </div>
                         )}

                        <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                            <Link href={`/panel/invoices/${selectedInvoice._id}/print`}>
                                <Button variant="primary" icon={<Download className="w-4 h-4" />}>Download PDF</Button>
                            </Link>
                            {!isAdmin && ['sent', 'overdue'].includes(selectedInvoice.status) && (
                                <Button variant="success" onClick={() => { setIsViewModalOpen(false); setIsPaymentModalOpen(true); }}>Proceed to Payment</Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            {/* Payment Method Selection Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Select Payment Method"
                size="md"
            >
                <div className="space-y-6 p-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Please select your preferred payment method for invoice <strong>{selectedInvoice?.invoiceNumber}</strong>. 
                        After selection, our team will manually provide you with the specific payment instructions.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'bank_transfer', name: 'Bank Transfer', desc: 'Direct deposit to our business account', icon: <Building2 className="w-5 h-5" /> },
                            { id: 'crypto', name: 'Cryptocurrency', desc: 'USDT (TRC20), BTC, or ETH', icon: <Globe className="w-5 h-5" /> },
                            { id: 'cash', name: 'Cash Payment', desc: 'Visit our office or local agent', icon: <CreditCard className="w-5 h-5" /> },
                            { id: 'other', name: 'Other Methods', desc: 'Contact support for more options', icon: <Plus className="w-5 h-5" /> }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={async () => {
                                    try {
                                        const { data } = await axios.patch(`/api/invoices/${selectedInvoice._id}/payment-method`, {
                                            paymentMethod: method.id
                                        });
                                        if (data.success) {
                                            toast.success(`Chosen ${method.name}. Awaiting instructions.`);
                                            setIsPaymentModalOpen(false);
                                            fetchInvoices();
                                        }
                                    } catch (err) {
                                        toast.error("Failed to update payment method");
                                    }
                                }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-left group"
                            >
                                <div className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-lg transition-colors">
                                    {method.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--color-text-primary)]">{method.name}</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{method.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="pt-4 border-t border-[var(--color-border)]">
                        <p className="text-[10px] text-center text-[var(--color-text-tertiary)] italic">
                            No automated payments are processed here. Selection notifies our billing department.
                        </p>
                    </div>
                </div>
            </Modal>
        </ContentWrapper>
    );
}

import { Suspense } from "react";

export default function InvoicesPageWithSuspense() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoicesPage />
        </Suspense>
    );
}
