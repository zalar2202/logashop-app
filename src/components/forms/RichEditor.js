"use client";

import { useState, useEffect, useRef } from "react";
import { 
    Bold, Italic, Underline, Strikethrough, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Type, List, ListOrdered, Link as LinkIcon,
    Heading1, Heading2, Quote, Palette, Highlighter
} from "lucide-react";

export const RichEditor = ({ 
    label, 
    value, 
    onChange, 
    error, 
    touched, 
    placeholder,
    height = "300px" 
}) => {
    const editorRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    
    // Sync external value to editor content
    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            // 1. Initial Load: If editor is empty but value exists, set it.
            if (value && editor.innerHTML.trim() === "" && value !== "<p><br></p>") {
                editor.innerHTML = value;
                return;
            }
            
            // 2. External Updates: If we are NOT focused (e.g. template selection), update content.
            // We skip this if focused to prevent cursor jumping while typing.
            const isActive = document.activeElement === editor;
            if (!isActive && value !== editor.innerHTML) {
                 editor.innerHTML = value || "";
            }
        }
    }, [value]);

    const handleInput = (e) => {
        const content = e.currentTarget.innerHTML;
        onChange(content);
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        // Force update parent
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        editorRef.current?.focus();
    };

    const ToolbarButton = ({ icon: Icon, command, value, active, title }) => (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent losing focus
                execCommand(command, value);
            }}
            className={`
                p-1.5 rounded-md transition-all
                ${active 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" 
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }
            `}
            title={title}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                    {label}
                </label>
            )}
            
            <div 
                className={`
                    border rounded-lg overflow-hidden transition-all bg-white dark:bg-gray-900
                    ${isFocused ? "ring-2 ring-purple-500/20 border-purple-500" : "border-gray-200 dark:border-gray-700"}
                    ${error && touched ? "border-red-500" : ""}
                `}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
                        <ToolbarButton icon={Bold} command="bold" title="Bold" />
                        <ToolbarButton icon={Italic} command="italic" title="Italic" />
                        <ToolbarButton icon={Underline} command="underline" title="Underline" />
                    </div>

                    <div className="flex items-center gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
                        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
                        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
                        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
                    </div>

                    <div className="flex items-center gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
                        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
                        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
                    </div>

                    <div className="flex items-center gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
                        <ToolbarButton icon={Heading1} command="formatBlock" value="H1" title="Heading 1" />
                        <ToolbarButton icon={Heading2} command="formatBlock" value="H2" title="Heading 2" />
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        {/* Color Pickers */}
                        <div className="flex items-center gap-1 relative group cursor-pointer" title="Text Color">
                            <Palette className="w-4 h-4 text-gray-500" />
                            <input 
                                type="color" 
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                onChange={(e) => execCommand("foreColor", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="p-4 overflow-y-auto focus:outline-none prose dark:prose-invert max-w-none"
                    style={{ 
                        height, 
                        minHeight: "150px",
                        color: "var(--color-text-primary)"
                    }}
                />
            </div>

            {(error && touched) && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};
