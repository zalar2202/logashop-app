"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, Heart, Phone, Mail, X, Bell } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import CartSidebar from "@/components/cart/CartSidebar";
import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { selectUnreadCount } from "@/features/notifications/notificationsSlice";

export default function StorefrontHeader() {
    const { itemCount, toggleCart } = useCart();
    const { wishlistCount } = useWishlist();
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const unreadCount = useAppSelector(selectUnreadCount);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    const navLinks = [
        { href: "/products", label: "All Products" },
        { href: "/categories", label: "Categories" },
        { href: "/products?featured=true", label: "Featured" },
        {
            href: "/products?sale=true",
            label: "Sale",
            className: "text-red-500 hover:text-red-600",
        },
    ];

    return (
        <>
            {/* Top Bar */}
            <div className="bg-[var(--color-primary)] text-white text-sm py-2">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>+1 (555) 123-4567</span>
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                            <Mail size={14} />
                            <span>support@logashop.com</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/track" className="hover:underline">
                            Track Order
                        </Link>
                        {!isAuthenticated && (
                            <>
                                <span className="hidden md:inline">|</span>
                                <Link href="/login" className="hover:underline hidden md:inline">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white font-bold text-xl">
                                L
                            </div>
                            <span className="text-xl font-bold text-[var(--color-text-primary)]">
                                LogaShop
                            </span>
                        </Link>

                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden md:flex flex-1 max-w-xl mx-8"
                        >
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for products..."
                                    aria-label="Search for products"
                                    className="w-full px-4 py-2 pl-10 rounded-full border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] transition"
                                />
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                                    size={18}
                                />
                            </div>
                        </form>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/account/wishlist"
                                className="hidden md:flex relative items-center justify-center p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition"
                                title="Wishlist"
                                aria-label="Wishlist"
                            >
                                <Heart size={22} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications */}
                            {isAuthenticated && (
                                <Link
                                    href="/account/notifications"
                                    className="hidden md:flex relative items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition"
                                    aria-label="Notifications"
                                >
                                    <Bell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Cart Button */}
                            <button
                                onClick={toggleCart}
                                className="relative flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition"
                                aria-label="Open cart"
                            >
                                <ShoppingCart size={22} />
                                <span
                                    className={`absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                        itemCount > 0
                                            ? "bg-[var(--color-primary)] scale-100"
                                            : "bg-gray-400 scale-90"
                                    }`}
                                >
                                    {itemCount}
                                </span>
                            </button>

                            {isAuthenticated ? (
                                <Link
                                    href="/account"
                                    className="hidden md:flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition"
                                >
                                    <User size={16} />
                                    My Account
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="hidden md:flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition"
                                >
                                    <User size={16} />
                                    Account
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6 py-3 border-t border-[var(--color-border)]">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    link.className ||
                                    `text-sm font-medium transition ${
                                        pathname === link.href
                                            ? "text-[var(--color-primary)]"
                                            : "text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                                    }`
                                }
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[var(--color-border)] bg-white">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="p-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full px-4 py-2 pl-10 rounded-full border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                            </div>
                        </form>
                        <div className="px-4 pb-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                                        link.className ||
                                        "text-[var(--color-text-primary)] hover:bg-gray-50"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-2" />
                            <Link
                                href="/account/wishlist"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-gray-50"
                            >
                                Wishlist
                            </Link>
                            <Link
                                href={isAuthenticated ? "/account" : "/login"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-gray-50"
                            >
                                {isAuthenticated ? "My Account" : "Login / Register"}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Cart Sidebar */}
            <CartSidebar />
        </>
    );
}
