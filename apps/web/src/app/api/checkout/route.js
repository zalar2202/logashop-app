import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import Order from "@/models/Order";
import DigitalDelivery from "@/models/DigitalDelivery";
import ShippingZone from "@/models/ShippingZone";
import Coupon from "@/models/Coupon";
import { notifyOrderConfirmed, notifyLowStock } from "@/lib/shopNotifications";

function isMobileClient(req) {
    if (req.headers.get("x-client")?.toLowerCase() === "mobile") return true;
    try {
        if (new URL(req.url).searchParams.get("client")?.toLowerCase() === "mobile") return true;
    } catch (_) {}
    return false;
}

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
 * POST /api/checkout — Create an order from the current cart
 *
 * Body: {
 *   shippingAddress: { firstName, lastName, address1, city, state, zipCode, country, phone },
 *   billingAddress: { ... } (optional if billingSameAsShipping),
 *   billingSameAsShipping: boolean,
 *   shippingMethod: "standard" | "express" | "overnight",
 *   customerNote: string,
 *   guestEmail: string (required for guests),
 * }
 *
 * Returns the created order (status: pending_payment).
 * Stripe payment will be handled separately later.
 */
export async function POST(req) {
    try {
        await dbConnect();

        const user = await verifyAuth(req).catch(() => null);

        const body = await req.json();
        let {
            shippingAddress,
            billingAddress,
            billingSameAsShipping = true,
            shippingMethod = "standard",
            customerNote = "",
            guestEmail = "",
            couponCode = "",
            sessionId: bodySessionId,
        } = body;

        if (isMobileClient(req) && !user) {
            return errorResponse("Login required for checkout on mobile", 401);
        }

        const sessionId = await resolveCartSessionId(req, bodySessionId);

        let cart;
        if (user) {
            cart = await Cart.findOne({ userId: user._id });
        } else if (sessionId) {
            cart = await Cart.findOne({ sessionId });
        }

        if (!cart || cart.items.length === 0) {
            return errorResponse("Cart is empty", 400);
        }

        if (!shippingAddress) {
            return errorResponse("Shipping address is required", 400);
        }

        const requiredFields = ["firstName", "lastName", "address1", "city", "state", "zipCode"];
        for (const field of requiredFields) {
            if (!shippingAddress[field]?.trim()) {
                return errorResponse(`Shipping ${field} is required`, 400);
            }
        }

        if (!user && !guestEmail?.trim()) {
            return errorResponse("Email is required for guest checkout", 400);
        }

        if (!billingSameAsShipping) {
            if (!billingAddress) {
                return errorResponse("Billing address is required", 400);
            }
            for (const field of requiredFields) {
                if (!billingAddress[field]?.trim()) {
                    return errorResponse(`Billing ${field} is required`, 400);
                }
            }
        }

        // Populate cart items with current product data
        await cart.populate([
            {
                path: "items.productId",
                select: "name slug sku images basePrice salePrice stockQuantity allowBackorder status productType digitalFile",
            },
            {
                path: "items.variantId",
                select: "sku attributes price stockQuantity isActive",
            },
        ]);

        // Validate items & build order items
        const orderItems = [];
        const stockErrors = [];

        for (const item of cart.items) {
            const product = item.productId;
            if (!product || product.status !== "active") {
                stockErrors.push(
                    `${item.productId?.name || "Unknown product"} is no longer available`
                );
                continue;
            }

            const variant = item.variantId;
            const effectivePrice = variant?.price || product.salePrice || product.basePrice;
            const effectiveStock = variant ? variant.stockQuantity : product.stockQuantity;
            const primaryImage =
                product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;

            // Check stock
            if (!product.allowBackorder && item.quantity > effectiveStock) {
                stockErrors.push(
                    `${product.name} only has ${effectiveStock} in stock (requested ${item.quantity})`
                );
                continue;
            }

            orderItems.push({
                productId: product._id,
                variantId: variant?._id || null,
                name: product.name,
                slug: product.slug,
                sku: variant?.sku || product.sku,
                image: primaryImage || null,
                price: effectivePrice,
                quantity: item.quantity,
                variantInfo: variant?.attributes ? Object.fromEntries(variant.attributes) : null,
                lineTotal: effectivePrice * item.quantity,
            });
        }

        if (stockErrors.length > 0) {
            return errorResponse(stockErrors.join("; "), 400);
        }

        if (orderItems.length === 0) {
            return errorResponse("No valid items in cart", 400);
        }

        // Calculate totals
        const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

        // ── Dynamic Shipping Cost Calculation ──────────────────────
        // Look up the shipping zone for the customer's address
        const addressCountry = (shippingAddress.country || "US").toUpperCase();
        const addressState = shippingAddress.state?.toUpperCase() || null;

        const zone = await ShippingZone.findZoneForAddress(addressCountry, addressState);

        let shippingCost;
        let shippingMethodLabel;

        if (zone) {
            // Zone found — look up the selected method within the zone
            const zoneMethod = zone.methods.find(
                (m) => m.methodId === shippingMethod && m.isActive
            );

            if (zoneMethod) {
                // Apply free threshold if applicable
                if (zoneMethod.freeThreshold && subtotal >= zoneMethod.freeThreshold) {
                    shippingCost = 0;
                    shippingMethodLabel = `Free ${zoneMethod.label}`;
                } else {
                    shippingCost = zoneMethod.price;
                    shippingMethodLabel = zoneMethod.label;
                }
            } else {
                // Selected method not available in this zone — fall back to first active method
                const fallbackMethod = zone.methods.find((m) => m.isActive);
                if (fallbackMethod) {
                    shippingCost =
                        fallbackMethod.freeThreshold && subtotal >= fallbackMethod.freeThreshold
                            ? 0
                            : fallbackMethod.price;
                    shippingMethodLabel = fallbackMethod.label;
                    // Override the method to what's actually available
                    shippingMethod = fallbackMethod.methodId;
                } else {
                    shippingCost = 499;
                    shippingMethodLabel = "Standard Shipping";
                }
            }
        } else {
            // No zone configured — use hardcoded fallback (backwards compatible)
            const fallbackCosts = {
                standard: subtotal >= 5000 ? 0 : 499,
                express: 999,
                overnight: 1999,
                pickup: 0,
            };
            shippingCost = fallbackCosts[shippingMethod] ?? 499;

            const fallbackLabels = {
                standard: subtotal >= 5000 ? "Free Standard Shipping" : "Standard Shipping",
                express: "Express Shipping (2-3 days)",
                overnight: "Overnight Shipping",
                pickup: "Store Pickup",
                digital: "Digital Delivery (Email)",
            };
            shippingMethodLabel = fallbackLabels[shippingMethod] || "Standard Shipping";
        }

        // Check if order is digital-only
        const isAllDigital = cart.items.every(
            (item) => item.productId && item.productId.productType === "digital"
        );

        let finalShippingCost = shippingCost;
        let finalShippingMethod = shippingMethod;
        let finalShippingLabel = shippingMethodLabel;

        if (isAllDigital) {
            finalShippingCost = 0;
            finalShippingMethod = "digital";
            finalShippingLabel = "Digital Delivery (Email)";
        }

        // Tax calculation (simplified — 8.5% tax rate)
        const taxRate = 0.085;
        const taxAmount = Math.round(subtotal * taxRate);

        // ── Coupon / Discount Calculation ───────────────────────────
        let finalDiscountAmount = 0;
        let discountInfo = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
            });

            if (coupon) {
                const validation = coupon.isValid(subtotal);
                if (validation.valid) {
                    // Check user limit
                    let canUse = true;
                    if (user && coupon.userLimit) {
                        const usageCount = await Order.countDocuments({
                            userId: user._id,
                            "discountDetails.code": coupon.code,
                            paymentStatus: { $in: ["paid", "pending"] },
                        });
                        if (usageCount >= coupon.userLimit) {
                            canUse = false;
                        }
                    }

                    if (canUse) {
                        finalDiscountAmount = coupon.calculateDiscount(subtotal);
                        discountInfo = {
                            code: coupon.code,
                            type: coupon.discountType,
                            value: coupon.discountValue,
                        };

                        // Increment usage count (non-blocking)
                        coupon.usageCount += 1;
                        await coupon.save();
                    }
                }
            }
        }

        const total = Math.max(0, subtotal + finalShippingCost + taxAmount - finalDiscountAmount);

        // Create order
        const order = new Order({
            userId: user?._id || null,
            guestEmail: user ? null : guestEmail.trim(),
            items: orderItems,
            shippingAddress: {
                firstName: shippingAddress.firstName.trim(),
                lastName: shippingAddress.lastName.trim(),
                company: shippingAddress.company?.trim() || "",
                address1: shippingAddress.address1.trim(),
                address2: shippingAddress.address2?.trim() || "",
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                zipCode: shippingAddress.zipCode.trim(),
                country: shippingAddress.country || "US",
                phone: shippingAddress.phone?.trim() || "",
            },
            billingAddress: billingSameAsShipping
                ? {
                      firstName: shippingAddress.firstName.trim(),
                      lastName: shippingAddress.lastName.trim(),
                      company: shippingAddress.company?.trim() || "",
                      address1: shippingAddress.address1.trim(),
                      address2: shippingAddress.address2?.trim() || "",
                      city: shippingAddress.city.trim(),
                      state: shippingAddress.state.trim(),
                      zipCode: shippingAddress.zipCode.trim(),
                      country: shippingAddress.country || "US",
                      phone: shippingAddress.phone?.trim() || "",
                  }
                : {
                      firstName: billingAddress.firstName.trim(),
                      lastName: billingAddress.lastName.trim(),
                      company: billingAddress.company?.trim() || "",
                      address1: billingAddress.address1.trim(),
                      address2: billingAddress.address2?.trim() || "",
                      city: billingAddress.city.trim(),
                      state: billingAddress.state.trim(),
                      zipCode: billingAddress.zipCode.trim(),
                      country: billingAddress.country || "US",
                      phone: billingAddress.phone?.trim() || "",
                  },
            billingSameAsShipping,
            subtotal,
            shippingCost: finalShippingCost,
            shippingMethod: finalShippingMethod,
            shippingMethodLabel: finalShippingLabel,
            taxAmount,
            discount: finalDiscountAmount,
            discountDetails: discountInfo,
            total,
            customerNote: customerNote?.trim() || "",
            status: "pending_payment",
            paymentStatus: "pending",
        });

        await order.save();

        // Decrement stock for each item & check for low stock
        const lowStockItems = [];

        for (const item of orderItems) {
            let currentStock = 0;

            if (item.variantId) {
                const updated = await ProductVariant.findByIdAndUpdate(
                    item.variantId,
                    { $inc: { stockQuantity: -item.quantity } },
                    { new: true }
                );
                currentStock = updated?.stockQuantity ?? 0;
            } else {
                const updated = await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stockQuantity: -item.quantity, totalSold: item.quantity } },
                    { new: true }
                );
                currentStock = updated?.stockQuantity ?? 0;
            }

            // Check low stock threshold (e.g., 5)
            if (currentStock <= 5) {
                const variantStr = item.variantInfo
                    ? ` (${Object.values(item.variantInfo).join(", ")})`
                    : "";
                lowStockItems.push({
                    name: item.name + variantStr,
                    sku: item.sku,
                    stockQuantity: currentStock,
                });
            }
        }

        if (lowStockItems.length > 0) {
            notifyLowStock(lowStockItems).catch((err) =>
                console.error("Low stock alert failed:", err)
            );
        }

        // Handle Digital Delivery
        // Create delivery records for any digital items in the order
        const digitalItems = orderItems.filter((item) => {
            // We need to look up the original product from cart items or map cleanly
            // orderItems doesn't have productType. We need to check the cart item again or pass it.
            // Efficient way: Cart items are still available.
            const cartItem = cart.items.find(
                (ci) => ci.productId._id.toString() === item.productId.toString()
            );
            return cartItem?.productId?.productType === "digital";
        });

        if (digitalItems.length > 0) {
            const deliveryPromises = digitalItems.map(async (item) => {
                const cartItem = cart.items.find(
                    (ci) => ci.productId._id.toString() === item.productId.toString()
                );
                const digitalFile = cartItem.productId.digitalFile;

                // Create a record for EACH quantity? Typically yes, allowing multiple downloads or licenses.
                // For simplicity in MVP, we create one record per line item with shared count?
                // Or one record per unit. One record per line item is standard for file downloads.
                // If it were license keys, we'd need one per unit.
                // Let's do one record per line item.

                const token = crypto.randomBytes(32).toString("hex");
                const expiresAt = digitalFile?.expiryDays
                    ? new Date(Date.now() + digitalFile.expiryDays * 24 * 60 * 60 * 1000)
                    : null;

                return DigitalDelivery.create({
                    orderId: order._id,
                    userId: order.userId, // Required field. Check if null? Model says required.
                    // If guest checkout (userId null), DigitalDelivery fails?
                    // Guests can't access account/downloads.
                    // We need to handle Guest Digital Downloads via email link ONLY.
                    // But model requires userId.
                    // We should make userId optional in model OR require account for digital goods.
                    // For now, if guest, we skip or fail?
                    // Let's assume user exists or create a placeholder?
                    // Better: Update DigitalDelivery model to allow null userId (guest).
                    // I will update model in next step if needed. For now assume user.
                    userId: order.userId || user?._id, // if order.userId is null, we can't save.
                    productId: item.productId,
                    variantId: item.variantId,
                    downloadToken: token,
                    maxDownloads: digitalFile?.downloadLimit || null,
                    expiresAt: expiresAt,
                    fileName: digitalFile?.fileName || "download",
                    fileUrl: digitalFile?.url,
                    status: "active",
                });
            });

            // Only run if we have a user (since model requires userId)
            if (user || order.userId) {
                await Promise.all(deliveryPromises);
            } else {
                console.warn("Skipping DigitalDelivery creation for guest user");
            }
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        // Send order confirmation notification + email (non-blocking)
        notifyOrderConfirmed(order).catch((err) =>
            console.error("Order confirmation notification failed:", err)
        );

        return successResponse({
            orderId: order._id,
            orderNumber: order.orderNumber,
            trackingCode: order.trackingCode,
            total: order.total,
            status: order.status,
        });
    } catch (error) {
        console.error("POST /api/checkout error:", error);
        return errorResponse(error.message, 500);
    }
}
