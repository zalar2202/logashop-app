"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    DollarSign,
    BarChart3,
    Tag,
    Box,
    Star,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatDate } from "@/lib/utils";

export default function ProductViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        axios
            .get(`/api/products/${id}`)
            .then(({ data }) => {
                setProduct(data.data);
            })
            .catch(() => {
                toast.error("Failed to load product");
                router.push("/panel/admin/products");
            })
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await axios.delete(`/api/products/${id}`);
            toast.success("Product deleted successfully");
            router.push("/panel/admin/products");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete product");
        }
    };

    if (loading) {
        return (
            <ContentWrapper>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-[var(--color-secondary)] rounded w-1/4"></div>
                    <div className="h-64 bg-[var(--color-secondary)] rounded"></div>
                </div>
            </ContentWrapper>
        );
    }

    if (!product) {
        return (
            <ContentWrapper>
                <Card className="p-8 text-center">
                    <Package className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        The product you're looking for doesn't exist or has been deleted.
                    </p>
                    <Button onClick={() => router.push("/panel/admin/products")}>
                        Back to Products
                    </Button>
                </Card>
            </ContentWrapper>
        );
    }

    const statusVariant = {
        active: "success",
        draft: "warning",
        archived: "neutral",
    };

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    Back
                </Button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {product.name}
                        </h1>
                        <p
                            className="text-sm mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            SKU: {product.sku}
                        </p>
                    </div>
                    <div className="flex gap-2">
                    <Link href={`/panel/admin/products/${product._id}/edit`}>
                        <Button variant="secondary" icon={<Edit size={16} />}>
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleDelete}
                        icon={<Trash2 size={16} />}
                    >
                        Delete
                    </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Details */}
                    <Card>
                        <CardHeader
                            title="Product Details"
                            actions={
                                <Badge variant={statusVariant[product.status]}>
                                    {product.status}
                                </Badge>
                            }
                        />
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm text-[var(--color-text-secondary)]">
                                    Category
                                </label>
                                <p className="font-medium">
                                    {product.categoryId?.name || "Uncategorized"}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm text-[var(--color-text-secondary)]">
                                    Product Type
                                </label>
                                <p className="font-medium capitalize">{product.productType}</p>
                            </div>

                            {product.shortDescription && (
                                <div>
                                    <label className="text-sm text-[var(--color-text-secondary)]">
                                        Short Description
                                    </label>
                                    <p>{product.shortDescription}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-[var(--color-text-secondary)]">
                                    Full Description
                                </label>
                                <p className="whitespace-pre-wrap">{product.description}</p>
                            </div>

                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <label className="text-sm text-[var(--color-text-secondary)]">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {product.tags.map((tag, i) => (
                                            <Badge key={i} variant="neutral">
                                                <Tag size={12} className="mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader title="Product Images" />
                        <div className="mt-4">
                            {product.images && product.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {product.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className={`relative aspect-square rounded-lg overflow-hidden border ${
                                                image.isPrimary
                                                    ? "ring-2 ring-[var(--color-primary)]"
                                                    : ""
                                            }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.alt || product.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {image.isPrimary && (
                                                <span className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--color-text-secondary)]">
                                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No images uploaded</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <Card>
                        <CardHeader title="Pricing" />
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    Base Price
                                </span>
                                <span className="text-xl font-bold text-[var(--color-primary)]">
                                    ${product.basePrice?.toFixed(2)}
                                </span>
                            </div>
                            {product.salePrice && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Sale Price
                                    </span>
                                    <span className="text-xl font-bold text-green-600">
                                        ${product.salePrice?.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Inventory */}
                    <Card>
                        <CardHeader title="Inventory" />
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">Stock</span>
                                <span
                                    className={`font-semibold ${
                                        product.stockQuantity < product.lowStockThreshold
                                            ? "text-red-500"
                                            : "text-green-600"
                                    }`}
                                >
                                    {product.stockQuantity} units
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    Low Stock Alert
                                </span>
                                <span>{product.lowStockThreshold} units</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    Track Inventory
                                </span>
                                <Badge variant={product.trackInventory ? "success" : "neutral"}>
                                    {product.trackInventory ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    Backorders
                                </span>
                                <Badge variant={product.allowBackorder ? "success" : "neutral"}>
                                    {product.allowBackorder ? "Allowed" : "Not Allowed"}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader title="Statistics" />
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    <BarChart3 size={16} className="inline mr-2" />
                                    Total Sold
                                </span>
                                <span className="font-semibold">{product.totalSold || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    <Star size={16} className="inline mr-2" />
                                    Rating
                                </span>
                                <span className="font-semibold">
                                    {product.averageRating?.toFixed(1) || "N/A"}
                                    {product.reviewCount > 0 && ` (${product.reviewCount} reviews)`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">Featured</span>
                                <Badge variant={product.isFeatured ? "success" : "neutral"}>
                                    {product.isFeatured ? "Yes" : "No"}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Physical Specs */}
                    {product.productType === "physical" && (
                        <Card>
                            <CardHeader title="Physical Specs" />
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Weight
                                    </span>
                                    <span>{product.weight || 0}g</span>
                                </div>
                                {product.dimensions && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--color-text-secondary)]">
                                            Dimensions
                                        </span>
                                        <span>
                                            {product.dimensions.length || 0} x{" "}
                                            {product.dimensions.width || 0} x{" "}
                                            {product.dimensions.height || 0}{" "}
                                            {product.dimensions.unit || "cm"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Timestamps */}
                    <Card>
                        <CardHeader title="Dates" />
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    <Calendar size={14} className="inline mr-2" />
                                    Created
                                </span>
                                <span>{formatDate(product.createdAt, "long")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--color-text-secondary)]">
                                    <Calendar size={14} className="inline mr-2" />
                                    Updated
                                </span>
                                <span>{formatDate(product.updatedAt, "long")}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </ContentWrapper>
    );
}
