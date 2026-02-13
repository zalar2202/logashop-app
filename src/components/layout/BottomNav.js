"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, CreditCard, Menu } from "lucide-react";

export const BottomNav = ({ onMenuClick }) => {
    const pathname = usePathname();

    const shortcuts = [
        { name: "Home", href: "/panel/dashboard", icon: Home },
        { name: "Users", href: "/panel/users", icon: Users },
        { name: "center-menu", type: "menu" }, // Placeholder for center button
        { name: "Transactions", href: "/panel/transactions", icon: FileText },
        { name: "Payments", href: "/panel/payments", icon: CreditCard },
    ];

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
            style={{
                backgroundColor: "var(--color-background-elevated)",
                borderColor: "var(--color-border)",
                paddingBottom: "env(safe-area-inset-bottom)",
            }}
        >
            <div className="flex items-end justify-around h-16 px-2">
                {shortcuts.map((item, index) => {
                    // Center menu button (elevated and larger)
                    if (item.type === "menu") {
                        return (
                            <button
                                key="menu"
                                onClick={onMenuClick}
                                className="flex flex-col items-center justify-center relative -top-4 transition-transform active:scale-95"
                                style={{
                                    width: "56px",
                                    height: "56px",
                                }}
                                aria-label="Toggle menu"
                            >
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)",
                                    }}
                                >
                                    <Menu className="w-6 h-6 text-white" />
                                </div>
                            </button>
                        );
                    }

                    // Regular shortcut links
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-0 flex-1 transition-colors"
                        >
                            <Icon
                                className="w-5 h-5 flex-shrink-0"
                                style={{
                                    color: isActive
                                        ? "var(--color-primary)"
                                        : "var(--color-text-secondary)",
                                }}
                            />
                            <span
                                className="text-xs font-medium truncate"
                                style={{
                                    color: isActive
                                        ? "var(--color-primary)"
                                        : "var(--color-text-tertiary)",
                                }}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

