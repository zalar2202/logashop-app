"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import {
    MessageSquare,
    Check,
    X,
    Trash2,
    AlertTriangle,
    Eye,
    Clock,
    Filter,
} from "lucide-react";

export default function CommentsPage() {
    const router = useRouter();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("pending"); // Default to pending as it's the main task
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1,
    });
    const [selectedComments, setSelectedComments] = useState([]);

    const fetchComments = async (status = statusFilter, page = 1) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `/api/blog/comments?status=${status}&page=${page}&limit=${pagination.limit}`
            );
            if (data.success) {
                setComments(data.data);
                setPagination(data.pagination);
            }
        } catch (err) {
            toast.error("Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [statusFilter]);

    const handleStatusChange = async (newStatus, commentIds = []) => {
        if (commentIds.length === 0) return;

        try {
            const { data } = await axios.patch("/api/blog/comments", {
                commentIds,
                status: newStatus,
            });

            if (data.success) {
                toast.success(data.message);
                fetchComments();
                setSelectedComments([]);
            }
        } catch (err) {
            toast.error("Failed to update comment status");
        }
    };

    const handleDelete = async (commentIds = []) => {
        if (commentIds.length === 0) return;
        
        if (!confirm("Are you sure you want to permanently delete these comments?")) {
            return;
        }

        try {
            // Use axios.delete with data payload for bulk delete if our API supports it,
            // or loop specifically. Our API implementation supports body for bulk.
            const { data } = await axios.delete("/api/blog/comments", {
                data: { commentIds }
            });

            if (data.success) {
                toast.success("Comments deleted permanently");
                fetchComments();
                setSelectedComments([]);
            }
        } catch (err) {
            toast.error("Failed to delete comments");
        }
    };

    const toggleSelect = (id) => {
        setSelectedComments((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedComments.length === comments.length) {
            setSelectedComments([]);
        } else {
            setSelectedComments(comments.map((c) => c._id));
        }
    };

    const tabs = [
        { id: "pending", label: "Pending", icon: Clock },
        { id: "approved", label: "Approved", icon: Check },
        { id: "spam", label: "Spam", icon: AlertTriangle },
        { id: "trash", label: "Trash", icon: Trash2 },
        { id: "all", label: "All", icon: Filter },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            Comments
                        </h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Manage and moderate user comments
                        </p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-[var(--color-border)]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === tab.id
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]"
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bulk Actions */}
                {selectedComments.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] shadow-sm animate-fade-in">
                        <span className="text-sm font-medium px-2">
                            {selectedComments.length} selected
                        </span>
                        {statusFilter !== "approved" && (
                            <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusChange("approved", selectedComments)}
                                icon={<Check size={14} />}
                            >
                                Approve
                            </Button>
                        )}
                        {statusFilter !== "spam" && (
                            <Button
                                size="sm"
                                variant="warning"
                                onClick={() => handleStatusChange("spam", selectedComments)}
                                icon={<AlertTriangle size={14} />}
                            >
                                Mark Spam
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(selectedComments)}
                            icon={<Trash2 size={14} />}
                        >
                            Delete
                        </Button>
                    </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-[var(--color-text-secondary)]">
                            Loading comments...
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <Card key={comment._id} className="group transition-all hover:shadow-md">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center pt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedComments.includes(comment._id)}
                                            onChange={() => toggleSelect(comment._id)}
                                            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap justify-between items-start gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-[var(--color-text-primary)]">
                                                    {comment.authorName}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-secondary)]">
                                                    {comment.authorEmail}
                                                </div>
                                                {comment.status === "pending" && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        Pending
                                                    </span>
                                                )}
                                                {comment.status === "spam" && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                        Spam
                                                    </span>
                                                )}
                                                {comment.status === "approved" && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        Approved
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatDate(comment.createdAt)}
                                            </div>
                                        </div>

                                        <div className="text-sm text-[var(--color-text-primary)] bg-[var(--color-background-tertiary)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                                            {comment.content}
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-xs text-[var(--color-text-secondary)]">
                                                On post:{" "}
                                                <a 
                                                    href={`/blog/${comment.post?.slug}`} 
                                                    target="_blank" 
                                                    className="font-medium hover:text-[var(--color-primary)] underline"
                                                >
                                                    {comment.post?.title || "Unknown Post"}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                {comment.status !== "approved" && (
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleStatusChange("approved", [comment._id])}
                                                        title="Approve"
                                                    >
                                                        <Check size={16} />
                                                    </Button>
                                                )}
                                                {comment.status !== "spam" && (
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                                        onClick={() => handleStatusChange("spam", [comment._id])}
                                                        title="Mark as Spam"
                                                    >
                                                        <AlertTriangle size={16} />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete([comment._id])}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-[var(--color-card-bg)] rounded-xl border border-dashed border-[var(--color-border)]">
                            <MessageSquare className="mx-auto h-12 w-12 text-[var(--color-text-tertiary)] opacity-20 mb-4" />
                            <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">
                                No comments found
                            </h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                                Try changing the filter status
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ContentWrapper>
    );
}
