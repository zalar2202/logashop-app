"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader2, Download, Printer, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function InvoicePrintPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { data } = await axios.get(`/api/invoices/${id}`);
                if (data.success) {
                    setInvoice(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch invoice:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
                    <Button onClick={() => window.history.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-10">
            {/* Header Controls - Hidden during print */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        icon={<Printer className="w-4 h-4" />}
                        onClick={handlePrint}
                    >
                        Print Invoice
                    </Button>
                    <Button icon={<Download className="w-4 h-4" />} onClick={handlePrint}>
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />

                <div className="p-8 md:p-12">
                    {/* Invoice Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img
                                        src="/assets/logo/LogaTech-512.webp"
                                        alt="LogaShop"
                                        className="w-8 h-8 object-contain brightness-0 invert"
                                    />
                                </div>
                                <span className="text-2xl font-black tracking-tighter dark:text-white uppercase">
                                    Loga<span className="text-indigo-600">Tech</span>
                                </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <p>123 Digital Avenue</p>
                                <p>Tech City, TC 10101</p>
                                <p>contact@logatech.net</p>
                                <p>www.logatech.net</p>
                                <p>+1 (555) 000-1111</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 uppercase">
                                Invoice
                            </h2>
                            <p className="font-mono text-gray-500 dark:text-gray-400 mb-6">
                                #{invoice.invoiceNumber}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between md:justify-end gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Issue Date:
                                    </span>
                                    <span className="font-semibold dark:text-white">
                                        {new Date(invoice.issueDate).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Due Date:
                                    </span>
                                    <span className="font-semibold dark:text-white">
                                        {new Date(invoice.dueDate).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Status:
                                    </span>
                                    <span
                                        className={`font-bold uppercase tracking-wider ${
                                            invoice.status === "paid"
                                                ? "text-emerald-500"
                                                : "text-amber-500"
                                        }`}
                                    >
                                        {invoice.status}
                                    </span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-10">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Payment Type:
                                    </span>
                                    <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        {(() => {
                                            if (invoice.paymentPlan?.isInstallment) {
                                                if (
                                                    invoice.paymentPlan.downPayment &&
                                                    invoice.paymentPlan.downPayment > 0
                                                ) {
                                                    if (
                                                        Math.abs(
                                                            invoice.total -
                                                                invoice.paymentPlan.downPayment
                                                        ) < 0.01
                                                    ) {
                                                        return "DOWN PAYMENT";
                                                    }
                                                }
                                                return "INSTALLMENT";
                                            }
                                            return "FULL PAYMENT";
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800 mb-12" />

                    {/* Billing Details */}
                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Bill To
                            </h4>
                            <div className="text-gray-900 dark:text-white">
                                <p className="text-lg font-bold">{invoice.client?.name}</p>
                                <div className="text-gray-500 dark:text-gray-400 text-sm mt-2 space-y-1">
                                    <p>{invoice.client?.email}</p>
                                    <p>{invoice.client?.phone}</p>
                                    <p>{invoice.client?.address}</p>
                                </div>
                            </div>
                        </div>
                        {/* You can add "Payment Method" info here if available in the model */}
                    </div>

                    {/* Items Table */}
                    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 mb-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-center">Qty</th>
                                    <th className="p-4 text-right">Unit Price</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {invoice.items?.map((item, idx) => (
                                    <tr key={idx} className="text-sm dark:text-gray-300">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {item.description}
                                        </td>
                                        <td className="p-4 text-center">{item.quantity}</td>
                                        <td className="p-4 text-right">
                                            ${item.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900 dark:text-white">
                                            ${item.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end mb-12">
                        <div className="w-full md:w-1/3 space-y-4">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    ${invoice.subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>Tax ({invoice.taxRate}%)</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    ${invoice.taxAmount.toFixed(2)}
                                </span>
                            </div>

                            {/* Installment Breakdown */}
                            {invoice.paymentPlan?.isInstallment &&
                            invoice.paymentPlan.downPayment > 0 ? (
                                <>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            Total Package Value
                                        </span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            ${invoice.total.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Down Payment Row */}
                                    <div
                                        className={`flex justify-between items-center p-2 rounded-lg -mx-2 ${
                                            ["partial", "paid"].includes(invoice.status)
                                                ? "bg-emerald-50 dark:bg-emerald-900/20"
                                                : "bg-amber-50 dark:bg-amber-900/20"
                                        }`}
                                    >
                                        <span
                                            className={`text-sm font-bold uppercase tracking-wide ${
                                                ["partial", "paid"].includes(invoice.status)
                                                    ? "text-emerald-900 dark:text-emerald-100"
                                                    : "text-amber-900 dark:text-amber-100"
                                            }`}
                                        >
                                            {["partial", "paid"].includes(invoice.status)
                                                ? "Down Payment (Paid)"
                                                : "Down Payment (Due Now)"}
                                        </span>
                                        <span
                                            className={`text-xl font-black ${
                                                ["partial", "paid"].includes(invoice.status)
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-amber-600 dark:text-amber-400"
                                            }`}
                                        >
                                            ${invoice.paymentPlan.downPayment.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Remaining Balance Row */}
                                    <div
                                        className={`flex justify-between items-center p-2 rounded-lg -mx-2 mt-1 ${
                                            invoice.status === "partial"
                                                ? "bg-amber-50 dark:bg-amber-900/20"
                                                : invoice.status === "paid"
                                                ? "bg-emerald-50 dark:bg-emerald-900/20"
                                                : ""
                                        }`}
                                    >
                                        <span
                                            className={`text-sm ${
                                                invoice.status === "partial"
                                                    ? "font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wide"
                                                    : invoice.status === "paid"
                                                    ? "font-bold text-emerald-900 dark:text-emerald-100 uppercase tracking-wide"
                                                    : "text-gray-500 dark:text-gray-400"
                                            }`}
                                        >
                                            {invoice.status === "partial"
                                                ? "Remaining Balance (Due Now)"
                                                : invoice.status === "paid"
                                                ? "Remaining Balance (Paid)"
                                                : "Remaining Balance (Deferred)"}
                                        </span>
                                        <span
                                            className={`font-bold ${
                                                invoice.status === "partial"
                                                    ? "text-xl font-black text-amber-600 dark:text-amber-400"
                                                    : invoice.status === "paid"
                                                    ? "text-xl font-black text-emerald-600 dark:text-emerald-400"
                                                    : "text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            $
                                            {(
                                                invoice.total - invoice.paymentPlan.downPayment
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        Total
                                    </span>
                                    <span className="text-2xl font-black text-indigo-600">
                                        ${invoice.total.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Plan / Installments */}
                    {invoice.paymentPlan?.isInstallment && (
                        <div className="mb-12 p-6 border-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/5 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-widest">
                                    Installment Payment Plan
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-x-12 gap-y-6">
                                <div>
                                    <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">
                                        Down Payment
                                    </p>
                                    <p className="text-lg font-bold text-indigo-900 dark:text-white">
                                        ${invoice.paymentPlan.downPayment?.toFixed(2)}
                                    </p>
                                </div>
                                {invoice.paymentPlan.installmentAmount > 0 ? (
                                    <>
                                        <div>
                                            <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">
                                                Installment Amt
                                            </p>
                                            <p className="text-lg font-bold text-indigo-900 dark:text-white">
                                                ${invoice.paymentPlan.installmentAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">
                                                Frequency
                                            </p>
                                            <p className="text-lg font-bold text-indigo-900 dark:text-white capitalize">
                                                {invoice.paymentPlan.period}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">
                                            Remaining Balance
                                        </p>
                                        <p className="text-lg font-bold text-indigo-900 dark:text-white">
                                            $
                                            {(
                                                invoice.total - invoice.paymentPlan.downPayment
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] text-indigo-400 dark:text-indigo-500 uppercase font-black mb-1">
                                        Total Payments
                                    </p>
                                    <p className="text-lg font-bold text-indigo-900 dark:text-white">
                                        {invoice.paymentPlan.installmentsCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                                Notes & Payment Instructions
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                {invoice.notes}
                            </p>
                        </div>
                    )}

                    {/* Signature & Footer */}
                    <div className="mt-24 grid grid-cols-2 gap-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <div className="w-48 h-px bg-gray-300 dark:bg-gray-700 mb-2" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Authorized Signature
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                LogaShop LLC
                            </p>
                            <p className="text-xs text-gray-400 mt-1">www.logatech.net</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.3em]">
                            Thank you for choosing excellence
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .shadow-2xl {
                        box-shadow: none !important;
                    }
                    .rounded-2xl {
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
