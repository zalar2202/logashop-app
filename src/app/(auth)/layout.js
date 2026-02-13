import "@/styles/panel.css";

/**
 * Auth Layout
 * Special layout for authentication pages (login, register, etc.)
 * No sidebar, no header - just centered content
 */
export default function AuthLayout({ children }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundColor: "var(--color-background)",
            }}
        >
            {children}
        </div>
    );
}
