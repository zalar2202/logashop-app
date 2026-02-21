"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, User, ChevronDown, LogOut, Settings, Home, ShoppingCart } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export const Header = ({ onMenuClick, sidebarCollapsed }) => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        setShowUserMenu(false);
        await logout();
    };

    return (
        <header
            className="sticky top-0 z-30 h-16 backdrop-blur-sm"
            style={{
                backgroundColor: "var(--color-background-elevated)",
                borderBottom: "1px solid var(--color-border)",
            }}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg transition-all hover:scale-105"
                        style={{
                            color: "var(--color-text-secondary)",
                            backgroundColor: "var(--color-background-secondary)",
                        }}
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Website Home button */}
                    <Link
                        href="/"
                        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-[1.02] hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                        style={{
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <Home className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold text-sm">Website Home</span>
                    </Link>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    {/* Website Home (icon only on mobile, since left button is hidden) */}
                    <Link
                        href="/"
                        className="sm:hidden flex items-center justify-center p-2 rounded-lg transition-all hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                        style={{ color: "var(--color-text-secondary)" }}
                        title="Website Home"
                        aria-label="Website Home"
                    >
                        <Home className="w-5 h-5" />
                    </Link>

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    {user?.role === "user" && (
                        <Link
                            href="/panel/cart"
                            className="flex items-center justify-center p-2 rounded-lg transition-all hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] relative"
                            style={{ color: "var(--color-text-secondary)" }}
                            title="My Cart"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-indigo-600 rounded-full border-2 border-[var(--color-background-elevated)] leading-none transition-all animate-in zoom-in">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}
                    <NotificationDropdown />

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-[1.02] hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                            aria-label="User menu"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/20">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden md:flex items-center gap-1">
                                <span
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {user?.name || user?.email || "Admin"}
                                </span>
                                <ChevronDown
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                {/* Backdrop to close menu */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />

                                {/* Menu */}
                                <div
                                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50"
                                    style={{
                                        backgroundColor: "var(--color-card-bg)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="p-3 border-b"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {user?.name || "Admin User"}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {user?.email || "admin@logatech.net"}
                                        </p>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                router.push("/account/profile");
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            <Settings size={16} />
                                            <span className="text-sm">Settings</span>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                            style={{ color: "var(--color-error)" }}
                                        >
                                            <LogOut size={16} />
                                            <span className="text-sm">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
