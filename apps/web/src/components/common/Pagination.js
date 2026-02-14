'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination Component
 * 
 * Pagination controls for tables and lists
 * 
 * @param {number} currentPage - Current page number (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Page change handler
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page
 * @param {function} onItemsPerPageChange - Items per page change handler
 * @param {Array} itemsPerPageOptions - Options for items per page
 * @param {boolean} showFirstLast - Show first/last page buttons
 * @param {boolean} showItemsPerPage - Show items per page selector
 * @param {string} size - Pagination size (sm, md, lg)
 * @param {string} className - Additional CSS classes
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showFirstLast = true,
  showItemsPerPage = true,
  size = 'md',
  className = '',
  ...props
}) => {
  // Calculate page range to display
  const getPageNumbers = () => {
    const delta = size === 'sm' ? 1 : 2; // Number of pages to show on each side
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const buttonSizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  // Calculate item range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* Items info and per page selector */}
      <div className="flex items-center gap-4">
        <span className="text-[var(--color-text-secondary)] whitespace-nowrap">
          Showing <span className="font-medium text-[var(--color-text-primary)]">{startItem}</span> to{' '}
          <span className="font-medium text-[var(--color-text-primary)]">{endItem}</span> of{' '}
          <span className="font-medium text-[var(--color-text-primary)]">{totalItems}</span> results
        </span>

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="items-per-page"
              className="text-[var(--color-text-secondary)] whitespace-nowrap"
            >
              Per page:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-card-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`
              ${buttonSizeStyles[size]}
              flex items-center justify-center rounded-lg
              border border-[var(--color-border)]
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            aria-label="First page"
          >
            <ChevronsLeft size={iconSizes[size]} />
          </button>
        )}

        {/* Previous page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            ${buttonSizeStyles[size]}
            flex items-center justify-center rounded-lg
            border border-[var(--color-border)]
            text-[var(--color-text-secondary)]
            hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
          aria-label="Previous page"
        >
          <ChevronLeft size={iconSizes[size]} />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 text-[var(--color-text-secondary)]"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`
                ${buttonSizeStyles[size]}
                flex items-center justify-center rounded-lg
                border font-medium transition-colors
                ${
                  isActive
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]'
                }
              `}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            ${buttonSizeStyles[size]}
            flex items-center justify-center rounded-lg
            border border-[var(--color-border)]
            text-[var(--color-text-secondary)]
            hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
          aria-label="Next page"
        >
          <ChevronRight size={iconSizes[size]} />
        </button>

        {/* Last page */}
        {showFirstLast && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`
              ${buttonSizeStyles[size]}
              flex items-center justify-center rounded-lg
              border border-[var(--color-border)]
              text-[var(--color-text-secondary)]
              hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            aria-label="Last page"
          >
            <ChevronsRight size={iconSizes[size]} />
          </button>
        )}
      </nav>
    </div>
  );
};

/**
 * SimplePagination Component
 * Simpler pagination with just prev/next buttons
 */
export const SimplePagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          ${sizeStyles[size]}
          flex items-center gap-2 rounded-lg
          border border-[var(--color-border)]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors font-medium
        `}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="text-[var(--color-text-secondary)]">
        Page <span className="font-medium text-[var(--color-text-primary)]">{currentPage}</span> of{' '}
        <span className="font-medium text-[var(--color-text-primary)]">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          ${sizeStyles[size]}
          flex items-center gap-2 rounded-lg
          border border-[var(--color-border)]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-secondary)] hover:text-[var(--color-text-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors font-medium
        `}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

