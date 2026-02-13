import Link from "next/link";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

export default function StorefrontLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            {/* Header (Client Component with cart integration) */}
            <StorefrontHeader />

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-[var(--color-background-elevated)] border-t border-[var(--color-border)] mt-12">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About */}
                        <div>
                            <h4 className="font-bold text-lg mb-4">LogaShop</h4>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Your one-stop destination for quality products at great prices.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                <li>
                                    <Link
                                        href="/about"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="hover:text-[var(--color-primary)]">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/shipping"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        Shipping Info
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div>
                            <h4 className="font-bold mb-4">Customer Service</h4>
                            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                <li>
                                    <Link
                                        href="/track-order"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        Track Order
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/returns"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        Returns &amp; Refunds
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/terms"
                                        className="hover:text-[var(--color-primary)]"
                                    >
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="font-bold mb-4">Stay Updated</h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                Subscribe to our newsletter for exclusive deals.
                            </p>
                            <form className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    aria-label="Email address for newsletter"
                                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-white"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-dark)] transition"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-border)] mt-8 pt-8 text-center text-sm text-[var(--color-text-secondary)]">
                        <p>&copy; 2026 LogaShop. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
