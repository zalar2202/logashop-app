"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Plus, Edit, Trash2, Search, Filter, Eye } from "lucide-react";
import { InputField } from "@/components/forms/InputField";
import { toast } from "sonner";
import axios from "axios";

export default function ProductsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { list: products, loading } = useAppSelector((state) => state.products);
    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Load products
        dispatch(fetchProducts({ page: 1, limit: 20 }));

        // Load categories for filter (basic)
        axios.get("/api/categories?type=list").then(({ data }) => {
            setCategories(data.data);
        });
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error(error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(fetchProducts({ search, page: 1 }));
    };

    return (
        <ContentWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link href="/panel/admin/products/create">
                    <Button icon={<Plus size={16} />}>Add Product</Button>
                </Link>
            </div>

            <Card className="mb-6">
                <form onSubmit={handleSearch} className="flex gap-4 p-4">
                    <div className="flex-1">
                        <InputField
                            name="search"
                            placeholder="Search by name or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search size={18} />}
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>
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
