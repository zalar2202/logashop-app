'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { STORAGE_KEYS } from '@/constants/config';

const AuthContext = createContext();

/**
 * AuthProvider Component
 * Manages authentication state across the application
 * Uses httpOnly cookies for token storage (handled by server)
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // API now returns envelope { success, data }; payload is in response.data.data
    const getPayload = (response) => response.data?.data ?? response.data;

    /**
     * Check if user is authenticated
     * Calls /api/auth/check which reads httpOnly cookie
     */
    const checkAuth = async () => {
        try {
            const response = await api.get('/api/auth/check');
            const payload = getPayload(response);

            if (payload?.authenticated && payload?.user) {
                setUser(payload.user);
                setIsAuthenticated(true);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
            } else {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(STORAGE_KEYS.USER);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login function
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const payload = getPayload(response);

            if (response.data?.success && payload?.user) {
                setUser(payload.user);
                setIsAuthenticated(true);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
                return { success: true, user: payload.user };
            }
            return {
                success: false,
                message: payload?.message || response.data?.error || 'Login failed',
            };
        } catch (error) {
            const msg = error.response?.data?.error || error.message;
            return { success: false, message: msg || 'An error occurred during login' };
        }
    };

    /**
     * Logout function
     * Clears httpOnly cookie on server and clears local state
     */
    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local state, even if API call fails
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(STORAGE_KEYS.USER);
            
            // Redirect to homepage
            router.push('/');
        }
    };

    /**
     * Update user data
     * @param {object} userData - Updated user data
     */
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access authentication context
 * @returns {object} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
}

