"use client";

import { useWishlist } from "@/contexts/WishlistContext";
import ProductCard from "@/components/products/ProductCard";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
    const { wishlistItems, loading } = useWishlist();

    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                            My Wishlist
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-1">
                            {wishlistItems.length} items saved for later
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition shadow-lg shadow-[var(--color-primary)]/20"
                    >
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-[var(--color-text-secondary)] gap-4">
                        <Loader2 size={48} className="animate-spin text-[var(--color-primary)]" />
                        <p className="font-medium">Curating your wishlist...</p>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-[var(--color-border)] gap-6 text-center px-4">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm">
                            <Heart size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                Your wishlist is empty
                            </h2>
                            <p className="text-[var(--color-text-secondary)] mt-2 max-w-sm mx-auto">
                                Start adding items you love to your wishlist. They will be saved
                                here for you to find easily later.
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-full font-bold hover:bg-[var(--color-primary)] hover:text-white transition"
                        >
                            Browse Our Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlistItems.map((product) => (
                            <div
                                key={product._id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
