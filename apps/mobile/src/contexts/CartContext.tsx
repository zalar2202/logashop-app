import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { CartItem } from '../api/cart';
import * as cartApi from '../api/cart';
import * as authStorage from '../lib/authStorage';
import * as cartStorage from '../lib/cartStorage';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  cartSessionId: string | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  addItem: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [cartSessionId, setCartSessionIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasMergedRef = useRef(false);
  const wasAuthenticatedRef = useRef<boolean | null>(null);

  const applyCartResponse = useCallback((data: { items: CartItem[]; subtotal: number; itemCount: number; sessionId?: string }) => {
    setItems(data.items);
    setSubtotal(data.subtotal);
    setItemCount(data.itemCount);
    if (data.sessionId) {
      setCartSessionIdState(data.sessionId);
      cartStorage.setCartSessionId(data.sessionId);
    }
  }, []);

  const loadCart = useCallback(async (accessToken?: string | null, sessionId?: string | null) => {
    try {
      setError(null);
      const data = await cartApi.fetchCart(accessToken, sessionId);
      applyCartResponse(data);
      if (data.sessionId) {
        setCartSessionIdState(data.sessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  }, [applyCartResponse]);

  const refetchCart = useCallback(async () => {
    setLoading(true);
    const tokens = await authStorage.getTokens();
    const token = tokens?.accessToken ?? null;
    const sid = cartSessionId ?? (await cartStorage.getCartSessionId());
    await loadCart(token, sid);
  }, [cartSessionId, loadCart]);

  // Initial load: get sessionId from storage, then fetch cart
  useEffect(() => {
    let mounted = true;
    (async () => {
      const sid = await cartStorage.getCartSessionId();
      if (mounted) setCartSessionIdState(sid);
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      if (mounted) await loadCart(token, sid);
    })();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: run once on mount

  // Merge on login: when authenticated and we have guest sessionId
  useEffect(() => {
    if (isAuthenticated && cartSessionId && !hasMergedRef.current) {
      hasMergedRef.current = true;
      (async () => {
        const tokens = await authStorage.getTokens();
        const token = tokens?.accessToken ?? null;
        if (!token) return;
        setLoading(true);
        try {
          const data = await cartApi.fetchCart(token, cartSessionId);
          setItems(data.items);
          setSubtotal(data.subtotal);
          setItemCount(data.itemCount);
          await cartStorage.clearCartSessionId();
          setCartSessionIdState(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to merge cart');
          hasMergedRef.current = false; // allow retry
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isAuthenticated, cartSessionId]);

  // On logout: clear cart when transitioning from authenticated to guest
  useEffect(() => {
    const wasAuth = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;
    if (wasAuth === true && !isAuthenticated) {
      hasMergedRef.current = false;
      cartStorage.clearCartSessionId();
      setCartSessionIdState(null);
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
    }
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (productId: string, variantId?: string | null, quantity = 1) => {
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      const sid = cartSessionId ?? (await cartStorage.getCartSessionId());
      const result = await cartApi.addToCart(
        { productId, variantId: variantId ?? null, quantity },
        token,
        sid
      );
      if (result.sessionId) {
        setCartSessionIdState(result.sessionId);
        cartStorage.setCartSessionId(result.sessionId);
      }
      await refetchCart();
    },
    [cartSessionId, refetchCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      const sid = cartSessionId ?? (await cartStorage.getCartSessionId());
      if (quantity <= 0) {
        await cartApi.removeCartItem(itemId, token, sid);
      } else {
        await cartApi.updateCartItem(itemId, quantity, token, sid);
      }
      await refetchCart();
    },
    [cartSessionId, refetchCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      const sid = cartSessionId ?? (await cartStorage.getCartSessionId());
      await cartApi.removeCartItem(itemId, token, sid);
      await refetchCart();
    },
    [cartSessionId, refetchCart]
  );

  const clearCart = useCallback(
    async () => {
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      const sid = cartSessionId ?? (await cartStorage.getCartSessionId());
      await cartApi.clearCart(token, sid);
      await refetchCart();
    },
    [cartSessionId, refetchCart]
  );

  const clearError = useCallback(() => setError(null), []);

  const value: CartContextValue = {
    items,
    subtotal,
    itemCount,
    cartSessionId: cartSessionId ?? null,
    loading,
    error,
    clearError,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
