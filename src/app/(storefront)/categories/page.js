import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { ArrowRight, Grid } from "lucide-react";

async function getCategories() {
    await dbConnect();

    // Get all active categories
    const categories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean();

    return JSON.parse(JSON.stringify(categories));
}

export const metadata = {
    title: "Shop by Category | LogaShop",
    description: "Browse our product categories and find exactly what you're looking for.",
};

export default async function CategoriesPage() {
    const allCategories = await getCategories();

    // Separate parent and child categories
    const parentCategories = allCategories.filter((c) => !c.parentId);
    const childrenMap = allCategories.reduce((acc, cat) => {
        if (cat.parentId) {
            if (!acc[cat.parentId]) acc[cat.parentId] = [];
            acc[cat.parentId].push(cat);
        }
        return acc;
    }, {});

    return (
        <div className="py-6">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm text-[var(--color-text-secondary)] mb-6">
                    <Link href="/" className="hover:text-[var(--color-primary)]">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-[var(--color-text-primary)]">Categories</span>
                </nav>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h1>
                    <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
                        Explore our wide range of products organized by category. Find exactly what
                        you're looking for.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="space-y-12">
                    {parentCategories.map((category) => {
                        const children = childrenMap[category._id] || [];

                        return (
                            <section key={category._id}>
                                {/* Parent Category Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="group flex items-center gap-3"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white">
                                            <Grid size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold group-hover:text-[var(--color-primary)] transition">
                                                {category.name}
                                            </h2>
                                            {category.description && (
                                                <p className="text-sm text-[var(--color-text-secondary)]">
                                                    {category.description}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:underline"
                                    >
                                        View All <ArrowRight size={16} />
                                    </Link>
                                </div>

                                {/* Subcategories Grid */}
                                {children.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        {children.map((child) => (
                                            <Link
                                                key={child._id}
                                                href={`/categories/${child.slug}`}
                                                className="group bg-white rounded-xl border border-[var(--color-border)] p-4 hover:shadow-lg hover:border-[var(--color-primary)] transition-all duration-300"
                                            >
                                                {child.image ? (
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                                                        <img
                                                            src={child.image}
                                                            alt={child.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 mb-3 flex items-center justify-center">
                                                        <Grid size={32} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <h3 className="font-medium text-center group-hover:text-[var(--color-primary)] transition">
                                                    {child.name}
                                                </h3>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="block bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-xl p-8 text-center hover:from-[var(--color-primary)]/20 hover:to-[var(--color-primary)]/10 transition"
                                    >
                                        <p className="text-[var(--color-text-secondary)] mb-2">
                                            Browse all products in
                                        </p>
                                        <span className="text-[var(--color-primary)] font-bold text-lg">
                                            {category.name} →
                                        </span>
                                    </Link>
                                )}
                            </section>
                        );
                    })}
                </div>

                {/* Empty State */}
                {parentCategories.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[var(--color-border)]">
                        <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-medium text-[var(--color-text-secondary)] mb-2">
                            No Categories Yet
                        </h2>
                        <p className="text-[var(--color-text-secondary)]">
                            Check back soon for our product categories.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
