"use client";

/**
 * Checkbox component for controlled usage (name, checked, onChange).
 * For form integration use CheckboxField from @/components/forms.
 */
export function Checkbox({ name, checked, onChange, disabled = false, className = "", ...props }) {
    return (
        <input
            type="checkbox"
            name={name}
            checked={!!checked}
            onChange={(e) => onChange?.(e)}
            disabled={disabled}
            className={`w-4 h-4 rounded cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            style={{
                accentColor: "var(--color-primary)",
                borderWidth: "1px",
                borderColor: "var(--color-border)",
            }}
            {...props}
        />
    );
}
