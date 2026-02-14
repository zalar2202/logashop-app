"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Rating from "@/components/products/Rating";
import { Button } from "@/components/common/Button";
import { MessageSquare, Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function ProductReviews({ productId, initialCount = 0 }) {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/products/${productId}/reviews`);
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error("Failed to load reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            toast.error("Please provide both a rating and a comment");
            return;
        }

        try {
            setSubmitting(true);
            const { data } = await axios.post(`/api/products/${productId}/reviews`, {
                rating,
                comment,
            });

            if (data.success) {
                toast.success("Thank you for your review!");
                setComment("");
                setRating(5);
                setShowForm(false);
                fetchReviews();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare size={20} className="text-[var(--color-primary)]" />
                        Customer Reviews
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {reviews.length} reviews for this product
                    </p>
                </div>
                {!showForm && isAuthenticated && !reviews.some((r) => r.userId === user?._id) && (
                    <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
                        Write a Review
                    </Button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="bg-gray-50 rounded-xl p-6 border border-[var(--color-border)] animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="font-bold mb-4">Share your thoughts</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="transition-transform active:scale-95"
                                    >
                                        <Star
                                            size={28}
                                            className={`${
                                                (hoveredRating || rating) >= star
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300 fill-gray-100"
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                placeholder="What did you like or dislike?"
                                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition resize-none"
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={submitting}
                                icon={submitting && <Loader2 size={16} className="animate-spin" />}
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {!isAuthenticated && !showForm && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-amber-800">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">
                            Log in to share your review with other customers.
                        </span>
                    </div>
                    <Link href="/login">
                        <Button variant="outline" size="sm" className="bg-white">
                            Login
                        </Button>
                    </Link>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                        <p className="text-sm">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
                        <MessageSquare size={48} strokeWidth={1} />
                        <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            className="group border-b border-[var(--color-border)] pb-6 last:border-0"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {review.userName}
                                            {review.isVerifiedPurchase && (
                                                <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-100">
                                                    <CheckCircle size={10} /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <Rating value={review.rating} showLabel={false} size={14} />
                                    </div>
                                </div>
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed pl-13">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import Link from "next/link";
