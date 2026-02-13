"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, MapPin, Package, Settings, LogOut, ChevronRight, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ACCOUNT_NAV = [
    { href: "/account", label: "Dashboard", icon: User, exact: true },
    { href: "/account/orders", label: "My Orders", icon: Package },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
    { href: "/account/addresses", label: "Address Book", icon: MapPin },
    { href: "/account/profile", label: "Profile Settings", icon: Settings },
];

export default function AccountLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, loading, logout } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [loading, isAuthenticated, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <div className="py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-[var(--color-text-secondary)] mb-6">
                    <Link href="/" className="hover:text-[var(--color-primary)]">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-[var(--color-text-primary)]">My Account</span>
                </nav>

                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Welcome back, {user?.firstName || user?.name || "Customer"}!
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Manage your account, orders, and addresses.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-1">
                        <nav className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
                            {ACCOUNT_NAV.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.exact
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-[var(--color-border)] last:border-b-0 transition ${
                                            isActive
                                                ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)] border-l-3 border-l-[var(--color-primary)]"
                                                : "text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]"
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span className="flex-1">{item.label}</span>
                                        <ChevronRight
                                            size={16}
                                            className={isActive ? "opacity-100" : "opacity-30"}
                                        />
                                    </Link>
                                );
                            })}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition w-full"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">{children}</main>
                </div>
            </div>
        </div>
    );
}
