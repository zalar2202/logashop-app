"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentWrapper({ clientSecret, orderId, onSuccess, onCancel, amount }) {
    const appearance = {
        theme: "stripe",
        variables: {
            colorPrimary: "#0ea5e9", // Match your primary color
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="mt-6 p-6 bg-white rounded-xl border border-[var(--color-border)] shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Secure Payment</h2>
            <Elements options={options} stripe={stripePromise}>
                <PaymentForm
                    orderId={orderId}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                    amount={amount}
                />
            </Elements>
        </div>
    );
}
