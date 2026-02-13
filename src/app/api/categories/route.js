import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { slugify } from "@/lib/utils";

/**
 * GET /api/categories
 * List all categories (optionally flat or nested)
 */
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const parentId = searchParams.get("parentId");
        const type = searchParams.get("type"); // 'tree' or 'list'

        let query = { isActive: true };

        // If filtering by parent
        if (parentId === "null") query.parentId = null;
        else if (parentId) query.parentId = parentId;

        const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/categories
 * Create a new category
 */
export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // Auto-generate slug if not provided
        if (!body.slug && body.name) {
            body.slug = slugify(body.name);
        }

        const category = await Category.create(body);
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
        // Handle duplicate slug error
        if (error.code === 11000) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
