"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/wishlist");
            if (data.success) {
                setWishlistItems(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [isAuthenticated, fetchWishlist]);

    const toggleWishlist = useCallback(
        async (productId) => {
            try {
                const { data } = await axios.post("/api/wishlist", { productId });
                if (data.success) {
                    await fetchWishlist();
                    if (data.action === "added") {
                        toast.success("Added to wishlist");
                    } else {
                        toast.success("Removed from wishlist");
                    }
                    return true;
                }
            } catch (error) {
                toast.error("Failed to update wishlist");
                return false;
            }
        },
        [fetchWishlist]
    );

    const isInWishlist = (productId) => {
        return wishlistItems.some((item) => item._id === productId);
    };

    const value = {
        wishlistItems,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
