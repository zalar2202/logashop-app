"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { navigation, adminNavigation } from "@/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-20" : "w-64"}
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                    shadow-xl lg:shadow-none
                `}
                style={{
                    backgroundColor: "var(--color-background-elevated)",
                    borderRight: "1px solid var(--color-border)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between h-16 px-5 flex-shrink-0"
                    style={{
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 flex-1">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
                                }}
                            >
                                <Image
                                    src="/assets/logo/LogaTech-512.webp"
                                    alt="L"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain brightness-0 invert"
                                />
                            </div>
                            <h1
                                className="text-lg font-bold tracking-tight"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                LogaShop
                            </h1>
                        </div>
                    ) : (
                        <button
                            onClick={onToggleCollapse}
                            className="w-full flex justify-center"
                            aria-label="Expand sidebar"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden transition-transform hover:scale-110"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
                                }}
                            >
                                <Image
                                    src="/assets/logo/LogaTech-512.webp"
                                    alt="L"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain brightness-0 invert"
                                />
                            </div>
                        </button>
                    )}

                    {/* Close button (mobile) */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{
                            color: "var(--color-text-secondary)",
                        }}
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Collapse button (desktop) */}
                    {!isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="hidden lg:flex items-center justify-center p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-2 custom-scrollbar">
                    {navigation
                        .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
                        .map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => {
                                        // Close mobile sidebar on navigation
                                        if (window.innerWidth < 1024) {
                                            onClose();
                                        }
                                    }}
                                    className={`
                                    group relative flex items-center gap-3 px-3 rounded-lg
                                    transition-all duration-200
                                    ${isCollapsed ? "justify-center py-3" : "py-2.5"}
                                    ${isActive ? "shadow-sm" : "hover:translate-x-0.5"}
                                `}
                                    style={{
                                        backgroundColor: isActive
                                            ? "var(--color-primary)"
                                            : "transparent",
                                        color: isActive ? "#ffffff" : "var(--color-text-secondary)",
                                    }}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    {/* Active indicator */}
                                    {isActive && !isCollapsed && (
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                            style={{
                                                backgroundColor: "#ffffff",
                                            }}
                                        />
                                    )}

                                    <Icon
                                        className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                                            isCollapsed ? "w-6 h-6" : "w-5 h-5"
                                        }`}
                                    />
                                    {!isCollapsed && (
                                        <span className="font-medium text-sm">{item.name}</span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                                            {item.name}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}

                    {/* Admin Navigation (Admins and Managers Only) */}
                    {user &&
                        ["admin", "manager"].includes(user.role) &&
                        adminNavigation.length > 0 && (
                            <>
                                {!isCollapsed && (
                                    <div className="px-3 pt-4 pb-2">
                                        <p
                                            className="text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Admin Tools
                                        </p>
                                    </div>
                                )}
                                {adminNavigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) {
                                                    onClose();
                                                }
                                            }}
                                            className={`
                                            group relative flex items-center gap-3 px-3 rounded-lg
                                            transition-all duration-200
                                            ${isCollapsed ? "justify-center py-3" : "py-2.5"}
                                            ${isActive ? "shadow-sm" : "hover:translate-x-0.5"}
                                        `}
                                            style={{
                                                backgroundColor: isActive
                                                    ? "var(--color-primary)"
                                                    : "transparent",
                                                color: isActive
                                                    ? "#ffffff"
                                                    : "var(--color-text-secondary)",
                                            }}
                                            title={isCollapsed ? item.name : undefined}
                                        >
                                            {isActive && !isCollapsed && (
                                                <div
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                    }}
                                                />
                                            )}

                                            <Icon
                                                className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                                                    isCollapsed ? "w-6 h-6" : "w-5 h-5"
                                                }`}
                                            />
                                            {!isCollapsed && (
                                                <span className="font-medium text-sm">
                                                    {item.name}
                                                </span>
                                            )}

                                            {isCollapsed && (
                                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                                                    {item.name}
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </>
                        )}
                </nav>

                {/* Expand button when collapsed */}
                {isCollapsed && (
                    <div className="p-4 flex-shrink-0">
                        <button
                            onClick={onToggleCollapse}
                            className="w-full p-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-background-secondary)",
                                color: "var(--color-text-secondary)",
                            }}
                            aria-label="Expand sidebar"
                            title="Expand sidebar"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div
                    className="flex-shrink-0 p-5"
                    style={{
                        borderTop: "1px solid var(--color-border)",
                    }}
                >
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <Image
                                    src="/assets/logo/LogaTech-512.webp"
                                    alt="L"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 object-contain brightness-0 invert"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-xs font-semibold truncate leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    LogaShop
                                </p>
                                <p
                                    className="text-xs truncate mt-0.5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Admin Panel v1.0
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden mx-auto">
                            <Image
                                src="/assets/logo/LogaTech-512.webp"
                                alt="L"
                                width={20}
                                height={20}
                                className="w-5 h-5 object-contain brightness-0 invert"
                            />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};
