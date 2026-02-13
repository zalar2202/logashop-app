'use client';

import { Field, ErrorMessage } from 'formik';
import { Calendar } from 'lucide-react';

/**
 * DatePickerField Component
 * 
 * A Formik-integrated date picker using native HTML5 date input
 * with custom styling to match the design system.
 * 
 * @param {object} props
 * @param {string} props.name - Formik field name
 * @param {string} props.label - Field label
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Mark field as required
 * @param {boolean} props.disabled - Disable the field
 * @param {string} props.helperText - Helper text below the field
 * @param {string} props.min - Minimum date (YYYY-MM-DD format)
 * @param {string} props.max - Maximum date (YYYY-MM-DD format)
 */
export function DatePickerField({
    name,
    label,
    placeholder,
    required = false,
    disabled = false,
    helperText,
    min,
    max,
    ...rest
}) {
    return (
        <Field name={name}>
            {({ field, meta }) => {
                const hasError = meta.touched && meta.error;

                return (
                    <div className="mb-4">
                        {/* Label */}
                        {label && (
                            <label
                                htmlFor={name}
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {label}
                                {required && (
                                    <span style={{ color: 'var(--color-error)' }}> *</span>
                                )}
                            </label>
                        )}

                        {/* Date Input Wrapper */}
                        <div className="relative">
                            {/* Calendar Icon */}
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                <Calendar className="w-5 h-5" />
                            </div>

                            {/* Date Input */}
                            <input
                                {...field}
                                {...rest}
                                id={name}
                                type="date"
                                disabled={disabled}
                                min={min}
                                max={max}
                                placeholder={placeholder}
                                className={`
                                    w-full pl-11 pr-4 py-2.5 rounded-lg border
                                    text-sm transition-all duration-200
                                    focus:outline-none focus:ring-2
                                    disabled:cursor-not-allowed disabled:opacity-60
                                    ${hasError ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'}
                                `}
                                style={{
                                    backgroundColor: 'var(--color-background-elevated)',
                                    borderColor: hasError ? 'var(--color-error)' : 'var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>

                        {/* Helper text */}
                        {helperText && !hasError && (
                            <p
                                className="mt-1.5 text-xs"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {helperText}
                            </p>
                        )}

                        {/* Error message */}
                        <ErrorMessage name={name}>
                            {(msg) => (
                                <p
                                    className="mt-1.5 text-xs font-medium"
                                    style={{ color: 'var(--color-error)' }}
                                >
                                    {msg}
                                </p>
                            )}
                        </ErrorMessage>
                    </div>
                );
            }}
        </Field>
    );
}
