import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import Order from "@/models/Order";
import Invoice from "@/models/Invoice";
import Expense from "@/models/Expense";

const escapeCSV = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export async function GET(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // orders, invoices, expenses

        if (!["orders", "invoices", "expenses"].includes(type)) {
            return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
        }

        let csvContent = "";
        let filename = "";

        if (type === "orders") {
            const data = await Order.find().sort({ createdAt: -1 }).lean();
            filename = `orders-report-${new Date().toISOString().split("T")[0]}.csv`;

            const headers = [
                "Order #",
                "Date",
                "Customer",
                "Email",
                "Total",
                "Status",
                "Payment Method",
            ];
            const rows = data.map((order) => [
                escapeCSV(order.orderNumber),
                escapeCSV(new Date(order.createdAt).toLocaleDateString()),
                escapeCSV(`${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`),
                escapeCSV(order.guestEmail || "N/A"),
                escapeCSV(order.totalAmount || order.total),
                escapeCSV(order.status),
                escapeCSV(order.paymentMethod),
            ]);
            csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
        } else if (type === "invoices") {
            const data = await Invoice.find().populate("client").sort({ createdAt: -1 }).lean();
            filename = `invoices-report-${new Date().toISOString().split("T")[0]}.csv`;

            const headers = [
                "Invoice #",
                "Date",
                "Client",
                "Amount",
                "Currency",
                "Status",
                "Due Date",
            ];
            const rows = data.map((inv) => [
                escapeCSV(inv.invoiceNumber),
                escapeCSV(new Date(inv.issueDate || inv.createdAt).toLocaleDateString()),
                escapeCSV(inv.client?.name || "N/A"),
                escapeCSV(inv.total),
                escapeCSV(inv.currency),
                escapeCSV(inv.status),
                escapeCSV(new Date(inv.dueDate).toLocaleDateString()),
            ]);
            csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
        } else if (type === "expenses") {
            const data = await Expense.find().sort({ date: -1 }).lean();
            filename = `expenses-report-${new Date().toISOString().split("T")[0]}.csv`;

            const headers = ["Date", "Description", "Category", "Amount", "Status", "Recurring"];
            const rows = data.map((exp) => [
                escapeCSV(new Date(exp.date).toLocaleDateString()),
                escapeCSV(exp.description),
                escapeCSV(exp.category),
                escapeCSV(exp.amount),
                escapeCSV(exp.status),
                escapeCSV(exp.recurring ? "Yes" : "No"),
            ]);
            csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
        }

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
