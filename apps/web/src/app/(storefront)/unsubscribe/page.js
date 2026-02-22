"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";

/**
 * Newsletter unsubscribe page.
 * Public - no auth required.
 * Query: email
 */
function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [status, setStatus] = useState("loading"); // loading | success | error | notfound
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!email) {
            setStatus("notfound");
            return;
        }
        const doUnsubscribe = async () => {
            try {
                const res = await axios.post("/api/subscribers/unsubscribe", {
                    email: email.trim().toLowerCase(),
                });
                if (res.data?.success) {
                    setStatus("success");
                    setMessage("You have been unsubscribed from our newsletter.");
                } else {
                    setStatus("error");
                    setMessage(res.data?.error || "Something went wrong.");
                }
            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.error || "Failed to unsubscribe.");
            }
        };
        doUnsubscribe();
    }, [email]);

    return (
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
            {status === "loading" && (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {status === "notfound" && (
                <div>
                    <h1 className="text-xl font-bold mb-4">Unsubscribe</h1>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        No email provided. Please use the unsubscribe link from your newsletter
                        email.
                    </p>
                    <Link
                        href="/"
                        className="text-[var(--color-primary)] font-medium hover:underline"
                    >
                        Return to Home
                    </Link>
                </div>
            )}
            {(status === "success" || status === "error") && (
                <div>
                    <h1 className="text-xl font-bold mb-4">
                        {status === "success" ? "Unsubscribed" : "Error"}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
                    <Link
                        href="/"
                        className="text-[var(--color-primary)] font-medium hover:underline"
                    >
                        Return to Home
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-16 max-w-md text-center">
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            }
        >
            <UnsubscribeContent />
        </Suspense>
    );
}
