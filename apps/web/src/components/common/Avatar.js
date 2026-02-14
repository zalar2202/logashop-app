'use client';

import { User } from 'lucide-react';

/**
 * Avatar Component
 * 
 * Displays user avatar image with fallback to placeholder
 * Supports different sizes and circular design
 * 
 * @param {object} props
 * @param {string} props.src - Avatar image filename (from database)
 * @param {string} props.alt - Alt text for image
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 */
export function Avatar({ 
    src, 
    alt = 'User avatar', 
    size = 'md', 
    className = '' 
}) {
    // Size classes
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        '2xl': 'w-24 h-24',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
        '2xl': 48,
    };

    // Construct avatar URL if filename exists
    const avatarUrl = src ? `/api/files?category=avatars&filename=${src}` : null;

    return (
        <div
            className={`
                relative rounded-full overflow-hidden flex-shrink-0
                flex items-center justify-center
                ${sizeClasses[size] || sizeClasses.md}
                ${className}
            `}
            style={{
                backgroundColor: 'var(--color-background-elevated)',
                border: '2px solid var(--color-border)',
            }}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            
            {/* Fallback icon (shown if no image or image fails) */}
            <div
                className={`
                    absolute inset-0 flex items-center justify-center
                    ${avatarUrl ? 'hidden' : 'flex'}
                `}
                style={{
                    color: 'var(--color-text-secondary)',
                }}
            >
                <User size={iconSizes[size] || iconSizes.md} />
            </div>
        </div>
    );
}

