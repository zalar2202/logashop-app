"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { Checkbox } from "@/components/common/Checkbox";
import { ChevronLeft, Save, Ticket } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

export default function CreateCouponPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        maxDiscount: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        usageLimit: "",
        userLimit: 1,
        isActive: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.code || !formData.discountValue) {
            toast.error("Please fill in required fields");
            return;
        }

        try {
            setLoading(true);

            // Prepare data (convert dollars/percentage to cents/number)
            const submissionData = {
                ...formData,
                discountValue:
                    formData.discountType === "fixed"
                        ? Math.round(parseFloat(formData.discountValue) * 100)
                        : parseFloat(formData.discountValue),
                minPurchase: formData.minPurchase
                    ? Math.round(parseFloat(formData.minPurchase) * 100)
                    : 0,
                maxDiscount: formData.maxDiscount
                    ? Math.round(parseFloat(formData.maxDiscount) * 100)
                    : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                userLimit: formData.userLimit ? parseInt(formData.userLimit) : null,
            };

            const { data } = await axios.post("/api/coupons", submissionData);

            if (data.success) {
                toast.success("Coupon created successfully!");
                router.push("/panel/admin/coupons");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create coupon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/panel/admin/coupons">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Create Coupon</h1>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Set up a new discount code for your customers
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold mb-4">Basic Information</h3>
                                <div className="space-y-4">
                                    <InputField
                                        label="Coupon Code"
                                        name="code"
                                        placeholder="E.g., SUMMER20"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        className="uppercase font-mono font-bold"
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="What does this coupon offer? (e.g., 20% off all laptops)"
                                            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition"
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold mb-4">Discount Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Discount Type</label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-white shadow-sm"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <InputField
                                        label={
                                            formData.discountType === "percentage"
                                                ? "Discount Percentage (%)"
                                                : "Discount Amount ($)"
                                        }
                                        name="discountValue"
                                        type="number"
                                        step={formData.discountType === "percentage" ? "1" : "0.01"}
                                        placeholder={
                                            formData.discountType === "percentage" ? "20" : "15.00"
                                        }
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputField
                                        label="Minimum Purchase ($)"
                                        name="minPurchase"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.minPurchase}
                                        onChange={handleChange}
                                        helperText="Leave empty for no minimum"
                                    />
                                    {formData.discountType === "percentage" && (
                                        <InputField
                                            label="Maximum Discount ($)"
                                            name="maxDiscount"
                                            type="number"
                                            step="0.01"
                                            placeholder="No limit"
                                            value={formData.maxDiscount}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold mb-4">Usage Limits</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField
                                        label="Total Usage Limit"
                                        name="usageLimit"
                                        type="number"
                                        placeholder="No limit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Limit Per User"
                                        name="userLimit"
                                        type="number"
                                        placeholder="1"
                                        value={formData.userLimit}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="p-6">
                                <h3 className="font-bold mb-4">Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium">Is Active?</span>
                                        <Checkbox
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <InputField
                                        label="Start Date"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="End Date (Optional)"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Card>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg"
                                disabled={loading}
                                icon={<Save size={20} />}
                            >
                                {loading ? "Creating..." : "Save Coupon"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </ContentWrapper>
    );
}
