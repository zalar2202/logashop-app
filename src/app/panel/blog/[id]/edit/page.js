"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { SEOPreview } from "@/components/forms/SEOPreview";
import { Skeleton } from "@/components/common/Skeleton";
import { Badge } from "@/components/common/Badge";
import { MediaPicker } from "@/components/common/MediaPicker";
import {
    Save,
    Send,
    Eye,
    ArrowLeft,
    Upload,
    Trash2,
    Star,
    Pin,
    X,
    ExternalLink,
    Archive,
} from "lucide-react";

export default function EditBlogPostPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    // Post data
    const [postData, setPostData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "",
        tags: [],
        status: "draft",
        featuredImage: {
            url: "",
            alt: "",
            caption: "",
        },
        seo: {
            metaTitle: "",
            metaDescription: "",
            metaKeywords: [],
            focusKeyword: "",
            schema: "",
            ogImage: "",
            noIndex: false,
            noFollow: false,
        },
        isFeatured: false,
        isPinned: false,
        allowComments: true,
        showAuthor: true,
        publishedAt: null,
        viewCount: 0,
        readingTime: 1,
    });

    const [tagInput, setTagInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await axios.get(`/api/blog/posts/${id}`);
                if (data.success) {
                    const post = data.data;
                    setPostData({
                        title: post.title || "",
                        slug: post.slug || "",
                        content: post.content || "",
                        excerpt: post.excerpt || "",
                        category: post.category?._id || post.category || "",
                        tags: post.tags || [],
                        status: post.status || "draft",
                        featuredImage: post.featuredImage || { url: "", alt: "", caption: "" },
                        seo: {
                            metaTitle: post.seo?.metaTitle || "",
                            metaDescription: post.seo?.metaDescription || "",
                            metaKeywords: post.seo?.metaKeywords || [],
                            focusKeyword: post.seo?.focusKeyword || "",
                            schema: post.seo?.schema || "",
                            ogImage: post.seo?.ogImage || "",
                            noIndex: post.seo?.noIndex || false,
                            noFollow: post.seo?.noFollow || false,
                        },
                        isFeatured: post.isFeatured || false,
                        isPinned: post.isPinned || false,
                        allowComments: post.allowComments !== false,
                        showAuthor: post.showAuthor !== false,
                        publishedAt: post.publishedAt,
                        viewCount: post.viewCount || 0,
                        readingTime: post.readingTime || 1,
                    });
                }
            } catch (err) {
                toast.error("Failed to load post");
                router.push("/panel/blog");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, router]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get("/api/blog/categories");
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    // Update field
    const updateField = (field, value) => {
        setPostData((prev) => ({ ...prev, [field]: value }));
    };

    // Update SEO field
    const updateSEOField = (field, value) => {
        setPostData((prev) => ({
            ...prev,
            seo: { ...prev.seo, [field]: value },
        }));
    };

    // Handle tag input
    const handleAddTag = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = tagInput.trim().toLowerCase();
            if (tag && !postData.tags.includes(tag)) {
                setPostData((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tag],
                }));
                if (!postData.seo.metaKeywords.includes(tag)) {
                    updateSEOField("metaKeywords", [...postData.seo.metaKeywords, tag]);
                }
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setPostData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tagToRemove),
        }));
    };

    // Handle keyword input
    const handleAddKeyword = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const keyword = keywordInput.trim();
            if (keyword && !postData.seo.metaKeywords.includes(keyword)) {
                updateSEOField("metaKeywords", [...postData.seo.metaKeywords, keyword]);
            }
            setKeywordInput("");
        }
    };

    const removeKeyword = (keywordToRemove) => {
        updateSEOField(
            "metaKeywords",
            postData.seo.metaKeywords.filter((k) => k !== keywordToRemove)
        );
    };

    // Image upload handler
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "blog");

        try {
            const { data } = await axios.post("/api/media", formData);
            if (data.success) {
                return data.data.url;
            }
            throw new Error(data.error);
        } catch (err) {
            toast.error("Failed to upload image");
            throw err;
        }
    };

    // Handle media selection
    const handleMediaSelect = (media) => {
        setPostData((prev) => ({
            ...prev,
            featuredImage: {
                ...prev.featuredImage,
                url: media.url,
            },
            seo: {
                ...prev.seo,
                ogImage: media.url,
            },
        }));
        toast.success("Featured image selected");
    };

    // Save changes
    const handleSave = async (newStatus = null) => {
        if (!postData.title || !postData.content) {
            toast.error("Title and content are required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...postData,
                status: newStatus || postData.status,
            };

            const { data } = await axios.put(`/api/blog/posts/${id}`, payload);
            if (data.success) {
                toast.success("Post saved successfully");
                if (newStatus) {
                    setPostData((prev) => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to save post");
        } finally {
            setIsSaving(false);
        }
    };

    // Publish post
    const handlePublish = async () => {
        setIsPublishing(true);
        await handleSave("published");
        setIsPublishing(false);
    };

    // Unpublish post
    const handleUnpublish = async () => {
        await handleSave("draft");
    };

    // Archive post
    const handleArchive = async () => {
        await handleSave("archived");
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case "published":
                return "success";
            case "draft":
                return "warning";
            case "scheduled":
                return "info";
            case "archived":
                return "default";
            default:
                return "default";
        }
    };

    if (loading) {
        return (
            <ContentWrapper>
                <Skeleton type="card" />
                <div className="mt-6">
                    <Skeleton type="form" />
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/panel/blog")}
                        icon={<ArrowLeft size={18} />}
                    >
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Edit Post
                            </h1>
                            <Badge variant={getStatusVariant(postData.status)}>
                                {postData.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mt-1">
                            <span>{postData.viewCount} views</span>
                            <span>{postData.readingTime} min read</span>
                            {postData.publishedAt && (
                                <span>
                                    Published: {new Date(postData.publishedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {postData.status === "published" && (
                        <Button
                            variant="secondary"
                            onClick={() => window.open(`/blog/${postData.slug}`, "_blank")}
                            icon={<ExternalLink size={18} />}
                        >
                            View
                        </Button>
                    )}
                    {postData.status !== "archived" && (
                        <Button
                            variant="secondary"
                            onClick={handleArchive}
                            icon={<Archive size={18} />}
                        >
                            Archive
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => handleSave()}
                        loading={isSaving && !isPublishing}
                        icon={<Save size={18} />}
                    >
                        Save
                    </Button>
                    {postData.status !== "published" ? (
                        <Button
                            onClick={handlePublish}
                            loading={isPublishing}
                            icon={<Send size={18} />}
                        >
                            Publish
                        </Button>
                    ) : (
                        <Button
                            variant="warning"
                            onClick={handleUnpublish}
                            loading={isSaving}
                        >
                            Unpublish
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <Card>
                        <input
                            type="text"
                            value={postData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Post Title"
                            className="w-full text-2xl font-bold border-none outline-none bg-transparent"
                            style={{ color: "var(--color-text-primary)" }}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                /blog/
                            </span>
                            <input
                                type="text"
                                value={postData.slug}
                                onChange={(e) => updateField("slug", e.target.value)}
                                placeholder="post-slug"
                                className="flex-1 text-sm border-none outline-none bg-transparent"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                        </div>
                    </Card>

                    {/* Content Editor */}
                    <Card title="Content" className="overflow-visible">
                        <RichTextEditor
                            value={postData.content}
                            onChange={(value) => updateField("content", value)}
                            placeholder="Write your blog post content here..."
                            onImageUpload={handleImageUpload}
                            minHeight={500}
                        />
                    </Card>

                    {/* Excerpt */}
                    <Card title="Excerpt">
                        <textarea
                            value={postData.excerpt}
                            onChange={(e) => updateField("excerpt", e.target.value)}
                            placeholder="A brief summary of your post (shown in blog listings)"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none"
                            style={{ color: "var(--color-text-primary)" }}
                            maxLength={500}
                        />
                        <p
                            className="text-xs mt-1 text-right"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {postData.excerpt.length}/500 characters
                        </p>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Featured Image */}
                    <Card title="Featured Image">
                        {postData.featuredImage.url ? (
                            <div className="relative">
                                <img
                                    src={postData.featuredImage.url}
                                    alt={postData.featuredImage.alt || "Featured"}
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPostData((prev) => ({
                                            ...prev,
                                            featuredImage: { url: "", alt: "", caption: "" },
                                        }))
                                    }
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <input
                                    type="text"
                                    value={postData.featuredImage.alt}
                                    onChange={(e) =>
                                        setPostData((prev) => ({
                                            ...prev,
                                            featuredImage: {
                                                ...prev.featuredImage,
                                                alt: e.target.value,
                                            },
                                        }))
                                    }
                                    placeholder="Alt text for SEO"
                                    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                                />
                            </div>
                        ) : (
                            <div 
                                onClick={() => setShowMediaPicker(true)}
                                className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                            >
                                <Upload
                                    size={32}
                                    className="text-[var(--color-text-secondary)]"
                                />
                                <span className="text-sm text-[var(--color-text-secondary)] mt-2">
                                    Choose from Library
                                </span>
                            </div>
                        )}
                    </Card>

                    <MediaPicker 
                        isOpen={showMediaPicker}
                        onClose={() => setShowMediaPicker(false)}
                        onSelect={handleMediaSelect}
                        allowedType="image"
                        title="Choose Featured Image"
                    />

                    {/* Category */}
                    <Card title="Category">
                        <select
                            value={postData.category}
                            onChange={(e) => updateField("category", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <option value="">Select category...</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </Card>

                    {/* Tags */}
                    <Card title="Tags">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {postData.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-[var(--color-primary)] text-white"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:bg-white/20 rounded-full p-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags (press Enter)"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                            style={{ color: "var(--color-text-primary)" }}
                        />
                    </Card>

                    {/* Post Settings */}
                    <Card title="Settings">
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.isFeatured}
                                    onChange={(e) =>
                                        updateField("isFeatured", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <Star size={16} className="text-yellow-500" />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    Featured Post
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.isPinned}
                                    onChange={(e) => updateField("isPinned", e.target.checked)}
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <Pin size={16} className="text-blue-500" />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    Pin to Top
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.allowComments}
                                    onChange={(e) =>
                                        updateField("allowComments", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    Allow Comments
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.showAuthor}
                                    onChange={(e) =>
                                        updateField("showAuthor", e.target.checked)
                                    }
                                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                                />
                                <span style={{ color: "var(--color-text-primary)" }}>
                                    Show Author Name
                                </span>
                            </label>
                        </div>
                    </Card>

                    {/* SEO Section */}
                    <Card title="SEO Settings">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    value={postData.seo.metaTitle}
                                    onChange={(e) =>
                                        updateSEOField("metaTitle", e.target.value)
                                    }
                                    placeholder={postData.title || "SEO Title"}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                                    maxLength={70}
                                />
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {(postData.seo.metaTitle || postData.title).length}/60
                                    recommended
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    value={postData.seo.metaDescription}
                                    onChange={(e) =>
                                        updateSEOField("metaDescription", e.target.value)
                                    }
                                    placeholder="Brief description for search engines..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] resize-none"
                                    maxLength={160}
                                />
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {postData.seo.metaDescription.length}/160 recommended
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={postData.seo.noIndex}
                                        onChange={(e) =>
                                            updateSEOField("noIndex", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded"
                                    />
                                    <span
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        No Index
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={postData.seo.noFollow}
                                        onChange={(e) =>
                                            updateSEOField("noFollow", e.target.checked)
                                        }
                                        className="w-4 h-4 rounded"
                                    />
                                    <span
                                        className="text-sm"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        No Follow
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Primary Keyword
                                </label>
                                <input
                                    type="text"
                                    value={postData.seo.focusKeyword}
                                    onChange={(e) =>
                                        updateSEOField("focusKeyword", e.target.value)
                                    }
                                    placeholder="Main focus keyword"
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Secondary Keywords
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {postData.seo.metaKeywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                                        >
                                            {keyword}
                                            <button
                                                type="button"
                                                onClick={() => removeKeyword(keyword)}
                                                className="hover:text-red-500 rounded-full p-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={handleAddKeyword}
                                    placeholder="Add keywords (press Enter)"
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Schema JSON-LD
                                </label>
                                <textarea
                                    value={postData.seo.schema}
                                    onChange={(e) =>
                                        updateSEOField("schema", e.target.value)
                                    }
                                    placeholder='{ "@context": "https://schema.org", ... }'
                                    rows={5}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] font-mono text-sm"
                                />
                                <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
                                    Paste your FAQ or other JSON-LD schema here.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* SEO Preview */}
                    <SEOPreview
                        title={postData.title}
                        slug={postData.slug}
                        metaTitle={postData.seo.metaTitle}
                        metaDescription={postData.seo.metaDescription}
                        ogImage={postData.seo.ogImage || postData.featuredImage.url}
                        keywords={postData.seo.metaKeywords}
                        content={postData.content}
                        noIndex={postData.seo.noIndex}
                        noFollow={postData.seo.noFollow}
                    />
                </div>
            </div>
        </ContentWrapper>
    );
}
