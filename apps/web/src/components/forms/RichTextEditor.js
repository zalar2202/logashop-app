"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to avoid SSR issues with Quill (requires document/window)
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)] animate-pulse flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
            Loading editor...
        </div>
    ),
});

// Minimal toolbar for product descriptions: formatting, lists, links
const QUILL_MODULES = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

/**
 * RichTextEditor - Quill-based WYSIWYG editor for product descriptions
 * @param {Object} props
 * @param {string} props.value - HTML content
 * @param {Function} props.onChange - (html: string) => void
 * @param {string} [props.placeholder] - Placeholder text
 * @param {number} [props.minHeight] - Minimum height in px
 */
export function RichTextEditor({ value = "", onChange, placeholder = "Write content here...", minHeight = 200 }) {
    const modules = useMemo(() => QUILL_MODULES, []);

    return (
        <div className="rich-text-editor-wrapper [&_.ql-container]:min-h-[180px] [&_.ql-editor]:min-h-[180px]">
            <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                style={{ minHeight }}
                className="product-description-editor"
            />
        </div>
    );
}

export default RichTextEditor;
