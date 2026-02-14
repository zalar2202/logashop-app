import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";

/**
 * Resolve cart sessionId: cookie → X-Cart-Session header → body (for POST/PUT).
 */
async function resolveCartSessionId(req, bodySessionId = null) {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get("cart_session")?.value;
    if (fromCookie) return fromCookie;
    const fromHeader = req.headers.get("x-cart-session")?.trim();
    if (fromHeader) return fromHeader;
    if (bodySessionId && String(bodySessionId).trim()) return String(bodySessionId).trim();
    return null;
}

/**
 * Helper: Get or create cart for user/guest.
 * sessionId: cookie → X-Cart-Session header → bodySessionId (for POST/PUT).
 */
async function getOrCreateCart(req, bodySessionId = null) {
    const user = await verifyAuth(req).catch(() => null);
    let sessionId = await resolveCartSessionId(req, bodySessionId);

    let cart = null;

    if (user) {
        // Logged-in user — find by userId
        cart = await Cart.findOne({ userId: user._id });

        // If user just logged in and had a guest cart, merge it
        if (!cart && sessionId) {
            const guestCart = await Cart.findOne({ sessionId });
            if (guestCart) {
                guestCart.userId = user._id;
                guestCart.sessionId = null;
                await guestCart.save();
                cart = guestCart;
            }
        }

        if (!cart) {
            cart = new Cart({ userId: user._id, items: [] });
            await cart.save();
        }
    } else {
        // Guest user — find by sessionId
        if (sessionId) {
            cart = await Cart.findOne({ sessionId });
        }

        if (!cart) {
            sessionId = crypto.randomUUID();
            cart = new Cart({ sessionId, items: [] });
            await cart.save();
        }
    }

    return { cart, sessionId, user };
}

/**
 * Helper: Get price for a product/variant
 */
async function getProductPrice(productId, variantId) {
    const product = await Product.findById(productId);
    if (!product || product.status !== "active") return null;

    let price =
        product.salePrice && product.salePrice < product.basePrice
            ? product.salePrice
            : product.basePrice;

    let stock = product.stockQuantity;
    let allowBackorder = product.allowBackorder;

    if (variantId) {
        const variant = await ProductVariant.findById(variantId);
        if (variant && variant.isActive) {
            if (variant.price) price = variant.price;
            stock = variant.stockQuantity;
        }
    }

    return { price, stock, allowBackorder, product };
}

/**
 * GET /api/cart
 * Get the current cart with populated product data
 */
