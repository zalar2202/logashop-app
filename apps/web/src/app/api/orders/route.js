import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * GET /api/orders — Get orders
 *
 * Query params:
 *   - orderNumber: fetch specific order by number
 *   - trackingCode: fetch specific order by tracking code (guest)
 *   - page, limit: pagination for order listing
 *   - status: filter by status
 */
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const orderNumber = searchParams.get("orderNumber");
        const trackingCode = searchParams.get("trackingCode");
        const id = searchParams.get("id");

        // Fetch single order by orderNumber, trackingCode or id
        if (orderNumber || trackingCode || id) {
            const query = {};
            if (id) query._id = id;
            if (orderNumber) query.orderNumber = orderNumber;
            if (trackingCode) query.trackingCode = trackingCode;

            const user = await verifyAuth(req).catch(() => null);

            // If authenticated, also verify ownership (unless admin)
            if (user && user.role !== "admin") {
                query.userId = user._id;
            }

            const order = await Order.findOne(query).lean();

            if (!order) {
                return NextResponse.json(
                    { success: false, error: "Order not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: JSON.parse(JSON.stringify(order)),
            });
        }

        // List orders (requires auth)
        const user = await verifyAuth(req).catch(() => null);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const query = {};

        // Admin sees all orders, user sees only their own
        if (user.role !== "admin") {
            query.userId = user._id;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: "i" } },
                { guestEmail: { $regex: search, $options: "i" } },
                { "shippingAddress.firstName": { $regex: search, $options: "i" } },
                { "shippingAddress.lastName": { $regex: search, $options: "i" } },
            ];
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(orders)),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/orders error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
