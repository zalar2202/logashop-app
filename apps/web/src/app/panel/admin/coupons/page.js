"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/coupons");
            if (data.success) {
                setCoupons(data.data);
            }
        } catch (error) {
            toast.error("Failed to load coupons");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const { data } = await axios.delete(`/api/coupons/${id}`);
            if (data.success) {
                toast.success("Coupon deleted successfully");
                fetchCoupons();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete coupon");
        }
    };

    const formatValue = (coupon) => {
        if (coupon.discountType === "percentage") {
            return `${coupon.discountValue}%`;
        }
        return `$${(coupon.discountValue / 100).toFixed(2)}`;
    };

    const getStatus = (coupon) => {
        const now = new Date();
        if (!coupon.isActive) return { label: "Inactive", variant: "neutral" };
        if (coupon.startDate && new Date(coupon.startDate) > now)
            return { label: "Scheduled", variant: "info" };
        if (coupon.endDate && new Date(coupon.endDate) < now)
            return { label: "Expired", variant: "error" };
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
            return { label: "Exhausted", variant: "warning" };
        return { label: "Active", variant: "success" };
    };

    return (
        <ContentWrapper>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Discount Coupons
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage promotional codes and discounts
                    </p>
                </div>
                <Link href="/panel/admin/coupons/create">
                    <Button icon={<Plus size={16} />}>Create Coupon</Button>
                </Link>
            </div>

            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-gray-500">
                                            Loading coupons...
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Ticket size={40} strokeWidth={1} />
                                        <p>No coupons found.</p>
                                        <Link href="/panel/admin/coupons/create">
                                            <Button variant="ghost" size="sm">
                                                Create your first coupon
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => {
                                const status = getStatus(coupon);
                                return (
                                    <TableRow key={coupon._id}>
                                        <TableCell>
                                            <div className="font-mono font-bold text-[var(--color-primary)]">
                                                {coupon.code}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {coupon.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-gray-900">
                                                {formatValue(coupon)}
                                            </span>
                                            {coupon.minPurchase > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    Min: ${(coupon.minPurchase / 100).toFixed(2)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {coupon.usageCount} / {coupon.usageLimit || "∞"}
                                            </div>
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--color-primary)]"
                                                    style={{
                                                        width: coupon.usageLimit
                                                            ? `${Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)}%`
                                                            : "0%",
                                                    }}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.endDate ? (
                                                <div className="text-sm">
                                                    {new Date(coupon.endDate).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    No expiration
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={`/panel/admin/coupons/${coupon._id}/edit`}
                                                >
                                                    <Button size="sm" variant="ghost">
                                                        <Edit size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(coupon._id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>
        </ContentWrapper>
    );
}
