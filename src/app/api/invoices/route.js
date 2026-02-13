import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client"; // Ensure model is loaded
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { convertToBaseCurrency } from "@/lib/currency";

// Helper to generate Invoice Number
function generateInvoiceNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${date}-${random}`;
}

export async function GET(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const status = searchParams.get("status");

        // Build Query
        const query = {};
        if (clientId) query.client = clientId;
        if (status && status !== "all") query.status = status;

        if (!["admin", "manager"].includes(user.role)) {
            // If regular user, only show invoices linked to their user ID
            query.user = user._id;
            query.status = { $ne: "draft" };
        }

        const invoices = await Invoice.find(query)
            .populate("client", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: invoices });
    } catch (error) {
        console.error("Invoice fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();

        // Sanitize ObjectIds
        if (body.package === "") body.package = null;
        if (body.client === "") body.client = null;
        if (body.user === "") body.user = null;

        if (!body.client || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: "Client and at least one item are required" },
                { status: 400 }
            );
        }

        if (!body.invoiceNumber) {
            body.invoiceNumber = generateInvoiceNumber();
        }

        let subtotal = 0;
        const processedItems = body.items.map((item) => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.unitPrice) || 0;
            const amount = quantity * price;
            subtotal += amount;
            return {
                description: item.description,
                quantity,
                unitPrice: price,
                amount,
            };
        });

        const taxRate = Number(body.taxRate) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const promo = body.promotion || {};
        const promoDiscount =
            promo.discountType === "percentage" && promo.discountValue
                ? (subtotal * promo.discountValue) / 100
                : promo.discountAmount || 0;
        const total = Math.max(0, subtotal + taxAmount - promoDiscount);

        const { amount: totalInBase, rate } = await convertToBaseCurrency(
            total,
            body.currency || "USD"
        );

        const paymentPlan = body.paymentPlan || {};
        if (paymentPlan.isInstallment && paymentPlan.installmentsCount > 0) {
            const installments = [];
            const count = Number(paymentPlan.installmentsCount);
            const amount = Number(paymentPlan.installmentAmount);
            const period = paymentPlan.period || "monthly";
            const startDate = new Date(body.issueDate || Date.now());

            for (let i = 1; i <= count; i++) {
                const dueDate = new Date(startDate);
                if (period === "monthly") dueDate.setMonth(dueDate.getMonth() + i);
                else if (period === "weekly") dueDate.setDate(dueDate.getDate() + i * 7);
                else if (period === "quarterly") dueDate.setMonth(dueDate.getMonth() + i * 3);

                installments.push({
                    dueDate,
                    amount,
                    status: "unpaid",
                });
            }
            paymentPlan.installments = installments;
        }

        const invoiceData = {
            ...body,
            items: processedItems,
            subtotal,
            taxRate,
            taxAmount,
            total,
            exchangeRate: rate,
            totalInBaseCurrency: totalInBase,
            paymentPlan,
            createdBy: user._id,
        };

        const invoice = await Invoice.create(invoiceData);

        return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (error) {
        console.error("Invoice creation error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ error: "Invoice number already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
