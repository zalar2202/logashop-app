"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/products/ProductCard";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AccountWishlistPage() {
    const { wishlistItems, loading } = useWishlist();

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                        My Wishlist
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                        {wishlistItems.length} items saved for later
                    </p>
                </div>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-primary-dark)] transition"
                >
                    Continue Shopping <ArrowRight size={16} />
                </Link>
            </div>

            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-[var(--color-text-secondary)] gap-4">
                    <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                    <p className="font-medium text-sm">Curating your wishlist...</p>
                </div>
            ) : wishlistItems.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center bg-[var(--color-background-secondary)] rounded-xl border-2 border-dashed border-[var(--color-border)] gap-6 text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm">
                        <Heart size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                            Your wishlist is empty
                        </h3>
                        <p className="text-[var(--color-text-secondary)] text-sm mt-2 max-w-sm mx-auto">
                            Start adding items you love to your wishlist. They will be saved here for
                            you to find easily later.
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-full text-sm font-bold hover:bg-[var(--color-primary)] hover:text-white transition"
                    >
                        Browse Our Catalog
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlistItems.map((product) => (
                        <div key={product._id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
