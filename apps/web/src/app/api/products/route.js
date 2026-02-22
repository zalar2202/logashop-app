import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category"; // Ensure registered
import Tag from "@/models/Tag";
import { slugify } from "@/lib/utils";

/** Normalize and sync tags to Tag collection */
async function normalizeAndSyncTags(tagArray) {
    if (!tagArray || !Array.isArray(tagArray)) return [];
    const normalized = tagArray
        .map((t) => (typeof t === "string" ? Tag.normalizeName(t) : ""))
        .filter(Boolean);
    const unique = [...new Set(normalized)];
    await Tag.syncTags(unique, "product");
    return unique;
}

/**
 * GET /api/products
 * List products with filters (category, search, status, sort)
 */
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const category = searchParams.get("category");
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const sortParam = searchParams.get("sort") || "newest";

        // Additional storefront filters
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const featured = searchParams.get("featured");
        const sale = searchParams.get("sale");

        let query = {};

        // Category filter
        if (category) query.categoryId = category;

        // Status filter
        if (status) query.status = status;

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
            ];
        }

        // Price range filter (prices stored in cents)
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = parseFloat(minPrice) * 100;
            if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice) * 100;
        }

        // Featured filter
        if (featured === "true") {
            query.isFeatured = true;
        }

        // On sale filter
        if (sale === "true") {
            query.salePrice = { $gt: 0, $exists: true };
            query.$expr = { $lt: ["$salePrice", "$basePrice"] };
        }

        // Sort options
        let sort = { createdAt: -1 }; // default: newest
        switch (sortParam) {
            case "newest":
                sort = { createdAt: -1 };
                break;
            case "oldest":
                sort = { createdAt: 1 };
                break;
            case "price-asc":
                sort = { basePrice: 1 };
                break;
            case "price-desc":
                sort = { basePrice: -1 };
                break;
            case "name-asc":
                sort = { name: 1 };
                break;
            case "name-desc":
                sort = { name: -1 };
                break;
            case "popular":
                sort = { totalSold: -1 };
                break;
            default:
                // Handle legacy sort format like "-createdAt"
                if (sortParam.startsWith("-")) {
                    sort = { [sortParam.slice(1)]: -1 };
                } else {
                    sort = { [sortParam]: 1 };
                }
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("categoryId", "name slug");

        const total = await Product.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(req) {
    try {
        const user = await verifyAuth(req);
        if (!user || !["admin", "manager", "vendor"].includes(user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        // Auto-generate slug
        if (!body.slug && body.name) {
            body.slug = slugify(body.name);
        }

        // Ensure unique SKU
        if (body.sku) {
            const existingSku = await Product.exists({ sku: body.sku });
            if (existingSku)
                return NextResponse.json({ error: "SKU already exists" }, { status: 400 });
        }

        // Attach vendorId (if multi-vendor ready)
        // If strict single-store, this might just be the admin ID or null
        body.vendorId = user.id;

        // Normalize tags and sync to Tag collection
        if (body.tags?.length) {
            body.tags = await normalizeAndSyncTags(body.tags);
        }

        const product = await Product.create(body);

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ error: `${field} already exists` }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
