import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Coupon from "@/models/Coupon";
import Review from "@/models/Review";

export async function GET(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const [
            totalOrders,
            totalRevenueData,
            totalProducts,
            totalUsers,
            activeCoupons,
            pendingReviews,
            recentOrders,
            topProducts,
        ] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([
                { $match: { status: { $ne: "cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Product.countDocuments(),
            User.countDocuments({ role: "user" }),
            Coupon.countDocuments({ isActive: true }),
            Review.countDocuments({ status: "pending" }),
            Order.find().sort({ createdAt: -1 }).limit(5).populate("userId", "name email").lean(),
            Product.find()
                .sort({ totalSold: -1 })
                .limit(5)
                .select("name totalSold basePrice")
                .lean(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                counts: {
                    orders: totalOrders,
                    revenue: totalRevenueData[0]?.total || 0,
                    products: totalProducts,
                    users: totalUsers,
                    activeCoupons,
                    pendingReviews,
                },
                recentOrders: JSON.parse(JSON.stringify(recentOrders)),
                topProducts: JSON.parse(JSON.stringify(topProducts)),
            },
        });
    } catch (error) {
        console.error("GET /api/stats/admin error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