export async function GET(req) {
    try {
        await dbConnect();
        const { cart, sessionId } = await getOrCreateCart(req);

        // Populate cart items with product details
        await cart.populate([
            {
                path: "items.productId",
                select: "name slug images basePrice salePrice stockQuantity allowBackorder status",
            },
            {
                path: "items.variantId",
                select: "sku attributes price stockQuantity isActive",
            },
        ]);

        // Filter out items with deleted/inactive products
        const validItems = cart.items.filter(
            (item) => item.productId && item.productId.status === "active"
        );

        // Format response
        const formattedItems = validItems.map((item) => {
            const product = item.productId;
            const variant = item.variantId;
            const primaryImage =
                product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;

            const effectivePrice = variant?.price || product.salePrice || product.basePrice;
            const effectiveStock = variant ? variant.stockQuantity : product.stockQuantity;

            return {
                _id: item._id,
                productId: product._id,
                variantId: variant?._id || null,
                name: product.name,
                slug: product.slug,
                image: primaryImage,
                price: effectivePrice,
                originalPrice: product.basePrice,
                quantity: item.quantity,
                maxQuantity: effectiveStock,
                allowBackorder: product.allowBackorder,
                variantInfo: variant?.attributes ? Object.fromEntries(variant.attributes) : null,
                lineTotal: effectivePrice * item.quantity,
            };
        });

        const subtotal = formattedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const itemCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

        const data = {
            items: formattedItems,
            subtotal,
            itemCount,
            cartId: cart._id,
        };
        if (sessionId && !req.headers.get("authorization")) {
            data.sessionId = sessionId;
        }
        const response = NextResponse.json({ success: true, data });

        // Set session cookie for guests (web)
        if (sessionId && !req.headers.get("authorization")) {
            response.cookies.set("cart_session", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
            });
        }

        return response;
    } catch (error) {
        console.error("GET /api/cart error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * POST /api/cart
 * Add an item to the cart
 * Body: { productId, variantId?, quantity? }
 */
export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { productId, variantId = null, quantity = 1, sessionId: bodySessionId } = body;

        if (!productId) {
            return errorResponse("productId is required", 400);
        }

        const priceInfo = await getProductPrice(productId, variantId);
        if (!priceInfo) {
            return errorResponse("Product not found or unavailable", 404);
        }

        if (priceInfo.stock <= 0 && !priceInfo.allowBackorder) {
            return errorResponse("Product is out of stock", 400);
        }

        const { cart, sessionId } = await getOrCreateCart(req, bodySessionId);

        // Check if item already exists in cart
        const existingIndex = cart.items.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                (item.variantId?.toString() || null) === variantId
        );

        if (existingIndex > -1) {
            // Update quantity
            const newQty = cart.items[existingIndex].quantity + quantity;
            if (newQty > priceInfo.stock && !priceInfo.allowBackorder) {
                return errorResponse(`Only ${priceInfo.stock} available`, 400);
            }
            cart.items[existingIndex].quantity = Math.min(newQty, 99);
            cart.items[existingIndex].priceSnapshot = priceInfo.price;
        } else {
            // Add new item
            cart.items.push({
                productId,
                variantId,
                quantity: Math.min(quantity, 99),
                priceSnapshot: priceInfo.price,
            });
        }

        await cart.save();

        const responseData = {
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
        };
        if (sessionId && !req.headers.get("authorization")) {
            responseData.sessionId = sessionId;
        }
        const response = NextResponse.json({
            success: true,
            message: "Item added to cart",
            data: responseData,
        });

        // Set session cookie for guests (web)
        if (sessionId) {
            response.cookies.set("cart_session", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
            });
        }

        return response;
    } catch (error) {
        console.error("POST /api/cart error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * PUT /api/cart
 * Update item quantity
 * Body: { itemId, quantity }
 */
export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { itemId, quantity, sessionId: bodySessionId } = body;

        if (!itemId || quantity === undefined) {
            return errorResponse("itemId and quantity are required", 400);
        }

        const { cart } = await getOrCreateCart(req, bodySessionId);

        const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return errorResponse("Item not found in cart", 404);
        }

        if (quantity <= 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        } else {
            // Validate stock
            const item = cart.items[itemIndex];
            const priceInfo = await getProductPrice(item.productId, item.variantId);

            if (priceInfo) {
                if (quantity > priceInfo.stock && !priceInfo.allowBackorder) {
                    return errorResponse(`Only ${priceInfo.stock} available`, 400);
                }
                cart.items[itemIndex].quantity = Math.min(quantity, 99);
                cart.items[itemIndex].priceSnapshot = priceInfo.price;
            }
        }

        await cart.save();

        return NextResponse.json({
            success: true,
            message: quantity <= 0 ? "Item removed from cart" : "Cart updated",
            data: {
                itemCount: cart.itemCount,
                subtotal: cart.subtotal,
            },
        });
    } catch (error) {
        console.error("PUT /api/cart error:", error);
        return errorResponse(error.message, 500);
    }
}

/**
 * DELETE /api/cart
 * Remove an item or clear the cart
 * Query: ?itemId=xxx or ?clear=true
 */
export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get("itemId");
        const clearAll = searchParams.get("clear") === "true";

        const { cart } = await getOrCreateCart(req);

        if (clearAll) {
            cart.items = [];
        } else if (itemId) {
            cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        } else {
            return errorResponse("itemId or clear=true is required", 400);
        }

        await cart.save();

        return NextResponse.json({
            success: true,
            message: clearAll ? "Cart cleared" : "Item removed",
            data: {
                itemCount: cart.itemCount,
                subtotal: cart.subtotal,
            },
        });
    } catch (error) {
        console.error("DELETE /api/cart error:", error);
        return errorResponse(error.message, 500);
    }
}
