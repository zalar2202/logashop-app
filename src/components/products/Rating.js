"use client";

import { Star, StarHalf } from "lucide-react";

export default function Rating({ value = 0, count, showLabel = true, size = 16, className = "" }) {
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
                ))}
                {hasHalfStar && (
                    <div className="relative">
                        <Star size={size} className="text-gray-200 fill-gray-200" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star size={size} className="fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={size} className="text-gray-200 fill-gray-200" />
                ))}
            </div>
            {showLabel && (
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {value.toFixed(1)} {count !== undefined && `(${count})`}
                </span>
            )}
        </div>
    );
}
