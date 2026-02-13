"use client";

import { Field, ErrorMessage } from "formik";
import { ChevronDown } from "lucide-react";

/**
 * SelectField Component
 * Dropdown select with Formik integration
 * 
 * Usage Option 1 - With options array:
 * <SelectField
 *   name="role"
 *   label="User Role"
 *   options={[
 *     { value: "admin", label: "Administrator" },
 *     { value: "user", label: "Regular User" }
 *   ]}
 *   required
 * />
 * 
 * Usage Option 2 - With children (direct <option> elements):
 * <SelectField name="role" label="User Role" required>
 *   <option value="admin">Administrator</option>
 *   <option value="user">Regular User</option>
 * </SelectField>
 */

export const SelectField = ({
    name,
    label,
    options = [],
    placeholder = "Select an option",
    required = false,
    disabled = false,
    helperText = null,
    className = "",
    children,
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {label}
                    {required && (
                        <span
                            className="ml-1"
                            style={{ color: "var(--color-error)" }}
                        >
                            *
                        </span>
                    )}
                </label>
            )}

            {/* Select Field */}
            <Field name={name}>
                {({ field, meta }) => (
                    <div className="relative">
                        <select
                            {...field}
                            {...props}
                            id={name}
                            disabled={disabled}
                            className={`
                                w-full px-4 py-2.5 pr-10 rounded-lg text-sm
                                transition-all duration-200 appearance-none
                                focus:outline-none focus:ring-2
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                    meta.touched && meta.error
                                        ? "ring-2"
                                        : ""
                                }
                            `}
                            style={{
                                backgroundColor: "var(--color-background-elevated)",
                                color: "var(--color-text-primary)",
                                borderWidth: "1px",
                                borderColor:
                                    meta.touched && meta.error
                                        ? "var(--color-error)"
                                        : "var(--color-border)",
                                ...(meta.touched && meta.error
                                    ? {
                                          "--tw-ring-color": "var(--color-error)",
                                          "--tw-ring-opacity": "0.3",
                                      }
                                    : {
                                          "--tw-ring-color": "var(--color-primary)",
                                          "--tw-ring-opacity": "0.3",
                                      }),
                            }}
                        >
                            {/* Show placeholder if no children and options array is used */}
                            {!children && (
                                <option value="" disabled>
                                    {placeholder}
                                </option>
                            )}
                            
                            {/* Render children if provided (direct <option> elements) */}
                            {children}
                            
                            {/* Render options array if provided and no children */}
                            {!children && options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Chevron Icon */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown
                                className="w-5 h-5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                        </div>
                    </div>
                )}
            </Field>

            {/* Helper Text */}
            {helperText && !(<ErrorMessage name={name} />) && (
                <p
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {helperText}
                </p>
            )}

            {/* Error Message */}
            <ErrorMessage name={name}>
                {(msg) => (
                    <p
                        className="text-xs font-medium flex items-center gap-1"
                        style={{ color: "var(--color-error)" }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {msg}
                    </p>
                )}
            </ErrorMessage>
        </div>
    );
};

