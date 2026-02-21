import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tag from "@/models/Tag";

/**
 * GET /api/tags?search=xxx&postType=product
 * List tags for autocomplete/suggestion
 * @param search - Filter by name/slug
 * @param postType - One of: product, post, portfolio (default: product)
 */
export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const postType = searchParams.get("postType") || "product";
        const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 50);

        const validTypes = ["product", "post", "portfolio"];
        const typeFilter = validTypes.includes(postType) ? postType : "product";

        const query = { $or: [{ postType: typeFilter }, { postType: { $exists: false } }] };
        if (search.trim()) {
            const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            query.$and = [
                { $or: [{ postType: typeFilter }, { postType: { $exists: false } }] },
                { $or: [{ name: { $regex: regex } }, { slug: { $regex: regex } }] },
            ];
            delete query.$or;
        }

        const tags = await Tag.find(query).sort({ name: 1 }).limit(limit).lean();

        return NextResponse.json({
            success: true,
            data: tags.map((t) => t.name),
        });
    } catch (error) {
        console.error("GET /api/tags error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
