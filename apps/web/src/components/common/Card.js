"use client";

/**
 * Card Component
 *
 * Reusable container with consistent styling
 * Supports header, footer, and hover effects
 *
 * @param {ReactNode} children - Card content
 * @param {ReactNode} header - Optional card header
 * @param {ReactNode} footer - Optional card footer
 * @param {boolean} hoverable - Add hover effect
 * @param {boolean} noPadding - Remove default padding
 * @param {string} className - Additional CSS classes
 */
export const Card = ({
    children,
    header,
    footer,
    hoverable = false,
    noPadding = false,
    className = "",
    ...props
}) => {
    const baseStyles =
        "bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg shadow-sm";
    const hoverStyles = hoverable ? "hover:shadow-md transition-shadow duration-200" : "";
    const paddingStyles = noPadding ? "" : "p-6";

    return (
        <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
            {header && (
                <div className="px-6 py-4 border-b border-[var(--color-border)]">{header}</div>
            )}

            <div className={paddingStyles}>{children}</div>

            {footer && (
                <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-secondary)]">
                    {footer}
                </div>
            )}
        </div>
    );
};

/**
 * CardHeader Component
 * Reusable card header with title and optional actions
 */
export const CardHeader = ({ title, subtitle, actions, className = "" }) => {
    return (
        <div className={`flex items-start justify-between ${className}`}>
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
                {subtitle && (
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
};

/**
 * CardFooter Component
 * Reusable card footer with flexible alignment
 */
export const CardFooter = ({ children, align = "right", className = "" }) => {
    const alignStyles = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between",
    };

    return (
        <div className={`flex items-center gap-3 ${alignStyles[align]} ${className}`}>
            {children}
        </div>
    );
};
