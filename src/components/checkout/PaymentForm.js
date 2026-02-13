"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Lock, AlertCircle } from "lucide-react";

export default function PaymentForm({ orderId, onSuccess, onCancel, amount }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/checkout/confirmation?order_id=${orderId}`,
            },
            // If you want to handle the success manually without redirecting:
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
                toast.error(error.message);
            } else {
                const msg = "An unexpected error occurred.";
                setMessage(msg);
                toast.error(msg);
            }
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            toast.success("Payment successful!");
            onSuccess(paymentIntent);
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {message}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                >
                    {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <>
                            <Lock size={20} />
                            Pay Now — ${(amount / 100).toFixed(2)}
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full py-2 text-sm text-[var(--color-text-secondary)] hover:text-red-500 transition"
                >
                    Change Shipping or Edit Cart
                </button>
            </div>

            <p className="text-[10px] text-center text-[var(--color-text-secondary)] uppercase tracking-widest mt-4">
                Payments secured by Stripe. No card details stored.
            </p>
        </form>
    );
}
