import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

/**
 * GET /api/coupons — List coupons (Admin)
 */
export async function GET(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const activeOnly = searchParams.get("active") === "true";

        const query = {};
        if (activeOnly) {
            query.isActive = true;
            query.startDate = { $lte: new Date() };
            query.$or = [{ endDate: null }, { endDate: { $gte: new Date() } }];
        }

        const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(coupons)),
        });
    } catch (error) {
        console.error("GET /api/coupons error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/coupons — Create a coupon (Admin)
 */
export async function POST(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();

        // Validate basic required fields
        if (!body.code || !body.discountType || body.discountValue === undefined) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if coupon code exists
        const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "Coupon code already exists" },
                { status: 400 }
            );
        }

        const coupon = await Coupon.create({
            ...body,
            code: body.code.toUpperCase(),
        });

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(coupon)),
        });
    } catch (error) {
        console.error("POST /api/coupons error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
