'use client';

import { useState } from 'react';

/**
 * Tabs Component
 * 
 * Tab navigation component with controlled or uncontrolled mode
 * 
 * @param {Array} tabs - Array of tab objects [{id, label, content, icon, badge, disabled}]
 * @param {string} activeTab - Currently active tab ID (controlled)
 * @param {function} onChange - Tab change handler (controlled)
 * @param {string} defaultTab - Default active tab (uncontrolled)
 * @param {string} variant - Tab style variant (line, pills, enclosed)
 * @param {string} size - Tab size (sm, md, lg)
 * @param {boolean} fullWidth - Make tabs full width
 * @param {string} className - Additional CSS classes
 */
export const Tabs = ({
  tabs = [],
  activeTab: controlledActiveTab,
  onChange,
  defaultTab,
  variant = 'line',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Internal state for uncontrolled mode
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id
  );

  // Use controlled or uncontrolled state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onChange || setInternalActiveTab;

  const handleTabClick = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;
    setActiveTab(tabId);
  };

  // Base styles
  const containerStyles = 'flex flex-col gap-4';
  const tabListStyles = fullWidth ? 'flex w-full' : 'inline-flex';

  // Variant styles
  const variantStyles = {
    line: {
      container: 'border-b border-[var(--color-border)]',
      tab: 'px-4 py-2 border-b-2 border-transparent hover:border-[var(--color-border)] transition-colors',
      activeTab: 'border-[var(--color-primary)] text-[var(--color-primary)]',
      inactiveTab: 'text-[var(--color-text-secondary)]',
    },
    pills: {
      container: 'gap-2',
      tab: 'px-4 py-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors',
      activeTab: 'bg-[var(--color-primary)] text-white',
      inactiveTab: 'text-[var(--color-text-secondary)]',
    },
    enclosed: {
      container: 'border-b border-[var(--color-border)] gap-1',
      tab: 'px-4 py-2 border border-transparent rounded-t-lg hover:border-[var(--color-border)] transition-colors',
      activeTab: 'border-[var(--color-border)] border-b-[var(--color-card-bg)] bg-[var(--color-card-bg)] text-[var(--color-text-primary)] -mb-px',
      inactiveTab: 'text-[var(--color-text-secondary)]',
    },
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-lg gap-2.5',
  };

  const currentVariant = variantStyles[variant];
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={`${containerStyles} ${className}`} {...props}>
      {/* Tab List */}
      <div
        className={`${tabListStyles} ${currentVariant.container}`}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              onClick={() => handleTabClick(tab.id)}
              disabled={isDisabled}
              className={`
                ${currentVariant.tab}
                ${isActive ? currentVariant.activeTab : currentVariant.inactiveTab}
                ${sizeStyles[size]}
                ${fullWidth ? 'flex-1' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                font-medium whitespace-nowrap
                inline-flex items-center justify-center
              `}
            >
              {tab.icon && (
                <span className="mr-2">
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[var(--color-primary)] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {currentTab?.content && (
        <div role="tabpanel" className="animate-in fade-in duration-200">
          {currentTab.content}
        </div>
      )}
    </div>
  );
};

/**
 * TabPanel Component
 * Wrapper for tab content with lazy loading support
 */
export const TabPanel = ({ children, className = '' }) => {
  return (
    <div className={`animate-in fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
};

