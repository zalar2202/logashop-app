import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * GET /api/orders/[id] — Get single order by ID
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const user = await verifyAuth(req).catch(() => null);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const query = { _id: id };

        // Non-admin users can only see their own orders
        if (user.role !== "admin") {
            query.userId = user._id;
        }

        const order = await Order.findOne(query).lean();

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(order)),
        });
    } catch (error) {
        console.error("GET /api/orders/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
/**
 * PUT /api/orders/[id] — Update order (admin only)
 */
export async function PUT(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const user = await verifyAuth(req);

        if (user.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Only admins can update orders" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { status, trackingNumber, paymentStatus } = body;

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Apply updates
        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(order)),
        });
    } catch (error) {
        console.error("PUT /api/orders/[id] error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
