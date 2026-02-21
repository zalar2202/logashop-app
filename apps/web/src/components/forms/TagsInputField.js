"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Field, ErrorMessage } from "formik";
import { Plus, X } from "lucide-react";
import axios from "axios";

/** Normalize tag to match backend (lowercase, spaces to hyphens) */
function normalizeTag(name) {
    if (!name || typeof name !== "string") return "";
    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * TagsInputField - Tag input with add button and removable chips
 * Integrates with Formik, stores value as string array
 */
export function TagsInputField({
    name,
    label,
    placeholder = "Type a tag and press Enter or click Add",
    helperText = null,
    className = "",
    postType = "product", // One of: product, post, portfolio
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-[var(--color-text-primary)]"
                >
                    {label}
                </label>
            )}
            <Field name={name}>
                {({ field, form }) => {
                    const tags = Array.isArray(field.value) ? field.value : [];
                    const rawValue = typeof field.value === "string" && field.value
                        ? field.value.split(",").map((t) => t.trim()).filter(Boolean)
                        : tags;

                    const setTags = (newTags) => {
                        form.setFieldValue(name, newTags);
                    };

                    const addTag = (tagText) => {
                        const normalized = normalizeTag(tagText);
                        if (!normalized) return;
                        if (rawValue.includes(normalized)) return;
                        setTags([...rawValue, normalized]);
                        form.setFieldTouched(name, true);
                    };

                    const removeTag = (index) => {
                        setTags(rawValue.filter((_, i) => i !== index));
                        form.setFieldTouched(name, true);
                    };

                    return (
                        <TagInputUI
                            tags={rawValue}
                            onAdd={addTag}
                            onRemove={removeTag}
                            placeholder={placeholder}
                            name={name}
                            postType={postType}
                        />
                    );
                }}
            </Field>
            <ErrorMessage name={name}>
                {(msg) => (
                    <p className="text-xs font-medium text-[var(--color-error)] mt-1">{msg}</p>
                )}
            </ErrorMessage>
            {helperText && (
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{helperText}</p>
            )}
        </div>
    );
}

/**
 * Tag input with autocomplete suggestions from /api/tags
 */
function TagInputUI({ tags = [], onAdd, onRemove, placeholder, name, postType = "product" }) {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const suggRef = useRef(null);

    // Fetch suggestions when input value changes (debounced)
    const fetchSuggestions = useCallback(async (search) => {
        const term = search.trim();
        if (!term) {
            setSuggestions([]);
            return;
        }
        try {
            const { data } = await axios.get(`/api/tags?search=${encodeURIComponent(term)}&postType=${encodeURIComponent(postType)}&limit=10`);
            const list = data?.data || [];
            setSuggestions(list.filter((s) => !tags.includes(s)));
            setHighlightedIndex(-1);
        } catch {
            setSuggestions([]);
        }
    }, [tags, postType]);

    useEffect(() => {
        const timer = setTimeout(() => fetchSuggestions(inputValue), 200);
        return () => clearTimeout(timer);
    }, [inputValue, fetchSuggestions]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                onAdd(suggestions[highlightedIndex]);
                setInputValue("");
                setSuggestions([]);
                setShowSuggestions(false);
            } else {
                const value = e.target.value;
                if (value.trim()) {
                    onAdd(value);
                    setInputValue("");
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    const handleAddClick = () => {
        const value = inputRef.current?.value?.trim() || "";
        if (value) {
            onAdd(value);
            setInputValue("");
            setSuggestions([]);
        }
        inputRef.current?.focus();
    };

    const handleSelectSuggestion = (suggestion) => {
        onAdd(suggestion);
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggRef.current && !suggRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={suggRef} className="relative">
            <div
                className="flex flex-wrap gap-2 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)] min-h-[44px] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)] transition-all"
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, index) => (
                <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(index);
                        }}
                        className="p-0.5 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
                        aria-label={`Remove ${tag}`}
                    >
                        <X size={14} />
                    </button>
                </span>
            ))}
            <div className="flex flex-1 min-w-[120px] gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => inputValue.trim() && setShowSuggestions(true)}
                    placeholder={tags.length === 0 ? placeholder : "Add another or select from list..."}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={handleAddClick}
                    className="flex-shrink-0 p-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                    title="Add tag"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
            {showSuggestions && suggestions.length > 0 && (
                <ul
                    className="absolute left-0 right-0 mt-1 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)] shadow-lg z-50 max-h-48 overflow-y-auto"
                    role="listbox"
                >
                    {suggestions.map((s, i) => (
                        <li
                            key={s}
                            role="option"
                            aria-selected={i === highlightedIndex}
                            className={`px-3 py-2 text-sm cursor-pointer ${
                                i === highlightedIndex
                                    ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                                    : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                            }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSuggestion(s);
                            }}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
