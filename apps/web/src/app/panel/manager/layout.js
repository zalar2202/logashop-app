"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/common/Loader";

/**
 * Restricts /panel/manager/* to users with "manager" role only.
 * Admins and other roles are redirected to the dashboard.
 */
export default function ManagerLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user && user.role !== "manager") {
            router.replace("/panel/dashboard");
        }
    }, [loading, user, router, pathname]);

    if (loading) {
        return (
            <div
                className="min-h-[400px] flex items-center justify-center"
                style={{ backgroundColor: "var(--color-background-secondary)" }}
            >
                <Loader size="lg" />
            </div>
        );
    }

    if (!user || user.role !== "manager") {
        return null;
    }

    return children;
}
