"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/common/Loader";

/**
 * Wraps panel content and redirects to login when not authenticated.
 */
export function PanelGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname || "/panel/dashboard")}`);
        }
    }, [loading, isAuthenticated, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-background-secondary)" }}>
                <Loader size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
}
