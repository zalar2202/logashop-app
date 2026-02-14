import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

/**
 * GET /api/categories/[id]
 * Get single category
 */
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const category = await Category.findById(params.id).populate("parentId", "name");

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/categories/[id]
 * Update category
 */
export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        const category = await Category.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/categories/[id]
 * Delete category (check for children/products first?)
 */
export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Prevent deletion if it has children
        const hasChildren = await Category.exists({ parentId: params.id });
        if (hasChildren) {
            return NextResponse.json(
                {
                    error: "Cannot delete category with subcategories. Move or delete them first.",
                },
                { status: 400 }
            );
        }

        const category = await Category.findByIdAndDelete(params.id);

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Category deleted" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
