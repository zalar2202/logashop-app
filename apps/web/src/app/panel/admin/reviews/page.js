"use client";

import { useEffect, useState } from "react";
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
import { Trash2, MessageSquare, Check, X as Close, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import Rating from "@/components/products/Rating";

export default function ReviewsModerationPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/reviews", {
                params: { status: filter === "all" ? undefined : filter },
            });
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const { data } = await axios.put(`/api/reviews/${id}`, { status });
            if (data.success) {
                toast.success(`Review ${status}`);
                fetchReviews();
            }
        } catch (error) {
            toast.error("Failed to update review");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this review permanently?")) return;
        try {
            const { data } = await axios.delete(`/api/reviews/${id}`);
            if (data.success) {
                toast.success("Review deleted");
                fetchReviews();
            }
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    return (
        <ContentWrapper>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Review Moderation
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Manage customer feedback and ratings
                    </p>
                </div>
            </div>

            <Card className="mb-6 p-4">
                <div className="flex gap-2">
                    {["all", "pending", "approved", "rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                                filter === s
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </Card>

            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reviewer / Product</TableHead>
                            <TableHead>Rating & Comment</TableHead>
                            <TableHead>Purchased</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    Loading reviews...
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <MessageSquare size={40} strokeWidth={1} />
                                        <p>No reviews matching your criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review._id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">
                                            {review.userName}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                        {review.productId && (
                                            <Link
                                                href={`/product/${review.productId.slug}`}
                                                target="_blank"
                                                className="flex items-center gap-2 group"
                                            >
                                                <div className="w-8 h-8 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={
                                                            review.productId.images?.find(
                                                                (i) => i.isPrimary
                                                            )?.url ||
                                                            review.productId.images?.[0]?.url
                                                        }
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-[var(--color-primary)] group-hover:underline truncate max-w-[120px]">
                                                    {review.productId.name}
                                                </span>
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <Rating
                                            value={review.rating}
                                            showLabel={false}
                                            size={14}
                                            className="mb-1"
                                        />
                                        <p className="text-sm text-gray-700 line-clamp-2 italic">
                                            "{review.comment}"
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {review.isVerifiedPurchase ? (
                                            <Badge
                                                variant="success"
                                                size="sm"
                                                className="whitespace-nowrap"
                                            >
                                                Verified Purchase
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">
                                                Not Verified
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                review.status === "approved"
                                                    ? "success"
                                                    : review.status === "pending"
                                                      ? "warning"
                                                      : "error"
                                            }
                                        >
                                            {review.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {review.status !== "approved" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-green-600 hover:bg-green-50"
                                                    onClick={() =>
                                                        handleUpdateStatus(review._id, "approved")
                                                    }
                                                    title="Approve"
                                                >
                                                    <Check size={18} />
                                                </Button>
                                            )}
                                            {review.status !== "rejected" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-amber-600 hover:bg-amber-50"
                                                    onClick={() =>
                                                        handleUpdateStatus(review._id, "rejected")
                                                    }
                                                    title="Reject"
                                                >
                                                    <Close size={18} />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:bg-red-50"
                                                onClick={() => handleDelete(review._id)}
                                                title="Delete permanently"
                                            >
                                                <Trash2 size={18} />
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
