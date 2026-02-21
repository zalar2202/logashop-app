import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import {
    Star,
    Truck,
    Shield,
    ArrowLeft,
    Heart,
    Share2,
    Minus,
    Plus,
    Check,
    Download,
} from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import ProductImageGallery from "./ProductImageGallery";
import RelatedProducts from "./RelatedProducts";
import ProductReviews from "./ProductReviews";
import WishlistToggle from "./WishlistToggle";
import Rating from "@/components/products/Rating";
import { generateProductSchema } from "@/lib/seo";

// Fetch product by slug
async function getProduct(slug) {
    await dbConnect();
    const product = await Product.findOne({ slug, status: "active" })
        .populate("categoryId", "name slug ancestors")
        .lean();

    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
}

// Fetch product variants
async function getVariants(productId) {
    await dbConnect();
    const variants = await ProductVariant.find({ productId, isActive: true }).lean();
    return JSON.parse(JSON.stringify(variants));
}

// Generate metadata
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: "Product Not Found" };

    return {
        title: product.metaTitle || product.name,
        description:
            product.metaDescription ||
            product.shortDescription ||
            product.description?.substring(0, 160),
        openGraph: {
            title: product.name,
            description: product.shortDescription,
            images: product.images?.filter((img) => img.url).map((img) => img.url),
        },
    };
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const variants = await getVariants(product._id);
    const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
    const displayPrice = hasDiscount ? product.salePrice : product.basePrice;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.salePrice / product.basePrice) * 100)
        : 0;

    // Build breadcrumb from category ancestors
    const breadcrumbs = [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        ...(product.categoryId?.ancestors || []).map((a) => ({
            name: a.name,
            href: `/categories/${a.slug}`,
        })),
        product.categoryId && {
            name: product.categoryId.name,
            href: `/categories/${product.categoryId.slug}`,
        },
    ].filter(Boolean);

    return (
        <div className="py-6">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductSchema(product)) }}
            />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm text-[var(--color-text-secondary)] mb-6 flex items-center gap-2 overflow-x-auto">
                    {breadcrumbs.map((item, i) => (
                        <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                            <Link href={item.href} className="hover:text-[var(--color-primary)]">
                                {item.name}
                            </Link>
                            {i < breadcrumbs.length - 1 && <span>/</span>}
                        </span>
                    ))}
                </nav>

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
                    {/* Image Gallery */}
                    <ProductImageGallery images={product.images || []} productName={product.name} />

                    {/* Product Info */}
                    <div>
                        {/* Category & Brand */}
                        <div className="flex items-center gap-4 mb-2">
                            {product.categoryId && (
                                <Link
                                    href={`/categories/${product.categoryId.slug}`}
                                    className="text-sm text-[var(--color-primary)] hover:underline"
                                >
                                    {product.categoryId.name}
                                </Link>
                            )}
                            {product.brand && (
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                    {product.brand}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.reviewCount >= 0 && (
                            <div className="mb-4">
                                <Rating
                                    value={product.averageRating || 0}
                                    count={product.reviewCount}
                                    size={18}
                                />
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-bold text-[var(--color-primary)]">
                                ${(displayPrice / 100).toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-xl text-[var(--color-text-secondary)] line-through">
                                        ${(product.basePrice / 100).toFixed(2)}
                                    </span>
                                    <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                                        -{discountPercent}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <p className="text-[var(--color-text-secondary)] mb-6">
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.productType === "digital" ? (
                                <span className="flex items-center gap-2 text-green-700">
                                    <Download size={18} />
                                    Instant Access
                                </span>
                            ) : product.stockQuantity > 0 ? (
                                <span className="flex items-center gap-2 text-green-700">
                                    <Check size={18} />
                                    In Stock ({product.stockQuantity} available)
                                </span>
                            ) : product.allowBackorder ? (
                                <span className="flex items-center gap-2 text-yellow-600">
                                    <Check size={18} />
                                    Available for Backorder
                                </span>
                            ) : (
                                <span className="text-red-500">Out of Stock</span>
                            )}
                        </div>

                        {/* Add to Cart Section (Client Component) */}
                        <AddToCartButton product={product} variants={variants} />

                        {/* Wishlist & Share */}
                        <div className="mt-4">
                            <WishlistToggle productId={product._id} productName={product.name} />
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                                    {product.productType === "digital" ? (
                                        <Download
                                            size={20}
                                            className="text-[var(--color-primary)]"
                                        />
                                    ) : (
                                        <Truck size={20} className="text-[var(--color-primary)]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {product.productType === "digital"
                                            ? "Instant Download"
                                            : "Free Shipping"}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {product.productType === "digital"
                                            ? "Sent via email"
                                            : "On orders over $50"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                                    <Shield size={20} className="text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Secure Checkout</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        SSL encrypted
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                    Tags:{" "}
                                </span>
                                <div className="inline-flex flex-wrap gap-2 mt-1">
                                    {product.tags.map((tag, i) => (
                                        <Link
                                            key={i}
                                            href={`/products?search=${encodeURIComponent(tag)}`}
                                            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition"
                                        >
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Reviews & Description Section */}
                <div className="bg-white rounded-xl border border-[var(--color-border)] mb-12 overflow-hidden">
                    <div className="p-8 space-y-12">
                        {/* Description Section */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                Description
                            </h3>
                            <div
                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed product-description-content"
                                dangerouslySetInnerHTML={{
                                    __html: product.description?.includes("<")
                                        ? product.description
                                        : (product.description || "").replace(/\n/g, "<br>"),
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[var(--color-border)]" />

                        {/* Reviews Section */}
                        <div id="reviews">
                            <ProductReviews
                                productId={product._id}
                                initialCount={product.reviewCount}
                            />
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <RelatedProducts
                    categoryId={product.categoryId?._id}
                    currentProductId={product._id}
                />
            </div>
        </div>
    );
}
