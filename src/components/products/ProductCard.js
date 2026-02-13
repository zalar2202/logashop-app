"use client";

import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";

export default function ProductCard({ product, viewMode = "grid" }) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
    const displayPrice = hasDiscount ? product.salePrice : product.basePrice;
    const primaryImage =
        product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;

    const isWishlisted = isInWishlist(product._id);

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product._id);
    };

    if (viewMode === "list") {
        return (
            <div className="group relative flex bg-white rounded-xl overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 w-full">
                <Link href={`/products/${product.slug}`} className="flex flex-1">
                    {/* Image */}
                    <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-100">
                        {primaryImage ? (
                            <img
                                src={primaryImage}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                        {hasDiscount && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                -{Math.round((1 - product.salePrice / product.basePrice) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
                                {product.categoryId?.name || "Uncategorized"}
                            </p>
                            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition text-lg mb-2">
                                {product.name}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                                {product.shortDescription || product.description?.substring(0, 120)}
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-[var(--color-primary)]">
                                    ${(displayPrice / 100).toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-[var(--color-text-secondary)] line-through">
                                        ${(product.basePrice / 100).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {product.averageRating >= 0 && product.reviewCount > 0 && (
                                <div className="flex items-center gap-1 text-sm text-yellow-500">
                                    <Star size={14} fill="currentColor" />
                                    <span className="font-bold">
                                        {product.averageRating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                <button
                    onClick={handleWishlist}
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 z-10 ${
                        isWishlisted
                            ? "bg-red-50 text-red-500"
                            : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        size={18}
                        fill={isWishlisted ? "currentColor" : "none"}
                        strokeWidth={isWishlisted ? 2.5 : 2}
                    />
                </button>
            </div>
        );
    }

    return (
        <div className="group relative bg-white rounded-xl overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-all duration-300">
            <Link href={`/products/${product.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {primaryImage ? (
                        <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {hasDiscount && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                -{Math.round((1 - product.salePrice / product.basePrice) * 100)}%
                            </span>
                        )}
                        {product.isFeatured && (
                            <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                <Star size={10} fill="white" /> Featured
                            </span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
                        {product.categoryId?.name || "Uncategorized"}
                    </p>
                    <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-2 min-h-[2.5rem] group-hover:text-[var(--color-primary)] transition text-sm">
                        {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-[var(--color-primary)]">
                            ${(displayPrice / 100).toFixed(2)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-[var(--color-text-secondary)] line-through">
                                ${(product.basePrice / 100).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {product.averageRating >= 0 && product.reviewCount > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                            <Star size={12} fill="currentColor" />
                            <span className="font-bold">{product.averageRating.toFixed(1)}</span>
                            <span className="text-[var(--color-text-secondary)] font-normal">
                                ({product.reviewCount})
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Wishlist Button - Absolute overlay to avoid triggering Link */}
            <button
                onClick={handleWishlist}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 ${
                    isWishlisted
                        ? "bg-red-50 text-red-500"
                        : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
                <Heart
                    size={18}
                    fill={isWishlisted ? "currentColor" : "none"}
                    strokeWidth={isWishlisted ? 2.5 : 2}
                />
            </button>
        </div>
    );
}
