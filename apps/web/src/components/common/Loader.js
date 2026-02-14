"use client";

/**
 * Loader Component
 * Versatile spinner for full-page or inline loading states
 * 
 * Usage:
 * - <Loader /> - Default inline spinner
 * - <Loader size="lg" /> - Larger spinner
 * - <Loader fullPage /> - Full-page overlay with spinner
 * - <Loader text="Loading..." /> - With text below spinner
 */

export const Loader = ({
    size = "md",
    fullPage = false,
    text = null,
    className = "",
}) => {
    const sizes = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-3",
        xl: "w-16 h-16 border-4",
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`${sizes[size]} rounded-full animate-spin`}
                style={{
                    borderColor: "var(--color-border)",
                    borderTopColor: "var(--color-primary)",
                }}
                role="status"
                aria-label="Loading"
            />
            {text && (
                <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {text}
                </p>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
            >
                {spinner}
            </div>
        );
    }

    return spinner;
};

