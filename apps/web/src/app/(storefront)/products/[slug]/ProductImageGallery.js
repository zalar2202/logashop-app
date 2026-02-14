"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ProductImageGallery({ images = [], productName }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Sort images to show primary first
    const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    const currentImage = sortedImages[selectedIndex];

    const goTo = (index) => {
        if (index < 0) index = sortedImages.length - 1;
        if (index >= sortedImages.length) index = 0;
        setSelectedIndex(index);
    };

    if (sortedImages.length === 0) {
        return (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                No Image Available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div
                className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
            >
                <img
                    src={currentImage?.url}
                    alt={currentImage?.alt || productName}
                    className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? "scale-150" : ""}`}
                />

                {/* Navigation Arrows */}
                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goTo(selectedIndex - 1);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goTo(selectedIndex + 1);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Zoom Icon */}
                <div className="absolute bottom-4 right-4 p-2 bg-white/80 rounded-full">
                    <ZoomIn size={20} className="text-gray-600" />
                </div>
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`
                                flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition
                                ${
                                    index === selectedIndex
                                        ? "border-[var(--color-primary)]"
                                        : "border-transparent hover:border-gray-300"
                                }
                            `}
                        >
                            <img
                                src={image.url}
                                alt={image.alt || `${productName} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
