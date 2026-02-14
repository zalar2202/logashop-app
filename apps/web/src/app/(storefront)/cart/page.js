"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Minus,
    Plus,
    Trash2,
    ArrowLeft,
    ArrowRight,
    ShoppingCart,
    Tag,
    Truck,
    Shield,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const {
        items,
        subtotal,
        itemCount,
        loading,
        updateQuantity,
        removeItem,
        clearCart,
        closeCart,
    } = useCart();

    // Make sure sidebar is closed when viewing full cart page
    useEffect(() => {
        closeCart();
    }, [closeCart]);

    if (loading) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-lg mx-auto text-center py-20">
                        <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
                        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
                        <p className="text-[var(--color-text-secondary)] mb-8">
                            Looks like you haven&apos;t added anything to your cart yet. Start
                            shopping and find great deals!
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition"
                        >
                            <ShoppingCart size={20} />
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Rough shipping estimate
    const shipping = subtotal >= 5000 ? 0 : 499; // Free above $50
    const tax = Math.round(subtotal * 0.08); // ~8% tax estimate
    const total = subtotal + shipping + tax;

    return (
        <div className="py-6">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm text-[var(--color-text-secondary)] mb-6">
                    <Link href="/" className="hover:text-[var(--color-primary)]">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-[var(--color-text-primary)]">Shopping Cart</span>
                </nav>

                <h1 className="text-2xl md:text-3xl font-bold mb-6">
                    Shopping Cart
                    <span className="text-lg font-normal text-[var(--color-text-secondary)] ml-3">
                        ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        {/* Table Header (Desktop) */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-t-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {/* Items */}
                        <div className="border border-[var(--color-border)] md:border-t-0 rounded-xl md:rounded-t-none divide-y divide-[var(--color-border)] bg-white">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center"
                                >
                                    {/* Product Info */}
                                    <div className="md:col-span-6 flex items-center gap-4">
                                        <Link
                                            href={`/products/${item.slug}`}
                                            className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 overflow-hidden"
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
                                        <div className="min-w-0">
                                            <Link
                                                href={`/products/${item.slug}`}
                                                className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition line-clamp-2"
                                            >
                                                {item.name}
                                            </Link>
                                            {item.variantInfo && (
                                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                                    {Object.entries(item.variantInfo)
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(", ")}
                                                </p>
                                            )}
                                            {/* Mobile-only remove button */}
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                className="md:hidden mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="md:col-span-2 text-center">
                                        <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-0">
                                            <span className="text-sm font-medium">
                                                ${(item.price / 100).toFixed(2)}
                                            </span>
                                            {item.price < item.originalPrice && (
                                                <span className="text-xs text-[var(--color-text-secondary)] line-through">
                                                    ${(item.originalPrice / 100).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2 flex justify-center">
                                        <div className="flex items-center border border-[var(--color-border)] rounded-lg">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, item.quantity - 1)
                                                }
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(item._id, item.quantity + 1)
                                                }
                                                disabled={
                                                    item.quantity >= item.maxQuantity &&
                                                    !item.allowBackorder
                                                }
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total & Remove */}
                                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                                        <span className="font-bold text-[var(--color-primary)]">
                                            ${(item.lineTotal / 100).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeItem(item._id)}
                                            className="hidden md:block p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                            <Link
                                href="/products"
                                className="flex items-center gap-2 text-[var(--color-primary)] text-sm font-medium hover:underline"
                            >
                                <ArrowLeft size={16} />
                                Continue Shopping
                            </Link>
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Subtotal ({itemCount} items)
                                    </span>
                                    <span className="font-medium">
                                        ${(subtotal / 100).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Shipping
                                    </span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            `$${(shipping / 100).toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Tax (estimated)
                                    </span>
                                    <span className="font-medium">${(tax / 100).toFixed(2)}</span>
                                </div>

                                {shipping > 0 && (
                                    <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-center gap-2">
                                        <Truck size={16} />
                                        <span>
                                            Add ${((5000 - subtotal) / 100).toFixed(2)} more for
                                            free shipping!
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
                                    <span className="text-base font-bold">Total</span>
                                    <span className="text-xl font-bold text-[var(--color-primary)]">
                                        ${(total / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Link
                                href="/checkout"
                                className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} />
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <Shield size={16} className="text-green-500" />
                                    Secure SSL encrypted checkout
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <Truck size={16} className="text-blue-500" />
                                    Free shipping on orders over $50
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <Tag size={16} className="text-orange-500" />
                                    Best price guarantee
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
