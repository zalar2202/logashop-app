"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "system",
    toggleTheme: () => {},
    setTheme: () => {},
    resolvedTheme: "light",
    mounted: false,
});

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState("system");
    const [resolvedTheme, setResolvedTheme] = useState("light");
    const [mounted, setMounted] = useState(false);

    const getSystemTheme = () => {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    };

    // Initialize theme from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored && ["light", "dark", "system"].includes(stored)) {
            setThemeState(stored);
        }
        setMounted(true);
    }, []);

    // Apply theme to document and update resolvedTheme
    useEffect(() => {
        if (!mounted) return;

        const applyTheme = () => {
            const resolved = theme === "system" ? getSystemTheme() : theme;
            setResolvedTheme(resolved);
            document.documentElement.setAttribute("data-theme", resolved);
            localStorage.setItem("theme", theme);
        };

        applyTheme();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                applyTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, mounted]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    // Cycle: system -> light -> dark -> system (for backwards compatibility)
    const toggleTheme = () => {
        if (theme === "system") {
            setThemeState("light");
        } else if (theme === "light") {
            setThemeState("dark");
        } else {
            setThemeState("system");
        }
    };

    // Prevent flash of wrong theme on SSR
    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, resolvedTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
