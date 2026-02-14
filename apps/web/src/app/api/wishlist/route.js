import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

/**
 * GET /api/wishlist — Get the current user's wishlist
 */
export async function GET(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req).catch(() => null);
        const cookieStore = await cookies();
        let sessionId = cookieStore.get("wishlist_session")?.value;

        const query = {};
        if (user) {
            query.userId = user._id;
        } else if (sessionId) {
            query.sessionId = sessionId;
        } else {
            return NextResponse.json({ success: true, data: [] });
        }

        const wishlist = await Wishlist.findOne(query).populate({
            path: "products",
            select: "name slug basePrice salePrice images stockQuantity status productType",
        });

        if (!wishlist) {
            return NextResponse.json({ success: true, data: [] });
        }

        return NextResponse.json({
            success: true,
            data: JSON.parse(JSON.stringify(wishlist.products || [])),
        });
    } catch (error) {
        console.error("GET /api/wishlist error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/wishlist — Toggle a product in the wishlist
 * Body: { productId }
 */
export async function POST(req) {
    try {
        await dbConnect();

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const user = await verifyAuth(req).catch(() => null);
        const cookieStore = await cookies();
        let sessionId = cookieStore.get("wishlist_session")?.value;

        // If no session and no user, create a session
        if (!user && !sessionId) {
            sessionId = crypto.randomBytes(16).toString("hex");
            cookieStore.set("wishlist_session", sessionId, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
            });
        }

        const query = user ? { userId: user._id } : { sessionId };
        let wishlist = await Wishlist.findOne(query);

        if (!wishlist) {
            wishlist = new Wishlist({
                ...query,
                products: [productId],
            });
            await wishlist.save();
            return NextResponse.json({ success: true, action: "added" });
        }

        const index = wishlist.products.indexOf(productId);
        let action = "";

        if (index > -1) {
            // Remove if exists
            wishlist.products.splice(index, 1);
            action = "removed";
        } else {
            // Add if doesn't exist
            wishlist.products.push(productId);
            action = "added";
        }

        await wishlist.save();

        return NextResponse.json({
            success: true,
            action,
            count: wishlist.products.length,
        });
    } catch (error) {
        console.error("POST /api/wishlist error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
