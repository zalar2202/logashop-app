import { stripe } from "@/lib/stripe";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyAuth } from "@/lib/auth";

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for the given order. Auth: cookie or Authorization Bearer.
 * Mobile: call with Bearer token; use the returned clientSecret and id with Stripe
 * PaymentSheet (iOS/Android) or native SDK to complete payment.
 */
export async function POST(req) {
    try {
        await dbConnect();

        const { orderId } = await req.json();

        if (!orderId) {
            return errorResponse("Order ID is required", 400);
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return errorResponse("Order not found", 404);
        }

        if (order.paymentStatus === "paid") {
            return errorResponse("Order is already paid", 400);
        }

        const user = await verifyAuth(req).catch(() => null);

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: order.total, // amount in cents
            currency: "usd", // adjust if needed
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                userId: user?._id?.toString() || "guest",
            },
        });

        return successResponse({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        });
    } catch (error) {
        console.error("Stripe Intent Error:", error);
        return errorResponse(error.message, 500);
    }
}
