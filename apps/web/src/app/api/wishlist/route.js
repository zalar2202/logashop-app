import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

/**
 * Resolve wishlist sessionId: cookie → X-Wishlist-Session header (for mobile).
 */
async function resolveWishlistSessionId(req) {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get("wishlist_session")?.value;
    if (fromCookie) return fromCookie;
    const fromHeader = req.headers.get("x-wishlist-session")?.trim();
    if (fromHeader) return fromHeader;
    return null;
}

/**
 * GET /api/wishlist — Get the current user's or guest's wishlist
 */
export async function GET(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req).catch(() => null);
        let sessionId = await resolveWishlistSessionId(req);

        const query = {};
        if (user) {
            query.userId = user._id;
            // Merge guest wishlist into user on first fetch after login
            if (sessionId) {
                const guestWishlist = await Wishlist.findOne({ sessionId });
                if (guestWishlist && guestWishlist.products?.length > 0) {
                    let userWishlist = await Wishlist.findOne({ userId: user._id });
                    if (!userWishlist) {
                        userWishlist = new Wishlist({ userId: user._id, products: [] });
                    }
                    const existing = new Set(userWishlist.products.map((p) => String(p)));
                    for (const p of guestWishlist.products) {
                        if (!existing.has(String(p))) {
                            userWishlist.products.push(p);
                            existing.add(String(p));
                        }
                    }
                    await userWishlist.save();
                    await Wishlist.findByIdAndDelete(guestWishlist._id);
                }
                sessionId = null;
            }
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

        const response = {
            success: true,
            data: JSON.parse(JSON.stringify(wishlist.products || [])),
        };
        if (!user && sessionId) {
            response.sessionId = sessionId;
        }
        return NextResponse.json(response);
    } catch (error) {
        console.error("GET /api/wishlist error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/wishlist — Toggle a product in the wishlist
 * Body: { productId, sessionId? } — sessionId for mobile guest wishlist
 */
export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();
        const { productId, sessionId: bodySessionId } = body;
        if (!productId) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const user = await verifyAuth(req).catch(() => null);
        const cookieStore = await cookies();
        let sessionId = cookieStore.get("wishlist_session")?.value;
        if (!sessionId) {
            sessionId = req.headers.get("x-wishlist-session")?.trim() || bodySessionId;
        }

        // If no session and no user, create a session (guest)
        if (!user && !sessionId) {
            sessionId = crypto.randomBytes(16).toString("hex");
            const isMobile = req.headers.get("x-client")?.toLowerCase() === "mobile";
            if (!isMobile) {
                cookieStore.set("wishlist_session", sessionId, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    httpOnly: true,
                });
            }
        }

        const query = user ? { userId: user._id } : { sessionId };
        let wishlist = await Wishlist.findOne(query);

        if (!wishlist) {
            wishlist = new Wishlist({
                ...query,
                products: [productId],
            });
            await wishlist.save();
            const res = { success: true, action: "added", count: 1 };
            if (!user && sessionId && req.headers.get("x-client")?.toLowerCase() === "mobile") {
                res.sessionId = sessionId;
            }
            return NextResponse.json(res);
        }

        const index = wishlist.products.indexOf(productId);
        let action = "";

        if (index > -1) {
            wishlist.products.splice(index, 1);
            action = "removed";
        } else {
            wishlist.products.push(productId);
            action = "added";
        }

        await wishlist.save();

        const res = {
            success: true,
            action,
            count: wishlist.products.length,
        };
        if (!user && sessionId && req.headers.get("x-client")?.toLowerCase() === "mobile") {
            res.sessionId = sessionId;
        }
        return NextResponse.json(res);
    } catch (error) {
        console.error("POST /api/wishlist error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
