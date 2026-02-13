import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "@/styles/tailwind.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/lib/StoreProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const playfairDisplay = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
    display: "swap",
});

const themeScript = `
(function() {
    try {
        var theme = localStorage.getItem('theme');
        var resolved = theme;
        if (!theme || theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', resolved);
    } catch (e) {}
})();
`;

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
        default: "LogaShop | Premium Electronics & Digital Goods",
        template: "%s | LogaShop",
    },
    description:
        "Your one-stop shop for high-end electronics, laptops, hardware, and digital assets. Experience premium quality and lightning-fast delivery.",
    keywords: ["electronics", "digital goods", "laptops", "hardware", "software", "LogaShop"],
    authors: [{ name: "LogaTech Team" }],
    creator: "LogaTech",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfairDisplay.variable} antialiased`}
                suppressHydrationWarning
            >
                <ThemeProvider>
                    <AuthProvider>
                        <StoreProvider>
                            <CartProvider>
                                <WishlistProvider>
                                    <NotificationProvider>{children}</NotificationProvider>
                                </WishlistProvider>
                            </CartProvider>
                            <Toaster position="top-right" richColors />
                        </StoreProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
