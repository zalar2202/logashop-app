"use client";

import { useState } from "react";
import { Field, ErrorMessage, useFormikContext } from "formik";
import { Eye, EyeOff } from "lucide-react";

/**
 * InputField Component
 * Text input that supports local state (controlled) OR Formik integration.
 */
export const InputField = ({
    name,
    label,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
    helperText = null,
    className = "",
    action = null,
    icon = null, // Added support for icons (used in search)
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    // Check if we are controlled (value is passed) or should use Formik
    // If 'value' is passed in props, we treat it as a controlled input (no Formik)
    const isControlled = props.value !== undefined;

    const renderInput = (fieldProps = {}, meta = {}) => {
        const hasError = meta.touched && meta.error;
        // Merge props: local props override field props if both exist (though usually they shouldn't overlap much)
        const inputProps = { ...fieldProps, ...props };

        return (
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none">
                        {icon}
                    </div>
                )}

                <input
                    {...inputProps}
                    id={name}
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full ${icon ? "pl-10" : "px-4"} py-2.5 rounded-lg text-sm
                        transition-all duration-200
                        bg-[var(--color-background-elevated)]
                        text-[var(--color-text-primary)]
                        border
                        focus:outline-none focus:ring-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                            hasError
                                ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/30"
                                : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
                        }
                        ${isPassword ? "pr-11" : ""}
                    `}
                />

                {/* Password Toggle Icon */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-[var(--color-hover)] text-[var(--color-text-secondary)]"
                        tabIndex="-1"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label and Action Header */}
            <div className="flex items-center justify-between">
                {label && (
                    <label
                        htmlFor={name}
                        className="block text-sm font-medium text-[var(--color-text-primary)]"
                    >
                        {label}
                        {required && <span className="ml-1 text-[var(--color-error)]">*</span>}
                    </label>
                )}
                {action && action}
            </div>

            {/* Input Wrapper */}
            <div className="relative">
                {isControlled ? (
                    // Render standard input if controlled
                    renderInput({}, {})
                ) : (
                    // Render Formik Field if not controlled
                    <Field name={name}>{({ field, meta }) => renderInput(field, meta)}</Field>
                )}
            </div>

            {/* Helper Text */}
            {helperText && (
                <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>
            )}

            {/* Error Message - Only for Formik */}
            {!isControlled && (
                <ErrorMessage name={name}>
                    {(msg) => (
                        <p className="text-xs font-medium flex items-center gap-1 text-[var(--color-error)]">
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
            )}
        </div>
    );
};
