"use client";

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    TableHead,
} from "@/components/common/Table";

import { TableHead } from "@/components/common/Table";

const alignMap = { left: "text-left", center: "text-center", right: "text-right" };

export function TableHeaderCell({ align, sortable, className = "", ...props }) {
    const alignClass = align ? alignMap[align] || "text-left" : "text-left";
    return (
        <TableHead
            className={`${alignClass} ${sortable ? "cursor-pointer select-none" : ""} ${className}`}
            {...props}
        />
    );
}

export function TableActions({
    onView,
    onEdit,
    onDelete,
    compact = false,
    actions = ["view", "edit", "delete"],
    className = "",
}) {
    const size = compact ? "h-8 w-8" : "h-9 w-9";
    const iconSize = compact ? 14 : 16;
    return (
        <div className={`flex items-center justify-end gap-1 ${className}`}>
            {actions.includes("view") && onView && (
                <button
                    type="button"
                    onClick={onView}
                    className={`${size} inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-secondary)] transition-colors`}
                    title="View"
                    aria-label="View"
                >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            )}
            {actions.includes("edit") && onEdit && (
                <button
                    type="button"
                    onClick={onEdit}
                    className={`${size} inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-secondary)] transition-colors`}
                    title="Edit"
                    aria-label="Edit"
                >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
            )}
            {actions.includes("delete") && onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className={`${size} inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-transparent hover:bg-red-50 hover:border-red-200 transition-colors text-red-600`}
                    title="Delete"
                    aria-label="Delete"
                >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            )}
        </div>
    );
}
