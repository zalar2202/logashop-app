"use client";

import { Inbox, Search, AlertCircle, FileX } from "lucide-react";

/**
 * EmptyState Component
 * Displays when there's no data to show (empty tables, search results, etc.)
 * 
 * Usage:
 * - <EmptyState /> - Default "No data" message
 * - <EmptyState variant="search" /> - No search results
 * - <EmptyState variant="error" /> - Error state
 * - <EmptyState title="Custom" description="Custom message" />
 * - <EmptyState icon={MyIcon} action={<button>Action</button>} />
 */

export const EmptyState = ({
    variant = "default",
    icon: CustomIcon = null,
    title = null,
    description = null,
    action = null,
    className = "",
}) => {
    // Preset variants
    const variants = {
        default: {
            icon: Inbox,
            title: "No data available",
            description: "There are no items to display at the moment.",
        },
        search: {
            icon: Search,
            title: "No results found",
            description: "Try adjusting your search or filter criteria.",
        },
        error: {
            icon: AlertCircle,
            title: "Something went wrong",
            description: "We couldn't load the data. Please try again.",
        },
        empty: {
            icon: FileX,
            title: "Nothing here yet",
            description: "Get started by creating your first item.",
        },
    };

    const config = variants[variant] || variants.default;
    const Icon = CustomIcon || config.icon;
    const displayTitle = title || config.title;
    const displayDescription = description || config.description;

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            {/* Icon */}
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                    backgroundColor: "var(--color-background-tertiary)",
                }}
            >
                <Icon
                    className="w-8 h-8"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
            </div>

            {/* Title */}
            <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-text-primary)" }}
            >
                {displayTitle}
            </h3>

            {/* Description */}
            <p
                className="text-sm max-w-md mb-6"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {displayDescription}
            </p>

            {/* Optional action */}
            {action && <div>{action}</div>}
        </div>
    );
};

