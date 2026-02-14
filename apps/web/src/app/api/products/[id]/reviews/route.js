import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * GET /api/products/[id]/reviews — Get reviews for a product
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({
            productId: id,
            status: "approved",
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Review.countDocuments({ productId: id, status: "approved" });

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

/**
 * POST /api/products/[id]/reviews — Create a review
 */
export async function POST(req, { params }) {
    try {
        await dbConnect();

        const user = await verifyAuth(req);
        const { id } = await params;
        const body = await req.json();
        const { rating, comment } = body;

        if (!rating || !comment) {
            return NextResponse.json(
                { success: false, error: "Rating and comment are required" },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ productId: id, userId: user._id });
        if (existingReview) {
            return NextResponse.json(
                { success: false, error: "You have already reviewed this product" },
                { status: 400 }
            );
        }

        // Check if verified purchase (optional but nice)
        const order = await Order.findOne({
            userId: user._id,
            "items.productId": id,
            paymentStatus: "paid",
        }).sort({ createdAt: -1 });

        const review = await Review.create({
            productId: id,
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`.trim() || user.username || "Anonymous",
            rating,
            comment,
            isVerifiedPurchase: !!order,
            orderId: order?._id || null,
            status: "approved", // Set to approved by default for now. Change to 'pending' if moderation is needed.
        });

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(review)),
        });
    } catch (error) {
        console.error("POST /api/reviews error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
