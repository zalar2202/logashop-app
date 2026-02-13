"use client";

import { useState } from "react";
import { 
    Search, 
    Globe, 
    CheckCircle, 
    AlertCircle, 
    AlertTriangle,
    Image as ImageIcon,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp
} from "lucide-react";

/**
 * SEO Preview & Analysis Component
 * 
 * Shows a Google-like search result preview and provides
 * SEO recommendations for blog posts.
 */

const SEO_LIMITS = {
    metaTitle: { min: 30, max: 60, optimal: 55 },
    metaDescription: { min: 120, max: 160, optimal: 155 },
    slug: { max: 75 },
    content: { min: 300, optimal: 1000 },
};

export function SEOPreview({
    title = "",
    slug = "",
    metaTitle = "",
    metaDescription = "",
    ogImage = "",
    keywords = [],
    content = "",
    noIndex = false,
    noFollow = false,
    onFieldChange,
    baseUrl = "https://logatech.net",
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState("google"); // google, social

    const displayTitle = metaTitle || title || "Page Title";
    const displayUrl = `${baseUrl}/blog/${slug || "your-post-slug"}`;
    const displayDescription = metaDescription || "Add a meta description to improve your search visibility...";

    // Calculate scores
    const getTitleScore = () => {
        const length = (metaTitle || title).length;
        if (length === 0) return { score: 0, status: "error", message: "Title is required" };
        if (length < SEO_LIMITS.metaTitle.min) return { score: 40, status: "warning", message: `Too short (${length}/${SEO_LIMITS.metaTitle.min} min)` };
        if (length > SEO_LIMITS.metaTitle.max) return { score: 50, status: "warning", message: `Too long (${length}/${SEO_LIMITS.metaTitle.max} max)` };
        return { score: 100, status: "success", message: `Good length (${length} chars)` };
    };

    const getDescriptionScore = () => {
        const length = metaDescription.length;
        if (length === 0) return { score: 0, status: "error", message: "Description is required" };
        if (length < SEO_LIMITS.metaDescription.min) return { score: 40, status: "warning", message: `Too short (${length}/${SEO_LIMITS.metaDescription.min} min)` };
        if (length > SEO_LIMITS.metaDescription.max) return { score: 50, status: "warning", message: `Too long (${length}/${SEO_LIMITS.metaDescription.max} max)` };
        return { score: 100, status: "success", message: `Good length (${length} chars)` };
    };

    const getSlugScore = () => {
        if (!slug) return { score: 0, status: "error", message: "Slug is required" };
        if (slug.length > SEO_LIMITS.slug.max) return { score: 50, status: "warning", message: "Slug is too long" };
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { score: 30, status: "error", message: "Invalid slug format" };
        return { score: 100, status: "success", message: "Good URL structure" };
    };

    const getWordCountScore = () => {
        // Strip HTML tags
        const plainText = content.replace(/<[^>]*>/g, ' ');
        const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
        
        if (wordCount === 0) return { score: 0, status: "error", message: "Content is empty", count: 0 };
        if (wordCount < SEO_LIMITS.content.min) return { score: 40, status: "warning", message: `Too short (${wordCount}/${SEO_LIMITS.content.min} words)`, count: wordCount };
        return { score: 100, status: "success", message: `Good length (${wordCount} words)`, count: wordCount };
    };

    const titleScore = getTitleScore();
    const descriptionScore = getDescriptionScore();
    const slugScore = getSlugScore();
    const wordCountScore = getWordCountScore();

    const overallScore = Math.round((titleScore.score + descriptionScore.score + slugScore.score + wordCountScore.score) / 4);

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "success":
                return <CheckCircle size={16} className="text-green-500" />;
            case "warning":
                return <AlertTriangle size={16} className="text-yellow-500" />;
            case "error":
                return <AlertCircle size={16} className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-background-secondary)] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                        {overallScore}%
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                            SEO Score
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {overallScore >= 80
                                ? "Great! Your post is well optimized"
                                : overallScore >= 50
                                ? "Good, but could be improved"
                                : "Needs improvement"}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp size={20} className="text-[var(--color-text-secondary)]" />
                ) : (
                    <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />
                )}
            </button>

            {isExpanded && (
                <div className="border-t border-[var(--color-border)]">
                    {/* Tabs */}
                    <div className="flex border-b border-[var(--color-border)]">
                        <button
                            type="button"
                            onClick={() => setActiveTab("google")}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === "google"
                                    ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            }`}
                        >
                            <Search size={16} className="inline mr-2" />
                            Google Preview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("social")}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === "social"
                                    ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            }`}
                        >
                            <Globe size={16} className="inline mr-2" />
                            Social Preview
                        </button>
                    </div>

                    <div className="p-4">
                        {activeTab === "google" ? (
                            /* Google Search Preview */
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">L</span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-800">LogaTech</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[300px]">
                                            {displayUrl}
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl text-blue-700 hover:underline cursor-pointer mb-1 line-clamp-1">
                                    {displayTitle}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {displayDescription}
                                </p>
                            </div>
                        ) : (
                            /* Social Media Preview */
                            <div className="bg-[var(--color-background-secondary)] rounded-lg overflow-hidden shadow-sm">
                                {ogImage ? (
                                    <img
                                        src={ogImage}
                                        alt="Social preview"
                                        className="w-full h-40 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-40 bg-[var(--color-background-tertiary)] flex items-center justify-center">
                                        <div className="text-center">
                                            <ImageIcon
                                                size={32}
                                                className="mx-auto text-[var(--color-text-secondary)]"
                                            />
                                            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                                No OG image set
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-3">
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase">
                                        logatech.net
                                    </p>
                                    <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
                                        {displayTitle}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                                        {displayDescription}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SEO Checklist */}
                        <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                SEO Checklist
                            </h4>
                            
                            <div className="flex items-center gap-2 text-sm">
                                {getStatusIcon(titleScore.status)}
                                <span className="text-[var(--color-text-secondary)]">
                                    Title: {titleScore.message}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                                {getStatusIcon(descriptionScore.status)}
                                <span className="text-[var(--color-text-secondary)]">
                                    Description: {descriptionScore.message}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                                {getStatusIcon(slugScore.status)}
                                <span className="text-[var(--color-text-secondary)]">
                                    URL: {slugScore.message}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                {getStatusIcon(wordCountScore.status)}
                                <span className="text-[var(--color-text-secondary)]">
                                    Content: {wordCountScore.message}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                {keywords.length >= 3 ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                ) : (
                                    <AlertTriangle size={16} className="text-yellow-500" />
                                )}
                                <span className="text-[var(--color-text-secondary)]">
                                    Keywords: {keywords.length} tags added ({keywords.length >= 3 ? "Good" : "Add at least 3"})
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                {ogImage ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                ) : (
                                    <AlertTriangle size={16} className="text-yellow-500" />
                                )}
                                <span className="text-[var(--color-text-secondary)]">
                                    OG Image: {ogImage ? "Set" : "Not set (recommended for social sharing)"}
                                </span>
                            </div>
                        </div>

                        {/* Indexing Status */}
                        {(noIndex || noFollow) && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                                    {noIndex ? <EyeOff size={16} /> : <Eye size={16} />}
                                    <span className="text-sm font-medium">
                                        {noIndex && noFollow
                                            ? "This page won't be indexed or followed by search engines"
                                            : noIndex
                                            ? "This page won't be indexed by search engines"
                                            : "Search engines won't follow links on this page"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SEOPreview;
