"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";

/**
 * Newsletter subscription form.
 * Used on homepage and footer.
 * @param {Object} props
 * @param {"homepage" | "footer"} props.variant - Styling variant
 */
export default function NewsletterSubscribe({ variant = "homepage" }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
            toast.error("Please enter your email address");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/api/subscribers", {
                email: trimmed,
                source: variant,
            });
            if (res.data?.success) {
                toast.success(res.data?.data?.message || "Thanks for subscribing!");
                setEmail("");
            } else {
                toast.error(res.data?.error || "Something went wrong");
            }
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to subscribe. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (variant === "footer") {
        return (
            <div>
                <h4 className="font-bold mb-4">Stay Updated</h4>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    Subscribe to our newsletter for exclusive deals.
                </p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        placeholder="Your email"
                        aria-label="Email address for newsletter"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-white disabled:opacity-70"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-dark)] transition disabled:opacity-70"
                    >
                        {loading ? "..." : "Subscribe"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <section className="py-16 bg-[var(--color-background-elevated)]">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay in the Loop</h2>
                <p className="text-[var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                    Subscribe to our newsletter and get 10% off your first order, plus exclusive
                    access to sales and new products.
                </p>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
                >
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-full border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-70"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-full hover:bg-[var(--color-primary-dark)] transition disabled:opacity-70"
                    >
                        {loading ? "Subscribing..." : "Subscribe"}
                    </button>
                </form>
            </div>
        </section>
    );
}
