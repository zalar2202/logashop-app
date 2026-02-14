'use client';

import { Field, ErrorMessage } from 'formik';
import { Clock } from 'lucide-react';

/**
 * TimePickerField Component
 * 
 * A Formik-integrated time picker using native HTML5 time input
 * with custom styling to match the design system.
 * 
 * @param {object} props
 * @param {string} props.name - Formik field name
 * @param {string} props.label - Field label
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Mark field as required
 * @param {boolean} props.disabled - Disable the field
 * @param {string} props.helperText - Helper text below the field
 * @param {string} props.min - Minimum time (HH:MM format)
 * @param {string} props.max - Maximum time (HH:MM format)
 * @param {string} props.step - Time interval in seconds (e.g., 300 for 5-minute intervals)
 */
export function TimePickerField({
    name,
    label,
    placeholder,
    required = false,
    disabled = false,
    helperText,
    min,
    max,
    step,
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

                        {/* Time Input Wrapper */}
                        <div className="relative">
                            {/* Clock Icon */}
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                <Clock className="w-5 h-5" />
                            </div>

                            {/* Time Input */}
                            <input
                                {...field}
                                {...rest}
                                id={name}
                                type="time"
                                disabled={disabled}
                                min={min}
                                max={max}
                                step={step}
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

