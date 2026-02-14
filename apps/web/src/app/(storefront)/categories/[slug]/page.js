import Link from "next/link";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { Star, ArrowRight, Grid } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ProductSort from "@/components/storefront/ProductSort";

async function getCategory(slug) {
    await dbConnect();
    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) return null;
    return JSON.parse(JSON.stringify(category));
}

async function getSubcategories(parentId) {
    await dbConnect();
    const categories = await Category.find({
        parentId,
        isActive: true,
    })
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    return JSON.parse(JSON.stringify(categories));
}

async function getCategoryProducts(categoryIds, page = 1, limit = 12, sort = "newest") {
    await dbConnect();

    let sortOption = { createdAt: -1 };
    switch (sort) {
        case "price-asc":
            sortOption = { basePrice: 1 };
            break;
        case "price-desc":
            sortOption = { basePrice: -1 };
            break;
        case "name-asc":
            sortOption = { name: 1 };
            break;
        case "popular":
            sortOption = { totalSold: -1 };
            break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find({
            categoryId: { $in: categoryIds },
            status: "active",
        })
            .populate("categoryId", "name slug")
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({
            categoryId: { $in: categoryIds },
            status: "active",
        }),
    ]);

    return {
        products: JSON.parse(JSON.stringify(products)),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = await getCategory(slug);
    if (!category) return { title: "Category Not Found" };

    return {
        title: category.metaTitle || `${category.name} | LogaShop`,
        description:
            category.metaDescription ||
            category.description ||
            `Browse our ${category.name} collection`,
    };
}

export default async function CategoryPage({ params, searchParams }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const category = await getCategory(slug);

    if (!category) {
        notFound();
    }

    const subcategories = await getSubcategories(category._id);

    // Get products from this category AND all subcategories
    const categoryIds = [category._id, ...subcategories.map((s) => s._id)];
    const page = Number(resolvedSearchParams.page) || 1;
    const sort = resolvedSearchParams.sort || "newest";

    const { products, pagination } = await getCategoryProducts(categoryIds, page, 12, sort);

    // Build breadcrumb from ancestors
    const breadcrumbs = [
        { name: "Home", href: "/" },
        { name: "Categories", href: "/categories" },
        ...(category.ancestors || []).map((a) => ({
            name: a.name,
            href: `/categories/${a.slug}`,
        })),
        { name: category.name, href: null },
    ];

    return (
        <div className="py-6">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm text-[var(--color-text-secondary)] mb-6">
                    {breadcrumbs.map((item, i) => (
                        <span key={i}>
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-[var(--color-primary)]"
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <span className="text-[var(--color-text-primary)]">
                                    {item.name}
                                </span>
                            )}
                            {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                        </span>
                    ))}
                </nav>

                {/* Category Header */}
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-2xl p-8 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
                    {category.description && (
                        <p className="text-lg opacity-90 max-w-2xl">{category.description}</p>
                    )}
                    <p className="mt-4 text-sm opacity-75">{pagination.total} products</p>
                </div>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold mb-4">Browse Subcategories</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub._id}
                                    href={`/categories/${sub.slug}`}
                                    className="flex-shrink-0 px-4 py-2 bg-white rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-[var(--color-border)] p-4">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        {pagination.total} product{pagination.total !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="product-sort"
                            className="text-sm text-[var(--color-text-secondary)]"
                        >
                            Sort by:
                        </label>
                        <ProductSort currentSort={sort} />
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-[var(--color-border)]">
                        <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-medium text-[var(--color-text-secondary)] mb-2">
                            No Products Yet
                        </h2>
                        <p className="text-[var(--color-text-secondary)] mb-4">
                            This category doesn't have any products yet.
                        </p>
                        <Link
                            href="/products"
                            className="text-[var(--color-primary)] hover:underline"
                        >
                            Browse all products
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {page > 1 && (
                            <Link
                                href={`/categories/${slug}?page=${page - 1}${sort ? `&sort=${sort}` : ""}`}
                                className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                            >
                                Previous
                            </Link>
                        )}
                        {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <Link
                                    key={pageNum}
                                    href={`/categories/${slug}?page=${pageNum}${sort ? `&sort=${sort}` : ""}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg ${page === pageNum
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "border border-[var(--color-border)] hover:bg-gray-50"
                                        }`}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}
                        {page < pagination.pages && (
                            <Link
                                href={`/categories/${slug}?page=${page + 1}${sort ? `&sort=${sort}` : ""}`}
                                className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-gray-50"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
