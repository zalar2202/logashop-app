import { NextResponse } from "next/server";
import Expense from "@/models/Expense";
import dbConnect from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function GET(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const expenses = await Expense.find().sort({ date: -1 });
        return NextResponse.json({ success: true, data: expenses });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const user = await verifyAuth(request);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const expense = await Expense.create({ ...body, createdBy: user._id });

        return NextResponse.json({ success: true, data: expense });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
