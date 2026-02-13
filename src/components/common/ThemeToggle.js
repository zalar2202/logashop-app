"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = () => {
    const { theme, toggleTheme, resolvedTheme } = useTheme();

    const getIcon = () => {
        if (theme === "system") {
            return <Monitor className="w-5 h-5" />;
        }
        return resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5" />
        ) : (
            <Moon className="w-5 h-5" />
        );
    };

    const getLabel = () => {
        if (theme === "system") {
            return `System (${resolvedTheme})`;
        }
        return theme === "dark" ? "Dark mode" : "Light mode";
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-lg transition-all hover:scale-105 hover:bg-[var(--color-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            style={{
                color: "var(--color-text-secondary)",
            }}
            aria-label={`Current: ${getLabel()}. Click to change.`}
            title={getLabel()}
        >
            {getIcon()}
        </button>
    );
};
