"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartSidebar() {
    const {
        items,
        subtotal,
        itemCount,
        loading,
        isCartOpen,
        closeCart,
        updateQuantity,
        removeItem,
    } = useCart();

    const sidebarRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") closeCart();
        };
        if (isCartOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isCartOpen, closeCart]);

    // Close on click outside
    const handleBackdropClick = (e) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            closeCart();
        }
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" onClick={handleBackdropClick}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 transition-opacity" />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in-right"
                style={{
                    animation: "slideInRight 0.3s ease-out forwards",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-[var(--color-primary)]" />
                        <h2 className="text-lg font-bold">
                            Shopping Cart
                            {itemCount > 0 && (
                                <span className="text-sm font-normal text-[var(--color-text-secondary)] ml-2">
                                    ({itemCount} item{itemCount !== 1 ? "s" : ""})
                                </span>
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6">
                            <ShoppingBag size={64} className="text-gray-200 mb-4" />
                            <h3 className="text-lg font-medium text-[var(--color-text-secondary)] mb-2">
                                Your cart is empty
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <button
                                onClick={closeCart}
                                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-[var(--color-border)]">
                            {items.map((item) => (
                                <li key={item._id} className="px-6 py-4">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <Link
                                            href={`/products/${item.slug}`}
                                            onClick={closeCart}
                                            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag size={24} />
                                                </div>
                                            )}
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/products/${item.slug}`}
                                                onClick={closeCart}
                                                className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition line-clamp-2"
                                            >
                                                {item.name}
                                            </Link>

                                            {/* Variant Info */}
                                            {item.variantInfo && (
                                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                                    {Object.entries(item.variantInfo)
                                                        .map(([key, val]) => `${key}: ${val}`)
                                                        .join(", ")}
                                                </p>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-bold text-[var(--color-primary)]">
                                                    ${(item.price / 100).toFixed(2)}
                                                </span>
                                                {item.price < item.originalPrice && (
                                                    <span className="text-xs text-[var(--color-text-secondary)] line-through">
                                                        ${(item.originalPrice / 100).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity & Remove */}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-[var(--color-border)] rounded-lg">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item._id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition text-sm"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item._id,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        disabled={
                                                            item.quantity >= item.maxQuantity &&
                                                            !item.allowBackorder
                                                        }
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition text-sm"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item._id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-[var(--color-border)] px-6 py-4 space-y-4 bg-gray-50">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                            <span className="text-xl font-bold text-[var(--color-text-primary)]">
                                ${(subtotal / 100).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            Shipping and taxes calculated at checkout
                        </p>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Link
                                href="/cart"
                                onClick={closeCart}
                                className="flex items-center justify-center gap-2 w-full py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg font-medium hover:bg-[var(--color-primary)]/5 transition"
                            >
                                View Cart
                            </Link>
                            <Link
                                href="/checkout"
                                onClick={closeCart}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition"
                            >
                                Checkout
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Animation styles */}
            <style jsx global>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
}
