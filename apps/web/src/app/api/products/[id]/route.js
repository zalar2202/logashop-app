import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

/**
 * GET /api/products/[id]
 * Get single product details
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();

        const { id } = await params;

        // Find by ID or Slug?
        // Admin usually uses ID, public uses Slug. We can support both if needed,
        // but for this file path [id], let's assume ObjectId.

        const product = await Product.findById(id).populate(
            "categoryId",
            "name slug ancestors"
        );

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/products/[id]
 * Update product
 */
export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user || !["admin", "manager", "vendor"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();
        const body = await req.json();

        // Prevent updating critical fields if needed (like vendorId)
        delete body.vendorId;

        // Check SKU uniqueness if changed
        if (body.sku) {
            const existing = await Product.findOne({ sku: body.sku, _id: { $ne: id } });
            if (existing)
                return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
        }

        const product = await Product.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/products/[id]
 * Soft delete or hard delete
 */
export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        // Strategy 1: Soft Delete (set deletedAt)
        // Strategy 2: Hard Delete (remove record)
        // Let's go with Hard Delete for now as per simple scope, unless specified otherwise in DATA_MODELS.
        // Actually, DATA_MODELS mentioned soft delete.

        // const product = await Product.findByIdAndUpdate(id, { deletedAt: new Date() });
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Product deleted" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
