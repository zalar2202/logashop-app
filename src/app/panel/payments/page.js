"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { CreditCard, Plus, Search, Trash2, Edit, DollarSign, TrendingUp, Calendar } from "lucide-react";
import * as Yup from "yup";

const paymentSchema = Yup.object().shape({
    userId: Yup.string().required("Customer is required"),
    amount: Yup.number().min(0.01, "Amount must be greater than 0").required("Amount is required"),
    method: Yup.string().required("Payment method is required"),
    status: Yup.string(),
    reference: Yup.string(),
    paymentDate: Yup.date().required("Payment date is required"),
    notes: Yup.string(),
    invoice: Yup.string().nullable(),
});

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchPayments();
        fetchUsers();
        fetchInvoices();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/payments");
            if (data.success) setPayments(data.data);
        } catch (error) {
            toast.error("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/users?limit=500");
            if (data?.data && Array.isArray(data.data)) setUsers(data.data);
            else if (data?.success && Array.isArray(data.data)) setUsers(data.data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const fetchInvoices = async () => {
        try {
            const { data } = await axios.get("/api/invoices");
            if (data.success) setInvoices(data.data || []);
        } catch (error) {
            console.error("Failed to fetch invoices");
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const payload = { ...values };
            if (!payload.invoice) delete payload.invoice;

            if (selectedPayment) {
                const { data } = await axios.put(`/api/payments/${selectedPayment._id}`, payload);
                if (data.success) {
                    toast.success("Payment updated");
                    fetchPayments();
                    setIsModalOpen(false);
                }
            } else {
                const { data } = await axios.post("/api/payments", payload);
                if (data.success) {
                    toast.success("Payment recorded");
                    fetchPayments();
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
        if (!confirm("Delete this payment record?")) return;
        try {
            await axios.delete(`/api/payments/${id}`);
            toast.success("Payment deleted");
            fetchPayments();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const openCreateModal = () => {
        setSelectedPayment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const filteredPayments = payments.filter(p =>
        p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const totalReceived = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

    return (
        <ContentWrapper>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <CreditCard className="w-6 h-6 text-green-600" />
                        Payments
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Track and manage customer payments.
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                    Record Payment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Received</p>
                        <p className="text-2xl font-bold text-green-600">${totalReceived.toFixed(2)}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">This Month</p>
                        <p className="text-2xl font-bold text-indigo-600">{payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length} payments</p>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search payments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
                        style={{ borderColor: "var(--color-border)" }}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-4 font-semibold text-sm text-gray-500">Date</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">Customer</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">Amount</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">Method</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">Status</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">Reference</th>
                                <th className="p-4 font-semibold text-sm text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No payments found.</td></tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="border-b last:border-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium">{payment.userId?.name || payment.userId?.email || "—"}</td>
                                        <td className="p-4 font-bold text-green-600">${payment.amount?.toFixed(2)}</td>
                                        <td className="p-4 text-sm capitalize">{payment.method?.replace('_', ' ')}</td>
                                        <td className="p-4">
                                            <Badge variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'} size="sm" className="capitalize">
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 font-mono">{payment.reference || "-"}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditModal(payment)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(payment._id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPayment ? "Edit Payment" : "Record Payment"} size="lg">
                <Formik
                    initialValues={{
                        userId: selectedPayment?.userId?._id || selectedPayment?.userId || "",
                        amount: selectedPayment?.amount || "",
                        method: selectedPayment?.method || "bank_transfer",
                        status: selectedPayment?.status || "completed",
                        reference: selectedPayment?.reference || "",
                        paymentDate: selectedPayment?.paymentDate ? new Date(selectedPayment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        notes: selectedPayment?.notes || "",
                        invoice: selectedPayment?.invoice?._id || "",
                    }}
                    validationSchema={paymentSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <SelectField name="userId" label="Customer">
                                <option value="">-- Select Customer --</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} {u.email ? `(${u.email})` : ""}</option>
                                ))}
                            </SelectField>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField type="number" name="amount" label="Amount ($)" min="0" step="0.01" />
                                <SelectField name="method" label="Payment Method">
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cash">Cash</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="crypto">Crypto</option>
                                    <option value="check">Check</option>
                                    <option value="other">Other</option>
                                </SelectField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField type="date" name="paymentDate" label="Payment Date" />
                                <SelectField name="status" label="Status">
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </SelectField>
                            </div>

                            <SelectField name="invoice" label="Link to Invoice (Optional)">
                                <option value="">-- No Invoice --</option>
                                {invoices.map(inv => (
                                    <option key={inv._id} value={inv._id}>{inv.invoiceNumber} - ${inv.total?.toFixed(2)}</option>
                                ))}
                            </SelectField>

                            <InputField name="reference" label="Reference / Transaction ID" placeholder="e.g., TXN-12345" />
                            <TextareaField name="notes" label="Notes" rows={2} />

                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" loading={isSubmitting}>
                                    {selectedPayment ? "Update Payment" : "Record Payment"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </ContentWrapper>
    );
}
