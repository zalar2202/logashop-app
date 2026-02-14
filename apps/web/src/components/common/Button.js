"use client";

import { Loader2 } from "lucide-react";

/**
 * Button Component
 *
 * Reusable button with multiple variants and loading states
 * Supports primary, secondary, danger, success, and ghost variants
 *
 * @param {string} variant - Button style variant
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {boolean} fullWidth - Make button full width
 * @param {string} type - HTML button type
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
export const Button = ({
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    type = "button",
    onClick,
    children,
    icon = null,
    className = "",
    ...props
}) => {
    // Base styles
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variant styles using CSS custom properties
    const variantStyles = {
        primary:
            "bg-[var(--color-primary)] text-white hover:opacity-90 focus:ring-[var(--color-primary)]",
        secondary:
            "bg-[var(--color-secondary)] text-[var(--color-text-primary)] hover:opacity-90 focus:ring-[var(--color-secondary)] border border-[var(--color-border)]",
        danger: "bg-[var(--color-error)] text-white hover:opacity-90 focus:ring-[var(--color-error)]",
        success:
            "bg-[var(--color-success)] text-white hover:opacity-90 focus:ring-[var(--color-success)]",
        ghost: "text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)] focus:ring-[var(--color-border)]",
        outline:
            "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus:ring-[var(--color-primary)]",
    };

    // Size styles
    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-4 py-2 text-base gap-2",
        lg: "px-6 py-3 text-lg gap-2.5",
    };

    // Width styles
    const widthStyles = fullWidth ? "w-full" : "";

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
            {...props}
        >
            {loading && (
                <Loader2
                    className="animate-spin"
                    size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
                />
            )}
            {!loading && icon && icon}
            {children}
        </button>
    );
};
