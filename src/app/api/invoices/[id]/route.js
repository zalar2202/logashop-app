import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { convertToBaseCurrency } from "@/lib/currency";

// GET Single Invoice
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoice = await Invoice.findById(id).populate("client");

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Permission check
        if (!["admin", "manager"].includes(user.role)) {
            const isOwner = invoice.user?.toString() === user._id.toString();
            if (!isOwner) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        return NextResponse.json({ success: true, data: invoice });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// UPDATE Invoice
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const oldInvoice = await Invoice.findById(id);
        if (!oldInvoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        if (body.package === "") body.package = null;
        if (body.client === "") body.client = null;
        if (body.user === "") body.user = null;

        if (body.items || body.taxRate !== undefined || body.promotion) {
            const items = body.items || oldInvoice.items || [];
            let subtotal = 0;
            const processedItems = items.map((item) => {
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
            body.items = processedItems;

            const taxRate =
                body.taxRate !== undefined ? Number(body.taxRate) : oldInvoice.taxRate || 0;
            const taxAmount = subtotal * (taxRate / 100);

            body.subtotal = subtotal;
            body.taxAmount = taxAmount;

            const promo = body.promotion || oldInvoice.promotion || {};
            const promoAmount =
                promo.discountType === "percentage" && promo.discountValue
                    ? (subtotal * promo.discountValue) / 100
                    : promo.discountAmount || 0;

            body.total = Math.max(0, subtotal + taxAmount - promoAmount);

            const { amount: totalInBase, rate } = await convertToBaseCurrency(
                body.total,
                body.currency || oldInvoice.currency || "USD"
            );
            body.exchangeRate = rate;
            body.totalInBaseCurrency = totalInBase;
        }

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate("client");

        return NextResponse.json({ success: true, data: invoice });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE Invoice
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const invoice = await Invoice.findByIdAndDelete(id);

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
