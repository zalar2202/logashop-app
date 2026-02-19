import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Product } from '../api/catalog';
import * as wishlistApi from '../api/wishlist';
import * as authStorage from '../lib/authStorage';
import * as wishlistStorage from '../lib/wishlistStorage';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  products: Product[];
  loading: boolean;
  wishlistCount: number;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistSessionId, setWishlistSessionId] = useState<string | null>(null);
  const hasMergedRef = useRef(false);
  const wasAuthenticatedRef = useRef<boolean | null>(null);

  const loadWishlist = useCallback(
    async (accessToken?: string | null, sessionId?: string | null) => {
      try {
        const data = await wishlistApi.fetchWishlist(accessToken, sessionId);
        setProducts(data.products ?? []);
        if (data.sessionId) {
          setWishlistSessionId(data.sessionId);
          wishlistStorage.setWishlistSessionId(data.sessionId);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshWishlist = useCallback(async () => {
    setLoading(true);
    const tokens = await authStorage.getTokens();
    const token = tokens?.accessToken ?? null;
    const sid = wishlistSessionId ?? (await wishlistStorage.getWishlistSessionId());
    await loadWishlist(token, sid);
  }, [wishlistSessionId, loadWishlist]);

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      const sid = await wishlistStorage.getWishlistSessionId();
      if (mounted) setWishlistSessionId(sid);
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      if (mounted) await loadWishlist(token, sid);
    })();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge on login: when authenticated and we have guest sessionId
  useEffect(() => {
    if (isAuthenticated && wishlistSessionId && !hasMergedRef.current) {
      hasMergedRef.current = true;
      (async () => {
        const tokens = await authStorage.getTokens();
        const token = tokens?.accessToken ?? null;
        if (!token) return;
        setLoading(true);
        try {
          await wishlistApi.fetchWishlist(token, wishlistSessionId);
          await wishlistStorage.clearWishlistSessionId();
          setWishlistSessionId(null);
          await loadWishlist(token, null);
        } catch {
          hasMergedRef.current = false;
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isAuthenticated, wishlistSessionId, loadWishlist]);

  // On logout: clear wishlist session
  useEffect(() => {
    const wasAuth = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;
    if (wasAuth === true && !isAuthenticated) {
      hasMergedRef.current = false;
      wishlistStorage.clearWishlistSessionId();
      setWishlistSessionId(null);
      setProducts([]);
    }
  }, [isAuthenticated]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const tokens = await authStorage.getTokens();
      const token = tokens?.accessToken ?? null;
      const sid = wishlistSessionId ?? (await wishlistStorage.getWishlistSessionId());
      const result = await wishlistApi.toggleWishlist(productId, token, sid);
      if (result.sessionId) {
        setWishlistSessionId(result.sessionId);
        wishlistStorage.setWishlistSessionId(result.sessionId);
      }
      await refreshWishlist();
    },
    [wishlistSessionId, refreshWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return products.some((p) => p._id === productId);
    },
    [products]
  );

  const value: WishlistContextValue = {
    products,
    loading,
    wishlistCount: products.length,
    toggleWishlist,
    isInWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
