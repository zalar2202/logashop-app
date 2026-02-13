import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ArrowRight, Star, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

// Product Card Component

// Category Card Component
function CategoryCard({ category }) {
    return (
        <Link
            href={`/categories/${category.slug}`}
            className="group relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]"
        >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                <h3 className="text-lg font-bold">{category.name}</h3>
                <span className="text-sm opacity-80 group-hover:opacity-100 flex items-center gap-1 mt-1">
                    Shop Now <ArrowRight size={14} />
                </span>
            </div>
        </Link>
    );
}

// Fetch featured products
async function getFeaturedProducts() {
    await dbConnect();
    const products = await Product.find({
        status: "active",
        isFeatured: true,
    })
        .populate("categoryId", "name slug")
        .limit(8)
        .lean();

    return JSON.parse(JSON.stringify(products));
}

// Fetch sale products
async function getSaleProducts() {
    await dbConnect();
    const products = await Product.find({
        status: "active",
        salePrice: { $gt: 0, $exists: true },
    })
        .populate("categoryId", "name slug")
        .limit(4)
        .lean();

    return JSON.parse(JSON.stringify(products));
}

// Fetch new arrivals
async function getNewArrivals() {
    await dbConnect();
    const products = await Product.find({ status: "active" })
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();

    return JSON.parse(JSON.stringify(products));
}

// Fetch top categories
async function getTopCategories() {
    await dbConnect();
    const categories = await Category.find({
        isActive: true,
        parentId: null, // Only parent categories
    })
        .limit(6)
        .lean();

    return JSON.parse(JSON.stringify(categories));
}

export default async function HomePage() {
    const [featuredProducts, saleProducts, newArrivals, topCategories] = await Promise.all([
        getFeaturedProducts(),
        getSaleProducts(),
        getNewArrivals(),
        getTopCategories(),
    ]);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-primary bg-gradient-to-r from-primary to-primary-dark text-white overflow-hidden">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Discover Quality Products for Every Lifestyle
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 mb-8">
                            Shop the latest trends with free shipping on orders over $50.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/products"
                                className="px-6 py-3 bg-white text-[var(--color-primary)] font-medium rounded-full hover:bg-gray-100 transition flex items-center gap-2"
                            >
                                Shop Now <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/categories"
                                className="px-6 py-3 border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition"
                            >
                                Browse Categories
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative shapes */}
                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-40 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                </div>
            </section>

            {/* Features Bar */}
            <section className="bg-white border-b border-[var(--color-border)] py-6">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                                <Truck className="text-[var(--color-primary)]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Free Shipping</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    On orders over $50
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                                <Shield className="text-[var(--color-primary)]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Secure Payment</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    100% protected
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                                <RefreshCw className="text-[var(--color-primary)]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">Easy Returns</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    30 day guarantee
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                                <Headphones className="text-[var(--color-primary)]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">24/7 Support</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Dedicated help
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop by Category */}
            {topCategories.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Shop by Category</h2>
                            <Link
                                href="/categories"
                                className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:underline"
                            >
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {topCategories.map((category) => (
                                <CategoryCard key={category._id} category={category} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="py-12 bg-[var(--color-background-elevated)]">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Featured Products</h2>
                            <Link
                                href="/products?featured=true"
                                className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:underline"
                            >
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Sale Banner */}
            {saleProducts.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <div className="mb-6 md:mb-0">
                                    <h2 className="text-3xl font-bold mb-2">Hot Deals 🔥</h2>
                                    <p className="text-lg opacity-90">
                                        Limited time offers on selected items
                                    </p>
                                </div>
                                <Link
                                    href="/products?sale=true"
                                    className="px-6 py-3 bg-white text-red-500 font-medium rounded-full hover:bg-gray-100 transition"
                                >
                                    Shop Sale
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">New Arrivals</h2>
                            <Link
                                href="/products?sort=newest"
                                className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:underline"
                            >
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {newArrivals.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Newsletter CTA */}
            <section className="py-16 bg-[var(--color-background-elevated)]">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay in the Loop</h2>
                    <p className="text-[var(--color-text-secondary)] mb-6 max-w-xl mx-auto">
                        Subscribe to our newsletter and get 10% off your first order, plus exclusive
                        access to sales and new products.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-full border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-full hover:bg-[var(--color-primary-dark)] transition"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
