"use client";

/**
 * Badge Component
 * 
 * Status indicator badges with different variants
 * Supports success, error, warning, info, and neutral variants
 * 
 * @param {string} variant - Badge style variant
 * @param {string} size - Badge size (sm, md, lg)
 * @param {boolean} dot - Show colored dot indicator
 * @param {ReactNode} children - Badge content
 * @param {string} className - Additional CSS classes
 */
export const Badge = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  // Variant styles using CSS custom properties
  const variantStyles = {
    success: 'bg-[var(--color-success-surface)] text-[var(--color-success-foreground)]',
    error: 'bg-[var(--color-error-surface)] text-[var(--color-error-foreground)]',
    danger: 'bg-[var(--color-error-surface)] text-[var(--color-error-foreground)]',
    warning: 'bg-[var(--color-warning-surface)] text-[var(--color-warning-foreground)]',
    info: 'bg-[var(--color-info-surface)] text-[var(--color-info-foreground)]',
    neutral: 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]',
    primary: 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  // Dot styles
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const dotColors = {
    success: 'bg-[var(--color-success)]',
    error: 'bg-[var(--color-error)]',
    danger: 'bg-[var(--color-error)]',
    warning: 'bg-[var(--color-warning)]',
    info: 'bg-[var(--color-info)]',
    neutral: 'bg-[var(--color-text-secondary)]',
    primary: 'bg-white',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`rounded-full ${dotSizes[size]} ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

/**
 * StatusBadge Component
 * Predefined status badges for common use cases
 */
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'neutral', label: 'Inactive', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    approved: { variant: 'success', label: 'Approved', dot: false },
    rejected: { variant: 'error', label: 'Rejected', dot: false },
    cancelled: { variant: 'error', label: 'Cancelled', dot: false },
    completed: { variant: 'success', label: 'Completed', dot: false },
    processing: { variant: 'info', label: 'Processing', dot: true },
    draft: { variant: 'neutral', label: 'Draft', dot: false },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    variant: 'neutral',
    label: status,
    dot: false,
  };

  return (
    <Badge variant={config.variant} dot={config.dot} {...props}>
      {config.label}
    </Badge>
  );
};

