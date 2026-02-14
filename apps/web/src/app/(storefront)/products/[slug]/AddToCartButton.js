"use client";

import { useState } from "react";
import { Heart, Share2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export default function AddToCartButton({ product, variants = [] }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isAdding, setIsAdding] = useState(false);

    // Get available options from product
    const options = product.options || [];

    // Handle option selection
    const handleOptionSelect = (optionName, value) => {
        const newSelection = { ...selectedOptions, [optionName]: value };
        setSelectedOptions(newSelection);

        // Find matching variant
        if (variants.length > 0 && Object.keys(newSelection).length === options.length) {
            const matching = variants.find((v) => {
                const attrs =
                    v.attributes instanceof Map
                        ? Object.fromEntries(v.attributes)
                        : v.attributes || {};
                return Object.entries(newSelection).every(([key, val]) => attrs[key] === val);
            });
            setSelectedVariant(matching || null);
        }
    };

    // Get effective price based on variant
    const getPrice = () => {
        if (selectedVariant?.price) {
            return selectedVariant.price;
        }
        return product.salePrice || product.basePrice;
    };

    // Get effective stock
    const getStock = () => {
        if (selectedVariant) {
            return selectedVariant.stockQuantity;
        }
        return product.stockQuantity;
    };

    // Check if can add to cart
    const canAddToCart = () => {
        // If product has options, require selection
        if (options.length > 0 && Object.keys(selectedOptions).length !== options.length) {
            return false;
        }
        // Check stock
        const stock = getStock();
        return stock > 0 || product.allowBackorder;
    };

    // Increment/decrement quantity
    const adjustQuantity = (delta) => {
        const newQty = quantity + delta;
        const maxQty = getStock() || 99;
        if (newQty >= 1 && newQty <= maxQty) {
            setQuantity(newQty);
        }
    };

    // Add to cart handler
    const handleAddToCart = async () => {
        if (!canAddToCart()) {
            if (options.length > 0) {
                toast.error("Please select all options");
            }
            return;
        }

        setIsAdding(true);
        try {
            const success = await addToCart(product._id, selectedVariant?._id || null, quantity);

            if (success) {
                toast.success(`${product.name} added to cart!`);
                setQuantity(1); // Reset quantity
            }
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setIsAdding(false);
        }
    };

    const effectivePrice = getPrice();
    const effectiveStock = getStock();

    return (
        <div className="space-y-6">
            {/* Options Selection */}
            {options.length > 0 && (
                <div className="space-y-4">
                    {options.map((option) => (
                        <div key={option.name}>
                            <label className="block text-sm font-medium mb-2">
                                {option.name}:
                                <span className="font-normal text-[var(--color-primary)] ml-2">
                                    {selectedOptions[option.name] || "Select"}
                                </span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {option.values.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleOptionSelect(option.name, value)}
                                        className={`
                                            px-4 py-2 rounded-lg border text-sm font-medium transition
                                            ${
                                                selectedOptions[option.name] === value
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                                            }
                                        `}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Variant Price (if different) */}
            {selectedVariant?.price && selectedVariant.price !== product.basePrice && (
                <div className="text-lg">
                    Variant Price:{" "}
                    <span className="font-bold text-[var(--color-primary)]">
                        ${(effectivePrice / 100).toFixed(2)}
                    </span>
                </div>
            )}

            {/* Quantity Selector */}
            <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[var(--color-border)] rounded-lg">
                        <button
                            onClick={() => adjustQuantity(-1)}
                            disabled={quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={18} />
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                            onClick={() => adjustQuantity(1)}
                            disabled={quantity >= effectiveStock && !product.allowBackorder}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 transition"
                            aria-label="Increase quantity"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    {effectiveStock > 0 && effectiveStock <= 10 && (
                        <span className="text-sm text-orange-500">Only {effectiveStock} left!</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart() || isAdding}
                    className={`
                        flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition
                        ${
                            canAddToCart()
                                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }
                    `}
                >
                    <ShoppingCart size={20} />
                    {isAdding ? "Adding..." : "Add to Cart"}
                </button>
                {/* Note: WishlistToggle and Share are now managed separately in the product page */}
            </div>
        </div>
    );
}
