"use client";

import { AlertCircle } from "lucide-react";

/**
 * FormError Component
 * Display form-level errors (not field-specific)
 * 
 * Usage:
 * <FormError message="An error occurred. Please try again." />
 */

export const FormError = ({ message, className = "" }) => {
    if (!message) return null;

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg ${className}`}
            style={{
                backgroundColor: "var(--color-error)",
                opacity: 0.1,
            }}
        >
            <div
                className="p-1 rounded-full flex-shrink-0"
                style={{
                    backgroundColor: "var(--color-error)",
                }}
            >
                <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-error)" }}
                >
                    {message}
                </p>
            </div>
        </div>
    );
};

