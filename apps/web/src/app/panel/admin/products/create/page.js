"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { createProduct } from "@/features/products/productsSlice";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/common/Button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function CreateProductPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch categories for the select dropdown
        axios
            .get("/api/categories?type=list")
            .then(({ data }) => {
                setCategories(
                    data.data.map((cat) => ({
                        label: cat.name,
                        value: cat._id,
                    }))
                );
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await dispatch(createProduct(values)).unwrap();
            toast.success("Product created successfully");
            router.push("/panel/admin/products");
        } catch (error) {
            toast.error(typeof error === "string" ? error : "Failed to create product");
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

    return (
        <ContentWrapper>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft size={18} />
                </Button>
                <h1 className="text-2xl font-bold">Create Product</h1>
            </div>

            <ProductForm categories={categories} onSubmit={handleSubmit} isEdit={false} />
        </ContentWrapper>
    );
}
