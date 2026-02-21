/**
 * POST /api/manager/db/remove
 * Remove all documents from a specific collection (manager only).
 * Body: { collection: "categories"|"products"|"tags"|"shippingzones"|"users" }
 * For "users": only deletes documents with role "user" (keeps admin/manager).
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import Tag from "@/models/Tag";
import ShippingZone from "@/models/ShippingZone";
import User from "@/models/User";

const COLLECTION_MAP = {
    categories: { Model: Category, label: "Categories" },
    products: { Model: Product, label: "Products", alsoDelete: ProductVariant },
    tags: { Model: Tag, label: "Tags" },
    shippingzones: { Model: ShippingZone, label: "Shipping Zones" },
    users: { Model: User, label: "Users (user role only)", query: { role: "user" } },
};

export async function POST(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Manager access required" }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const collection = body?.collection?.toLowerCase();

        if (!collection || !COLLECTION_MAP[collection]) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid collection. Use one of: ${Object.keys(COLLECTION_MAP).join(", ")}`,
                },
                { status: 400 }
            );
        }

        await dbConnect();

        const { Model, label, alsoDelete, query } = COLLECTION_MAP[collection];
        let deleted = 0;

        const filter = query || {};
        const result = await Model.deleteMany(filter);
        deleted += result.deletedCount;

        if (alsoDelete) {
            const variantResult = await alsoDelete.deleteMany({});
            deleted += variantResult.deletedCount;
        }

        return NextResponse.json({
            success: true,
            message: `Removed ${label}`,
            deleted,
        });
    } catch (error) {
        console.error("[remove API]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Remove failed" },
            { status: 500 }
        );
    }
}
