import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { Star, ArrowRight } from "lucide-react";

async function getRelatedProducts(categoryId, excludeId) {
    if (!categoryId) return [];

    await dbConnect();
    const products = await Product.find({
        categoryId,
        _id: { $ne: excludeId },
        status: "active",
    })
        .populate("categoryId", "name slug")
        .limit(4)
        .lean();

    return JSON.parse(JSON.stringify(products));
}

export default async function RelatedProducts({ categoryId, currentProductId }) {
    const products = await getRelatedProducts(categoryId, currentProductId);

    if (products.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Related Products</h2>
                <Link
                    href={`/categories/${products[0]?.categoryId?.slug || ""}`}
                    className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 hover:underline"
                >
                    View All <ArrowRight size={16} />
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => {
                    const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
                    const displayPrice = hasDiscount ? product.salePrice : product.basePrice;
                    const primaryImage =
                        product.images?.find((img) => img.isPrimary)?.url ||
                        product.images?.[0]?.url;

                    return (
                        <Link
                            key={product._id}
                            href={`/products/${product.slug}`}
                            className="group bg-white rounded-xl overflow-hidden border border-[var(--color-border)] hover:shadow-lg transition-all duration-300"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                {primaryImage ? (
                                    <img
                                        src={primaryImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                {hasDiscount && (
                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        -
                                        {Math.round(
                                            (1 - product.salePrice / product.basePrice) * 100
                                        )}
                                        %
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-[var(--color-text-primary)] line-clamp-2 min-h-[2.5rem] group-hover:text-[var(--color-primary)] transition">
                                    {product.name}
                                </h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-lg font-bold text-[var(--color-primary)]">
                                        ${(displayPrice / 100).toFixed(2)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-sm text-[var(--color-text-secondary)] line-through">
                                            ${(product.basePrice / 100).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
