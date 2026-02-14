import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import dbConnect from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const payment = await Payment.findById(id)
            .populate("userId", "name email")
            .populate("invoice", "invoiceNumber total")
            .populate("recordedBy", "name");

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: payment });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        if (body.invoice === "") body.invoice = undefined;

        const payment = await Payment.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        )
            .populate("userId", "name email")
            .populate("invoice", "invoiceNumber total");

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: payment });
    } catch (error) {
        console.error("Payment update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Payment deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
