"use client";

import { Field, ErrorMessage } from "formik";

/**
 * CheckboxField Component
 * Checkbox input with Formik integration
 *
 * Usage:
 * <CheckboxField
 *   name="acceptTerms"
 *   label="I accept the terms and conditions"
 *   required
 * />
 */

export const CheckboxField = ({
    name,
    label,
    description,
    required = false,
    disabled = false,
    className = "",
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {/* Checkbox with Label */}
            <Field name={name}>
                {({ field, meta }) => (
                    <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                            <input
                                {...field}
                                {...props}
                                id={name}
                                type="checkbox"
                                checked={field.value}
                                disabled={disabled}
                                className={`
                                    w-4 h-4 rounded cursor-pointer
                                    transition-all duration-200
                                    focus:outline-none focus:ring-2
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                style={{
                                    accentColor: "var(--color-primary)",
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
                        </div>

                        <div className="flex-1">
                            {label && (
                                <label
                                    htmlFor={name}
                                    className="text-sm cursor-pointer block"
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
                            {description && (
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Field>

            {/* Error Message */}
            <ErrorMessage name={name}>
                {(msg) => (
                    <p
                        className="text-xs font-medium flex items-center gap-1 ml-7"
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
