import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";

/**
 * POST /api/coupons/validate — Validate coupon for checkout
 */
export async function POST(req) {
    try {
        await dbConnect();

        const { code, subtotal } = await req.json();

        if (!code) {
            return NextResponse.json(
                { success: false, error: "Coupon code is required" },
                { status: 400 }
            );
        }

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
        });

        if (!coupon) {
            return NextResponse.json(
                { success: false, error: "Invalid coupon code" },
                { status: 404 }
            );
        }

        const validation = coupon.isValid(subtotal);
        if (!validation.valid) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        // Check user usage limit if authenticated
        const user = await verifyAuth(req).catch(() => null);
        if (user && coupon.userLimit) {
            const usageCount = await Order.countDocuments({
                userId: user._id,
                "discountDetails.code": coupon.code,
                paymentStatus: { $in: ["paid", "pending"] }, // Count pending or paid orders
            });

            if (usageCount >= coupon.userLimit) {
                return NextResponse.json(
                    { success: false, error: "You have already used this coupon" },
                    { status: 400 }
                );
            }
        }

        const discountAmount = coupon.calculateDiscount(subtotal);

        return NextResponse.json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
                description: coupon.description,
            },
        });
    } catch (error) {
        console.error("POST /api/coupons/validate error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
