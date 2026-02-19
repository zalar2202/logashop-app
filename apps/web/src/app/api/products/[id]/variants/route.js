import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ProductVariant from "@/models/ProductVariant";
import Product from "@/models/Product"; // Ensure populated

/**
 * GET /api/products/[id]/variants
 * List variants for a product
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id: productId } = await params;
        const variants = await ProductVariant.find({ productId, isActive: true }).sort("sku");

        return NextResponse.json({ success: true, data: variants });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/products/[id]/variants
 * Create a new variant
 */
export async function POST(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user || !["admin", "manager"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: productId } = await params;
        const body = await req.json();

        // Ensure sku is unique across ALL variants?
        // Yes, ProductVariant has unique index on sku.

        const variant = await ProductVariant.create({
            ...body,
            productId,
        });

        return NextResponse.json({ success: true, data: variant }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Variant SKU must be unique" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
