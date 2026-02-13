import { NextResponse } from "next/server";
import Expense from "@/models/Expense";
import dbConnect from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await verifyAuth(request);

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const expense = await Expense.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: expense });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await verifyAuth(request);

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const deleted = await Expense.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Expense deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
