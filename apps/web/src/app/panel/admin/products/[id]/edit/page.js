"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/common/Button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                // Fetch categories
                const catResponse = await axios.get("/api/categories?type=list");
                setCategories(
                    catResponse.data.data.map((cat) => ({
                        label: cat.name,
                        value: cat._id,
                    }))
                );

                // Fetch product
                const prodResponse = await axios.get(`/api/products/${id}`);
                setProduct(prodResponse.data.data);
            } catch (error) {
                toast.error("Failed to load product");
                router.push("/panel/admin/products");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await axios.put(`/api/products/${id}`, values);
            toast.success("Product updated successfully");
            router.push("/panel/admin/products");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update product");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ContentWrapper>
                <div className="animate-pulse">
                    <div className="h-8 bg-[var(--color-secondary)] rounded w-1/4 mb-6"></div>
                    <div className="h-96 bg-[var(--color-secondary)] rounded"></div>
                </div>
            </ContentWrapper>
        );
    }

    if (!product) {
        return (
            <ContentWrapper>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        The product you're looking for doesn't exist.
                    </p>
                    <Button onClick={() => router.push("/panel/admin/products")}>
                        Back to Products
                    </Button>
                </div>
            </ContentWrapper>
        );
    }

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
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Edit Product
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Update product information
                </p>
            </div>

            <ProductForm
                initialValues={product}
                categories={categories}
                onSubmit={handleSubmit}
                isEdit={true}
            />
        </ContentWrapper>
    );
}
