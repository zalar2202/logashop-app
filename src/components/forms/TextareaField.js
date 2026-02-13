"use client";

import { Field, ErrorMessage } from "formik";

/**
 * TextareaField Component
 * Multi-line text input with Formik integration
 * 
 * Usage:
 * <TextareaField
 *   name="description"
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={4}
 *   required
 * />
 */

export const TextareaField = ({
    name,
    label,
    placeholder = "",
    rows = 4,
    required = false,
    disabled = false,
    helperText = null,
    className = "",
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

            {/* Textarea Field */}
            <Field name={name}>
                {({ field, meta }) => (
                    <textarea
                        {...field}
                        {...props}
                        id={name}
                        rows={rows}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`
                            w-full px-4 py-2.5 rounded-lg text-sm
                            transition-all duration-200 resize-y
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
                    />
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

