import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import dbConnect from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        const query = {};
        if (userId) query.userId = userId;

        const payments = await Payment.find(query)
            .populate("userId", "name email")
            .populate("invoice", "invoiceNumber total")
            .sort({ paymentDate: -1 });

        return NextResponse.json({ success: true, data: payments });
    } catch (error) {
        console.error("Payments fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const authUser = await verifyAuth(request);
        if (!authUser || !["admin", "manager"].includes(authUser.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        if (!body.userId) {
            return NextResponse.json({ error: "userId (customer) is required" }, { status: 400 });
        }
        if (body.invoice === "") body.invoice = undefined;

        const payment = await Payment.create({
            ...body,
            recordedBy: authUser._id,
        });

        const populated = await Payment.findById(payment._id)
            .populate("userId", "name email")
            .populate("invoice", "invoiceNumber total");

        return NextResponse.json({ success: true, data: populated }, { status: 201 });
    } catch (error) {
        console.error("Payment creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
