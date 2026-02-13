"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Grid, List, SlidersHorizontal, X, Star, ChevronDown } from "lucide-react";
import axios from "axios";
import ProductCard from "@/components/products/ProductCard";
import { SkeletonProduct } from "@/components/common/Skeleton";

function ProductsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        category: searchParams.get("category") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        sort: searchParams.get("sort") || "newest",
        featured: searchParams.get("featured") || "",
        sale: searchParams.get("sale") || "",
        search: searchParams.get("search") || "",
    });

    // Fetch categories for filter
    useEffect(() => {
        axios
            .get("/api/categories?type=list")
            .then(({ data }) => setCategories(data.data))
            .catch(console.error);
    }, []);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("status", "active");
                if (filters.category) params.append("category", filters.category);
                if (filters.search) params.append("search", filters.search);
                if (filters.minPrice) params.append("minPrice", filters.minPrice);
                if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
                if (filters.sort) params.append("sort", filters.sort);
                if (filters.featured) params.append("featured", "true");
                if (filters.sale) params.append("sale", "true");
                params.append("page", pagination.page.toString());
                params.append("limit", "12");

                const { data } = await axios.get(`/api/products?${params.toString()}`);
                setProducts(data.data);
                setPagination({
                    page: data.pagination.page,
                    total: data.pagination.total,
                    pages: data.pagination.pages,
                });
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters, pagination.page]);

    // Update URL when filters change
    const updateFilters = (newFilters) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            category: "",
            minPrice: "",
            maxPrice: "",
            sort: "newest",
            featured: "",
            sale: "",
            search: "",
        });
    };

    const hasActiveFilters =
        filters.category ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.featured ||
        filters.sale ||
        filters.search;

    return (
        <div className="py-6">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm text-[var(--color-text-secondary)] mb-6">
                    <Link href="/" className="hover:text-[var(--color-primary)]">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-[var(--color-text-primary)]">Products</span>
                </nav>

                <div className="flex gap-6">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-xl border border-[var(--color-border)] p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="font-medium mb-3 text-sm">Category</h4>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <label
                                            key={cat._id}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={filters.category === cat._id}
                                                onChange={() =>
                                                    updateFilters({ ...filters, category: cat._id })
                                                }
                                                className="accent-[var(--color-primary)]"
                                            />
                                            <span className="text-sm">{cat.name}</span>
                                        </label>
                                    ))}
                                    {filters.category && (
                                        <button
                                            onClick={() =>
                                                updateFilters({ ...filters, category: "" })
                                            }
                                            className="text-xs text-[var(--color-primary)] hover:underline"
                                        >
                                            Clear category
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <h4 className="font-medium mb-3 text-sm">Price Range</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) =>
                                            updateFilters({ ...filters, minPrice: e.target.value })
                                        }
                                        className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)]"
                                    />
                                    <span className="text-[var(--color-text-secondary)]">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) =>
                                            updateFilters({ ...filters, maxPrice: e.target.value })
                                        }
                                        className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)]"
                                    />
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div>
                                <h4 className="font-medium mb-3 text-sm">Quick Filters</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!filters.featured}
                                            onChange={(e) =>
                                                updateFilters({
                                                    ...filters,
                                                    featured: e.target.checked ? "true" : "",
                                                })
                                            }
                                            className="accent-[var(--color-primary)]"
                                        />
                                        <span className="text-sm">Featured Only</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!filters.sale}
                                            onChange={(e) =>
                                                updateFilters({
                                                    ...filters,
                                                    sale: e.target.checked ? "true" : "",
                                                })
                                            }
                                            className="accent-[var(--color-primary)]"
                                        />
                                        <span className="text-sm">On Sale</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl border border-[var(--color-border)] p-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm"
                                >
                                    <SlidersHorizontal size={16} />
                                    Filters
                                </button>
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                    {pagination.total} product{pagination.total !== 1 ? "s" : ""}{" "}
                                    found
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-[var(--color-text-secondary)]">
                                        Sort by:
                                    </label>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) =>
                                            updateFilters({ ...filters, sort: e.target.value })
                                        }
                                        className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-white"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="name-asc">Name: A-Z</option>
                                        <option value="name-desc">Name: Z-A</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                </div>

                                {/* View Mode */}
                                <div className="hidden sm:flex items-center gap-1 border border-[var(--color-border)] rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-1.5 rounded ${
                                            viewMode === "grid"
                                                ? "bg-[var(--color-primary)] text-white"
                                                : "text-[var(--color-text-secondary)]"
                                        }`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-1.5 rounded ${
                                            viewMode === "list"
                                                ? "bg-[var(--color-primary)] text-white"
                                                : "text-[var(--color-text-secondary)]"
                                        }`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Tags */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {filters.search && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm rounded-full">
                                        Search: {filters.search}
                                        <button
                                            onClick={() =>
                                                updateFilters({ ...filters, search: "" })
                                            }
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {filters.category && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm rounded-full">
                                        Category:{" "}
                                        {categories.find((c) => c._id === filters.category)?.name}
                                        <button
                                            onClick={() =>
                                                updateFilters({ ...filters, category: "" })
                                            }
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {filters.featured && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                                        Featured
                                        <button
                                            onClick={() =>
                                                updateFilters({ ...filters, featured: "" })
                                            }
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {filters.sale && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                                        On Sale
                                        <button
                                            onClick={() => updateFilters({ ...filters, sale: "" })}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products Grid/List */}
                        {loading ? (
                            <div
                                className={`grid ${
                                    viewMode === "grid"
                                        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                        : "grid-cols-1"
                                } gap-4 md:gap-6`}
                            >
                                {[...Array(8)].map((_, i) => (
                                    <SkeletonProduct key={i} viewMode={viewMode} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-[var(--color-border)]">
                                <p className="text-lg text-[var(--color-text-secondary)] mb-4">
                                    No products found matching your criteria.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="text-[var(--color-primary)] hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div
                                className={`grid ${
                                    viewMode === "grid"
                                        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                        : "grid-cols-1"
                                } gap-4 md:gap-6`}
                            >
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                                    }
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() =>
                                            setPagination((prev) => ({ ...prev, page: i + 1 }))
                                        }
                                        className={`w-10 h-10 rounded-lg ${
                                            pagination.page === i + 1
                                                ? "bg-[var(--color-primary)] text-white"
                                                : "border border-[var(--color-border)]"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                                    }
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonProduct key={i} />
                        ))}
                    </div>
                </div>
            }
        >
            <ProductsPageContent />
        </Suspense>
    );
}
