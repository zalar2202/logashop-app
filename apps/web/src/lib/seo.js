/**
 * Generate JSON-LD structured data for a Product
 * @param {Object} product - Product document
 * @returns {Object} JSON-LD object
 */
export function generateProductSchema(product) {
    if (!product) return null;

    const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
    const currentPrice = hasDiscount ? product.salePrice : product.basePrice;

    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: product.images?.map((img) => img.url),
        description: product.shortDescription || product.description?.substring(0, 160),
        brand: {
            "@type": "Brand",
            name: product.brand || "LogaShop",
        },
        offers: {
            "@type": "Offer",
            url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
            priceCurrency: "USD",
            price: (currentPrice / 100).toFixed(2),
            availability:
                product.stockQuantity > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
        },
        aggregateRating:
            product.reviewCount > 0
                ? {
                      "@type": "AggregateRating",
                      ratingValue: product.averageRating.toFixed(1),
                      reviewCount: product.reviewCount,
                  }
                : undefined,
    };
}

/**
 * Generate JSON-LD structured data for a Collection/Category
 * @param {Array} products - List of products
 * @param {String} name - Category name
 * @returns {Object} JSON-LD object
 */
export function generateItemListSchema(products, name) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: name,
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
        })),
    };
}
