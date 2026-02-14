import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

/**
 * GET /api/reviews — List all reviews (Admin)
 */
export async function GET(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        if (user.role !== "admin" && user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 20;
        const status = searchParams.get("status");
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;

        const reviews = await Review.find(query)
            .populate("productId", "name slug images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Review.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(reviews)),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/reviews error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
