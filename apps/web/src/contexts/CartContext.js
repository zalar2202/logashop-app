"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch cart from API
    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/cart");
            if (data.success) {
                setCart(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch cart on mount and when auth changes
    useEffect(() => {
        fetchCart();
    }, [isAuthenticated, fetchCart]);

    // Add item to cart
    const addToCart = useCallback(
        async (productId, variantId = null, quantity = 1) => {
            try {
                const { data } = await axios.post("/api/cart", {
                    productId,
                    variantId,
                    quantity,
                });

                if (data.success) {
                    // Refresh full cart to get populated items
                    await fetchCart();
                    setIsCartOpen(true); // Open cart sidebar
                    return true;
                }
            } catch (error) {
                const message = error.response?.data?.error || "Failed to add to cart";
                toast.error(message);
                return false;
            }
        },
        [fetchCart]
    );

    // Update item quantity
    const updateQuantity = useCallback(
        async (itemId, quantity) => {
            try {
                const { data } = await axios.put("/api/cart", {
                    itemId,
                    quantity,
                });

                if (data.success) {
                    await fetchCart();
                    return true;
                }
            } catch (error) {
                const message = error.response?.data?.error || "Failed to update cart";
                toast.error(message);
                return false;
            }
        },
        [fetchCart]
    );

    // Remove item from cart
    const removeItem = useCallback(
        async (itemId) => {
            try {
                const { data } = await axios.delete(`/api/cart?itemId=${itemId}`);

                if (data.success) {
                    await fetchCart();
                    toast.success("Item removed from cart");
                    return true;
                }
            } catch (error) {
                toast.error("Failed to remove item");
                return false;
            }
        },
        [fetchCart]
    );

    // Clear entire cart
    const clearCart = useCallback(async () => {
        try {
            const { data } = await axios.delete("/api/cart?clear=true");

            if (data.success) {
                setCart({ items: [], subtotal: 0, itemCount: 0 });
                toast.success("Cart cleared");
                return true;
            }
        } catch (error) {
            toast.error("Failed to clear cart");
            return false;
        }
    }, []);

    // Toggle cart sidebar
    const toggleCart = useCallback(() => {
        setIsCartOpen((prev) => !prev);
    }, []);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const value = {
        cart,
        items: cart.items || [],
        subtotal: cart.subtotal || 0,
        itemCount: cart.itemCount || 0,
        loading,
        isCartOpen,
        // Actions
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
        toggleCart,
        openCart,
        closeCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
