"use client";

import { Heart, Share2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

export default function WishlistToggle({ productId, productName }) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(productId);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => toggleWishlist(productId)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300 font-medium ${
                    isWishlisted
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-white border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-red-500 hover:text-red-500"
                }`}
            >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button
                onClick={handleShare}
                className="p-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
                title="Share product"
            >
                <Share2 size={20} />
            </button>
        </div>
    );
}
