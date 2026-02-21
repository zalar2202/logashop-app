"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProducts, deleteProduct } from "@/features/products/productsSlice";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/common/Table";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function ProductsPage() {
    const dispatch = useAppDispatch();
    const { list: products, loading } = useAppSelector((state) => state.products);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [categories, setCategories] = useState([]);

    const fetchWithFilters = (overrides = {}) => {
        dispatch(
            fetchProducts({
                page: 1,
                limit: 20,
                search: search || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                category: categoryFilter !== "all" ? categoryFilter : undefined,
                ...overrides,
            })
        );
    };

    useEffect(() => {
        fetchWithFilters();

        // Load categories for filter
        axios.get("/api/categories?type=list").then(({ data }) => {
            if (data?.data) setCategories(data.data);
        });
    }, [dispatch]);

    // Debounced search - refetch as user types (skip initial mount, initial load handled above)
    const isFirstSearch = useRef(true);
    useEffect(() => {
        if (isFirstSearch.current) {
            isFirstSearch.current = false;
            return;
        }
        const timer = setTimeout(() => fetchWithFilters(), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error(error);
        }
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        dispatch(
            fetchProducts({
                page: 1,
                limit: 20,
                search: search || undefined,
                status: e.target.value !== "all" ? e.target.value : undefined,
                category: categoryFilter !== "all" ? categoryFilter : undefined,
            })
        );
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategoryFilter(value);
        dispatch(
            fetchProducts({
                page: 1,
                limit: 20,
                search: search || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                category: value !== "all" ? value : undefined,
            })
        );
    };

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage your product catalog, inventory, and pricing.
                    </p>
                </div>
                <Link href="/panel/admin/products/create" className="w-full md:w-auto">
                    <Button icon={<Plus size={16} />} className="w-full md:w-auto">
                        Add Product
                    </Button>
                </Link>
            </div>

            <Card className="mb-6">
                <div className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by name or SKU..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="w-full md:w-auto md:min-w-[140px] px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={handleCategoryChange}
                            className="w-full md:w-auto md:min-w-[160px] px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading products...
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        <Link
                                            href={`/panel/admin/products/${product._id}`}
                                            className="hover:underline"
                                        >
                                            <div className="font-medium">{product.name}</div>
                                        </Link>
                                        <div className="text-xs text-gray-500">
                                            SKU: {product.sku}
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.categoryId?.name || "-"}</TableCell>
                                    <TableCell>
                                        ${product.basePrice.toFixed(2)}
                                        {product.salePrice && (
                                            <span className="ml-2 text-xs text-green-600 line-through">
                                                ${product.salePrice.toFixed(2)}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className={
                                                product.stockQuantity < 5
                                                    ? "text-red-500 font-medium"
                                                    : ""
                                            }
                                        >
                                            {product.stockQuantity}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.status === "active" ? "success" : "neutral"
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={`/panel/admin/products/${product._id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/panel/admin/products/${product._id}/edit`}
                                            >
                                                <Button size="sm" variant="ghost">
                                                    <Edit size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </ContentWrapper>
    );
}
