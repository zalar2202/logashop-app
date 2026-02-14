"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
    Maximize2,
    Minimize2,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { MediaPicker } from "@/components/common/MediaPicker";

/**
 * Rich Text Editor Component
 * 
 * A WYSIWYG editor for blog posts with:
 * - Text formatting (bold, italic, underline, etc.)
 * - Headings
 * - Lists (ordered and unordered)
 * - Links and images
 * - Code blocks and quotes
 * - Fullscreen mode
 */

const ToolbarButton = ({ icon, title, onClick, active = false, disabled = false }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-all duration-200 ${
            active
                ? "bg-[var(--color-primary)] text-white"
                : "hover:bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
        {icon}
    </button>
);

const ToolbarDivider = () => (
    <div className="w-px h-6 bg-[var(--color-border)] mx-1" />
);

export function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Start writing your content...",
    minHeight = 400,
    onImageUpload,
}) {
    const editorRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [activeFormats, setActiveFormats] = useState({});
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [savedRange, setSavedRange] = useState(null);

    // Initialize editor with value
    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    // Track active formats on selection change
    const updateActiveFormats = useCallback(() => {
        const formats = {
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            strikeThrough: document.queryCommandState("strikeThrough"),
            insertUnorderedList: document.queryCommandState("insertUnorderedList"),
            insertOrderedList: document.queryCommandState("insertOrderedList"),
        };
        setActiveFormats(formats);
    }, []);

    // Handle content changes
    const handleInput = useCallback(() => {
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
        updateActiveFormats();
    }, [onChange, updateActiveFormats]);

    // Execute command
    const execCommand = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    // Format with tag
    const formatBlock = useCallback((tag) => {
        document.execCommand("formatBlock", false, tag);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    // Verify selection and prepare for link insertion
    const handleLinkClick = useCallback(() => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            setSavedRange(range);
            
            // Check if we are inside a link
            let node = selection.anchorNode;
            // If anchorNode is text, look at parent
            if (node.nodeType === 3) node = node.parentNode;
            
            // Traverse up to find 'A'
            let linkNode = null;
            let curr = node;
            while (curr && curr !== editorRef.current) {
                if (curr.nodeName === 'A') {
                    linkNode = curr;
                    break;
                }
                curr = curr.parentNode;
            }
            
            if (linkNode) {
                setLinkUrl(linkNode.getAttribute('href'));
                setLinkText(linkNode.textContent);
                
                // Expand selection to whole link so insertHTML replaces it
                const newRange = document.createRange();
                newRange.selectNode(linkNode);
                selection.removeAllRanges();
                selection.addRange(newRange);
                setSavedRange(newRange);
            } else {
                setLinkUrl("");
                setLinkText(selection.toString());
            }
        }
        setShowLinkModal(true);
    }, []);

    // Insert link
    const insertLink = useCallback(() => {
        if (!linkUrl) return;
        
        // Restore selection
        if (savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }

        const text = linkText || linkUrl;
        const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        execCommand("insertHTML", html);
        setShowLinkModal(false);
        setLinkUrl("");
        setLinkText("");
        setSavedRange(null);
    }, [linkUrl, linkText, savedRange, execCommand]);

    // Insert image
    const insertImage = useCallback(() => {
        if (!imageUrl) return;
        const html = `<img src="${imageUrl}" alt="${imageAlt}" class="blog-content-image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
        execCommand("insertHTML", html);
        setShowImageModal(false);
        setImageUrl("");
        setImageAlt("");
    }, [imageUrl, imageAlt, execCommand]);

    // Handle image selection from library
    const handleMediaSelect = (media) => {
        const html = `<img src="${media.url}" alt="${imageAlt || media.alt || media.originalName}" class="blog-content-image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
        execCommand("insertHTML", html);
        setShowImageModal(false);
        setImageAlt("");
    };

    return (
        <div
            className={`rich-editor-container rounded-xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] overflow-hidden transition-all duration-300 ${
                isFullscreen
                    ? "fixed inset-4 z-50 flex flex-col"
                    : ""
            }`}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]">
                {/* History */}
                <ToolbarButton
                    icon={<Undo size={18} />}
                    title="Undo"
                    onClick={() => execCommand("undo")}
                />
                <ToolbarButton
                    icon={<Redo size={18} />}
                    title="Redo"
                    onClick={() => execCommand("redo")}
                />

                <ToolbarDivider />

                {/* Text Formatting */}
                <ToolbarButton
                    icon={<Bold size={18} />}
                    title="Bold (Ctrl+B)"
                    onClick={() => execCommand("bold")}
                    active={activeFormats.bold}
                />
                <ToolbarButton
                    icon={<Italic size={18} />}
                    title="Italic (Ctrl+I)"
                    onClick={() => execCommand("italic")}
                    active={activeFormats.italic}
                />
                <ToolbarButton
                    icon={<Underline size={18} />}
                    title="Underline (Ctrl+U)"
                    onClick={() => execCommand("underline")}
                    active={activeFormats.underline}
                />
                <ToolbarButton
                    icon={<Strikethrough size={18} />}
                    title="Strikethrough"
                    onClick={() => execCommand("strikeThrough")}
                    active={activeFormats.strikeThrough}
                />

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton
                    icon={<Heading1 size={18} />}
                    title="Heading 1"
                    onClick={() => formatBlock("h2")}
                />
                <ToolbarButton
                    icon={<Heading2 size={18} />}
                    title="Heading 2"
                    onClick={() => formatBlock("h3")}
                />
                <ToolbarButton
                    icon={<Heading3 size={18} />}
                    title="Heading 3"
                    onClick={() => formatBlock("h4")}
                />

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton
                    icon={<List size={18} />}
                    title="Bullet List"
                    onClick={() => execCommand("insertUnorderedList")}
                    active={activeFormats.insertUnorderedList}
                />
                <ToolbarButton
                    icon={<ListOrdered size={18} />}
                    title="Numbered List"
                    onClick={() => execCommand("insertOrderedList")}
                    active={activeFormats.insertOrderedList}
                />

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton
                    icon={<AlignLeft size={18} />}
                    title="Align Left"
                    onClick={() => execCommand("justifyLeft")}
                />
                <ToolbarButton
                    icon={<AlignCenter size={18} />}
                    title="Align Center"
                    onClick={() => execCommand("justifyCenter")}
                />
                <ToolbarButton
                    icon={<AlignRight size={18} />}
                    title="Align Right"
                    onClick={() => execCommand("justifyRight")}
                />

                <ToolbarDivider />

                {/* Special Elements */}
                <ToolbarButton
                    icon={<Quote size={18} />}
                    title="Quote"
                    onClick={() => formatBlock("blockquote")}
                />
                <ToolbarButton
                    icon={<Code size={18} />}
                    title="Code Block"
                    onClick={() => formatBlock("pre")}
                />

                <ToolbarDivider />

                {/* Media */}
                <ToolbarButton
                    icon={<LinkIcon size={18} />}
                    title="Insert/Edit Link"
                    onClick={handleLinkClick}
                />
                <ToolbarButton
                    icon={<ImageIcon size={18} />}
                    title="Insert Image"
                    onClick={() => setShowImageModal(true)}
                />

                <div className="flex-1" />

                {/* Fullscreen Toggle */}
                <ToolbarButton
                    icon={isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                />
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onSelect={updateActiveFormats}
                onClick={updateActiveFormats}
                onKeyUp={updateActiveFormats}
                className="rich-editor-content p-4 outline-none overflow-y-auto prose prose-lg max-w-none"
                style={{
                    minHeight: isFullscreen ? undefined : minHeight,
                    flex: isFullscreen ? 1 : undefined,
                    color: "var(--color-text-primary)",
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            {/* Link Modal */}
            <Modal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                title="Insert Link"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Text (optional)
                        </label>
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Link text"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setShowLinkModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={insertLink} disabled={!linkUrl}>
                            Insert Link
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Image Modal */}
            <Modal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                title="Insert Image"
            >
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setShowImageModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => setShowMediaPicker(true)}>
                        Open Media Library
                    </Button>
                </div>
            </Modal>

            <MediaPicker 
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
                allowedType="image"
                title="Select Content Image"
            />


            {/* Editor Styles */}
            <style jsx global>{`
                .rich-editor-content:empty:before {
                    content: attr(data-placeholder);
                    color: var(--color-text-tertiary);
                    pointer-events: none;
                }

                .rich-editor-content h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: 1.5rem 0 0.75rem;
                    color: var(--color-text-primary);
                }

                .rich-editor-content h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 1.25rem 0 0.5rem;
                    color: var(--color-text-primary);
                }

                .rich-editor-content h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 1rem 0 0.5rem;
                    color: var(--color-text-primary);
                }

                .rich-editor-content p {
                    margin: 0.75rem 0;
                    line-height: 1.7;
                }

                .rich-editor-content a {
                    color: var(--color-primary);
                    text-decoration: underline;
                }

                .rich-editor-content blockquote {
                    border-left: 4px solid var(--color-primary);
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    color: var(--color-text-secondary);
                    background: var(--color-background-secondary);
                    padding: 1rem;
                    border-radius: 0 8px 8px 0;
                }

                .rich-editor-content pre {
                    background: var(--color-background-tertiary);
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: var(--font-geist-mono), monospace;
                    font-size: 0.9rem;
                    margin: 1rem 0;
                }

                .rich-editor-content ul,
                .rich-editor-content ol {
                    padding-left: 1.5rem;
                    margin: 0.75rem 0;
                }

                .rich-editor-content li {
                    margin: 0.25rem 0;
                }

                .rich-editor-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    );
}

export default RichTextEditor;
