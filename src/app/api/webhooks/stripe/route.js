import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import ProductVariant from "@/models/ProductVariant";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { headers } from "next/headers";

export async function POST(req) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn(
                "STRIPE_WEBHOOK_SECRET is missing. Skipping verification (Not recommended for production)."
            );
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        console.log(`Payment successful for order: ${orderId}`);

        await dbConnect();

        const order = await Order.findById(orderId);

        if (order && order.paymentStatus !== "paid") {
            // Update order status
            order.paymentStatus = "paid";
            order.status = "processing"; // Move from pending_payment to processing
            order.paymentDetails = {
                transactionId: paymentIntent.id,
                method: paymentIntent.payment_method_types[0],
                amountPaid: paymentIntent.amount_received,
            };

            await order.save();

            // Logic for inventory might already be in checkout/route.js
            // But if it's not, we should do it here to be safe if checkout script just "reserves" it.
            // Currently checkout/route.js decrements stock immediately.
        }
    }

    return NextResponse.json({ received: true });
}
