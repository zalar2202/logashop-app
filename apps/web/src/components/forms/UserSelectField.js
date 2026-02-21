"use client";

import { useRef, useState, useEffect } from "react";
import { Field, ErrorMessage } from "formik";
import { ChevronDown } from "lucide-react";

/**
 * Searchable single-user select for use with user lists.
 * Filters by name or email as you type.
 */
export function UserSelectField({
    name,
    label,
    users = [],
    disabled = false,
    placeholder = "Search by name or email...",
    className = "",
}) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const filtered = search.trim()
        ? users.filter(
              (u) =>
                  (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
                  (u.email || "").toLowerCase().includes(search.toLowerCase())
          )
        : users;

    const maxDisplay = 50;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {label}
                    <span className="ml-1" style={{ color: "var(--color-error)" }}>*</span>
                </label>
            )}

            <Field name={name}>
                {({ field, form, meta }) => {
                    const idStr = field.value ? String(field.value) : "";
                    const selectedUser = users.find((u) => String(u._id) === idStr);
                    const displayValue = selectedUser
                        ? `${selectedUser.name} (${selectedUser.email})`
                        : "";

                    const handleSelect = (user) => {
                        const value = user._id ? String(user._id) : "";
                        form.setFieldValue(name, value);
                        form.setFieldTouched(name, true);
                        setSearch("");
                        setOpen(false);
                        // Re-validate after state commits - Formik validation can run before update propagates
                        setTimeout(() => {
                            form.validateField(name);
                        }, 0);
                    };

                    const handleClear = (e) => {
                        e.stopPropagation();
                        form.setFieldValue(name, "");
                        setSearch("");
                        setOpen(true);
                    };

                    return (
                        <div ref={containerRef} className="relative">
                            <div
                                onClick={() => !disabled && setOpen(!open)}
                                className={`
                                    w-full px-4 py-2.5 pr-10 rounded-lg text-sm
                                    flex items-center justify-between gap-2
                                    cursor-pointer transition-all
                                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                                style={{
                                    backgroundColor: "var(--color-background-elevated)",
                                    borderWidth: "1px",
                                    borderColor:
                                        meta.touched && meta.error
                                            ? "var(--color-error)"
                                            : "var(--color-border)",
                                }}
                            >
                                {open ? (
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onFocus={() => setOpen(true)}
                                        placeholder={placeholder}
                                        className="flex-1 min-w-0 bg-transparent outline-none"
                                        style={{ color: "var(--color-text-primary)" }}
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        className={`flex-1 truncate ${!displayValue ? "opacity-60" : ""}`}
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {displayValue || placeholder}
                                    </span>
                                )}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {field.value && !open && (
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="text-xs px-2 py-0.5 rounded hover:bg-black/10"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                </div>
                            </div>

                            {open && (
                                <ul
                                    className="absolute z-50 left-0 right-0 mt-1 max-h-[240px] overflow-y-auto rounded-lg border shadow-lg py-1"
                                    style={{
                                        backgroundColor: "var(--color-background-elevated)",
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    {filtered.length === 0 ? (
                                        <li
                                            className="px-4 py-3 text-sm"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            No users found
                                        </li>
                                    ) : (
                                        filtered.slice(0, maxDisplay).map((u) => (
                                            <li
                                                key={u._id}
                                                onClick={() => handleSelect(u)}
                                                className={`px-4 py-2.5 cursor-pointer text-sm hover:bg-black/5 ${
                                                    idStr === String(u._id) ? "bg-[var(--color-primary)]/10" : ""
                                                }`}
                                                style={{ color: "var(--color-text-primary)" }}
                                            >
                                                {u.name} ({u.email})
                                            </li>
                                        ))
                                    )}
                                    {filtered.length > maxDisplay && (
                                        <li
                                            className="px-4 py-2 text-xs"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Type to narrow down ({filtered.length} more)
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    );
                }}
            </Field>

            <ErrorMessage name={name}>
                {(msg) => (
                    <p
                        className="text-xs font-medium flex items-center gap-1"
                        style={{ color: "var(--color-error)" }}
                    >
                        {msg}
                    </p>
                )}
            </ErrorMessage>
        </div>
    );
}
