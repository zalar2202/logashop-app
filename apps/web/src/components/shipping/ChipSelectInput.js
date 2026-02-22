"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";

/**
 * ChipSelectInput - Tag-style input with chips and autocomplete dropdown.
 * Compact UX suitable for Country/State selection in shipping zones.
 *
 * @param {Object} props
 * @param {{ id: string, label: string }[]} props.options - Available options to choose from
 * @param {string[]} props.value - Selected ids (e.g. country codes, state codes)
 * @param {(id: string) => void} props.onAdd
 * @param {(id: string) => void} props.onRemove
 * @param {string} props.placeholder
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {(opt: { id: string, label: string }) => string} [props.getChipLabel] - Optional: custom label for chips (default: opt.label)
 */
export function ChipSelectInput({
    options = [],
    value = [],
    onAdd,
    onRemove,
    placeholder = "Type to search and add...",
    disabled = false,
    loading = false,
    getChipLabel,
}) {
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const selectedSet = useMemo(() => new Set(value), [value]);

    const filteredOptions = useMemo(() => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return options.slice(0, 15);
        return options
            .filter((opt) => !selectedSet.has(opt.id))
            .filter(
                (opt) =>
                    opt.label.toLowerCase().includes(q) ||
                    opt.id.toLowerCase().includes(q)
            )
            .slice(0, 15);
    }, [options, inputValue, selectedSet]);

    const displayItems = useMemo(() => {
        return value.map((id) => {
            const opt = options.find((o) => o.id === id);
            const label = getChipLabel && opt ? getChipLabel(opt) : opt?.label || id;
            return { id, label };
        });
    }, [value, options, getChipLabel]);

    const handleSelect = (opt) => {
        onAdd(opt.id);
        setInputValue("");
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                handleSelect(filteredOptions[highlightedIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) =>
                i < filteredOptions.length - 1 ? i + 1 : i
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => (i > 0 ? i - 1 : -1));
        } else if (e.key === "Escape") {
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <div
                className={`flex flex-wrap gap-2 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] min-h-[44px] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)] transition-all ${
                    disabled ? "opacity-60 pointer-events-none" : "cursor-text"
                }`}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                {displayItems.map(({ id, label }) => (
                    <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                    >
                        {label}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(id);
                            }}
                            className="p-0.5 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
                            aria-label={`Remove ${label}`}
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
                <div
                    className="flex flex-1 min-w-[120px] gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() =>
                            filteredOptions.length > 0 && setShowDropdown(true)
                        }
                        placeholder={
                            displayItems.length === 0
                                ? placeholder
                                : "Add another or select from list..."
                        }
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
                        autoComplete="off"
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const first = filteredOptions[0];
                            if (first) handleSelect(first);
                        }}
                        className="flex-shrink-0 p-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                        title="Add first match"
                        disabled={disabled || filteredOptions.length === 0}
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {loading && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                    Loading...
                </p>
            )}

            {showDropdown && filteredOptions.length > 0 && !loading && (
                <ul
                    className="absolute left-0 right-0 mt-1 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)] shadow-lg z-50 max-h-48 overflow-y-auto"
                    role="listbox"
                >
                    {filteredOptions.map((opt, i) => (
                        <li
                            key={opt.id}
                            role="option"
                            aria-selected={i === highlightedIndex}
                            className={`px-3 py-2 text-sm cursor-pointer ${
                                i === highlightedIndex
                                    ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                                    : "text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]"
                            }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(opt);
                            }}
                            onMouseEnter={() => setHighlightedIndex(i)}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
