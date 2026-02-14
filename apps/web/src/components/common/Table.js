"use client";

/**
 * Table Component
 * A responsive table component with consistent styling
 */
export const Table = ({ children, className = "", ...props }) => {
    return (
        <div className="w-full overflow-auto">
            <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader = ({ children, className = "", ...props }) => {
    return (
        <thead className={`[&_tr]:border-b border-[var(--color-border)] ${className}`} {...props}>
            {children}
        </thead>
    );
};

export const TableBody = ({ children, className = "", ...props }) => {
    return (
        <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
            {children}
        </tbody>
    );
};

export const TableFooter = ({ children, className = "", ...props }) => {
    return (
        <tfoot className={`bg-[var(--color-secondary)] font-medium ${className}`} {...props}>
            {children}
        </tfoot>
    );
};

export const TableRow = ({ children, className = "", ...props }) => {
    return (
        <tr
            className={`border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-secondary)]/50 data-[state=selected]:bg-[var(--color-secondary)] ${className}`}
            {...props}
        >
            {children}
        </tr>
    );
};

export const TableHead = ({ children, className = "", ...props }) => {
    return (
        <th
            className={`h-12 px-4 text-left align-middle font-medium text-[var(--color-text-secondary)] [&:has([role=checkbox])]:pr-0 ${className}`}
            {...props}
        >
            {children}
        </th>
    );
};

export const TableCell = ({ children, className = "", ...props }) => {
    return (
        <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
            {children}
        </td>
    );
};
