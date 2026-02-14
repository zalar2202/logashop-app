import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

/**
 * GET /api/coupons/[id] — Get single coupon
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const coupon = await Coupon.findById(id).lean();

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(coupon)),
        });
    } catch (error) {
        console.error("GET /api/coupons/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/coupons/[id] — Update coupon
 */
export async function PUT(req, { params }) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();

        if (body.code) body.code = body.code.toUpperCase();

        const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(coupon)),
        });
    } catch (error) {
        console.error("PUT /api/coupons/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/coupons/[id] — Delete coupon
 */
export async function DELETE(req, { params }) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Coupon deleted successfully",
        });
    } catch (error) {
        console.error("DELETE /api/coupons/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
