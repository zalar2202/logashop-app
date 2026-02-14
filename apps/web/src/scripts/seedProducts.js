/**
 * Seed Products Script
 *
 * Creates sample products for development/testing.
 * Requires categories to be seeded first.
 *
 * Usage:
 *   node src/scripts/seedProducts.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const envPath = join(__dirname, "../../.env.local");
    dotenv.config({ path: envPath });
} catch (error) {
    console.log("ℹ️ Skipping .env.local loading, using environment variables.");
}

import Category from "../models/Category.js";
import Product from "../models/Product.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env.local");
    process.exit(1);
}

/**
 * Generate sample products for a category
 */
function generateProducts(categoryId, categorySlug, count = 5) {
    const productsByCategory = {
        smartphones: [
            {
                name: "iPhone 15 Pro",
                sku: "IP15P-001",
                basePrice: 999,
                description:
                    "Latest Apple flagship smartphone with A17 Pro chip and titanium design.",
                tags: ["apple", "premium", "flagship"],
            },
            {
                name: "Samsung Galaxy S24 Ultra",
                sku: "SGS24U-001",
                basePrice: 1199,
                description: "Samsung's most powerful phone with S Pen and AI features.",
                tags: ["samsung", "android", "flagship"],
            },
            {
                name: "Google Pixel 8 Pro",
                sku: "GP8P-001",
                basePrice: 899,
                description: "Pure Android experience with best-in-class camera.",
                tags: ["google", "android", "camera"],
            },
            {
                name: "OnePlus 12",
                sku: "OP12-001",
                basePrice: 699,
                salePrice: 649,
                description: "Flagship killer with Snapdragon 8 Gen 3.",
                tags: ["oneplus", "android", "value"],
            },
            {
                name: "Xiaomi 14 Pro",
                sku: "XM14P-001",
                basePrice: 799,
                description: "Premium Chinese flagship with Leica optics.",
                tags: ["xiaomi", "android", "leica"],
            },
        ],
        laptops: [
            {
                name: 'MacBook Pro 14"',
                sku: "MBP14-001",
                basePrice: 1999,
                description: "Apple M3 Pro chip, stunning Liquid Retina XDR display.",
                tags: ["apple", "macbook", "pro"],
            },
            {
                name: "Dell XPS 15",
                sku: "DXPS15-001",
                basePrice: 1499,
                description: "InfinityEdge display in a compact design.",
                tags: ["dell", "windows", "ultrabook"],
            },
            {
                name: "ThinkPad X1 Carbon",
                sku: "TPX1C-001",
                basePrice: 1699,
                description: "Business ultrabook with legendary keyboard.",
                tags: ["lenovo", "business", "ultrabook"],
            },
            {
                name: "ASUS ROG Zephyrus G14",
                sku: "ROGZ14-001",
                basePrice: 1599,
                salePrice: 1399,
                description: "Powerful gaming in a portable package.",
                tags: ["asus", "gaming", "portable"],
            },
            {
                name: "HP Spectre x360",
                sku: "HPSX360-001",
                basePrice: 1299,
                description: "Premium 2-in-1 convertible laptop.",
                tags: ["hp", "convertible", "premium"],
            },
        ],
        tablets: [
            {
                name: 'iPad Pro 12.9"',
                sku: "IPADP12-001",
                basePrice: 1099,
                description: "M2 chip, Liquid Retina XDR display.",
                tags: ["apple", "ipad", "pro"],
            },
            {
                name: "Samsung Galaxy Tab S9 Ultra",
                sku: "SGTS9U-001",
                basePrice: 1199,
                description: "Large AMOLED display with S Pen.",
                tags: ["samsung", "android", "premium"],
            },
            {
                name: "iPad Air",
                sku: "IPADA-001",
                basePrice: 599,
                description: "Powerful and versatile tablet.",
                tags: ["apple", "ipad", "value"],
            },
        ],
        "electronics-accessories": [
            {
                name: "AirPods Pro 2",
                sku: "APP2-001",
                basePrice: 249,
                description: "Active noise cancellation and spatial audio.",
                tags: ["apple", "audio", "wireless"],
            },
            {
                name: "Sony WH-1000XM5",
                sku: "SWHXM5-001",
                basePrice: 349,
                salePrice: 299,
                description: "Industry-leading noise cancellation headphones.",
                tags: ["sony", "audio", "headphones"],
            },
            {
                name: "Anker 100W USB-C Charger",
                sku: "ANK100W-001",
                basePrice: 79,
                description: "Compact 4-port fast charger.",
                tags: ["anker", "charger", "usb-c"],
            },
            {
                name: "Logitech MX Master 3S",
                sku: "LMXM3S-001",
                basePrice: 99,
                description: "Advanced wireless mouse for productivity.",
                tags: ["logitech", "mouse", "wireless"],
            },
            {
                name: "Samsung T7 Shield 1TB",
                sku: "ST7S1T-001",
                basePrice: 129,
                description: "Rugged portable SSD with IP65 rating.",
                tags: ["samsung", "storage", "ssd"],
            },
        ],
        furniture: [
            {
                name: "Ergonomic Office Chair",
                sku: "EOC-001",
                basePrice: 399,
                description: "Adjustable lumbar support and breathable mesh.",
                tags: ["office", "ergonomic", "chair"],
            },
            {
                name: "Standing Desk Pro",
                sku: "SDP-001",
                basePrice: 599,
                salePrice: 549,
                description: "Electric height adjustable desk 60x30.",
                tags: ["office", "desk", "standing"],
            },
            {
                name: "Bookshelf 5-Tier",
                sku: "BS5T-001",
                basePrice: 149,
                description: "Modern industrial style bookshelf.",
                tags: ["storage", "bookshelf", "modern"],
            },
        ],
        kitchen: [
            {
                name: "Instant Pot Duo 7-in-1",
                sku: "IPD7-001",
                basePrice: 89,
                description: "Pressure cooker, slow cooker, rice cooker and more.",
                tags: ["instant-pot", "cooking", "appliance"],
            },
            {
                name: "Ninja Blender Pro",
                sku: "NBP-001",
                basePrice: 129,
                salePrice: 99,
                description: "Professional-grade blending for smoothies.",
                tags: ["ninja", "blender", "kitchen"],
            },
            {
                name: "Le Creuset Dutch Oven",
                sku: "LCDO-001",
                basePrice: 380,
                description: "Enameled cast iron for perfect cooking.",
                tags: ["le-creuset", "cookware", "premium"],
            },
        ],
    };

    const defaultProducts = [
        {
            name: `Sample Product 1`,
            sku: `${categorySlug}-001`,
            basePrice: 49.99,
            description: "A sample product for this category.",
            tags: ["sample"],
        },
        {
            name: `Sample Product 2`,
            sku: `${categorySlug}-002`,
            basePrice: 79.99,
            description: "Another sample product.",
            tags: ["sample"],
        },
        {
            name: `Sample Product 3`,
            sku: `${categorySlug}-003`,
            basePrice: 29.99,
            salePrice: 24.99,
            description: "Sample product on sale.",
            tags: ["sample", "sale"],
        },
    ];

    const products = productsByCategory[categorySlug] || defaultProducts;

    return products.map((p, index) => ({
        ...p,
        slug: p.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/-+$/, ""),
        categoryId,
        productType: "physical",
        status: "active",
        isFeatured: index === 0, // First product is featured
        stockQuantity: Math.floor(Math.random() * 100) + 10,
        lowStockThreshold: 5,
        weight: Math.floor(Math.random() * 2000) + 100,
        images: [],
    }));
}

async function seedProducts() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully\n");

        // Check for existing products
        const existingCount = await Product.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} products already exist.`);
            console.log("   Use --force flag to clear and reseed.\n");

            if (process.argv.includes("--force")) {
                console.log("🗑️  Clearing existing products...");
                await Product.deleteMany({});
                console.log("✅ Products cleared\n");
            } else {
                return;
            }
        }

        // Get categories (subcategories only, they have products)
        const categories = await Category.find({ parentId: { $ne: null } });

        if (categories.length === 0) {
            console.log("❌ No subcategories found. Please run seedCategories.js first.");
            return;
        }

        console.log(`📦 Found ${categories.length} subcategories to populate\n`);

        let totalCreated = 0;

        for (const category of categories) {
            const products = generateProducts(category._id, category.slug);

            console.log(`🔄 Creating products for "${category.name}"...`);

            for (const productData of products) {
                try {
                    const product = new Product(productData);
                    await product.save();
                    console.log(`   ✓ ${productData.name} ($${productData.basePrice})`);
                    totalCreated++;
                } catch (error) {
                    if (error.code === 11000) {
                        console.log(`   ⚠ ${productData.name} (already exists, skipped)`);
                    } else {
                        console.log(`   ✗ ${productData.name}: ${error.message}`);
                    }
                }
            }
        }

        console.log(`\n✅ Successfully created ${totalCreated} products!`);

        // Show summary by category
        console.log("\n📊 Products by Category:");
        for (const category of categories) {
            const count = await Product.countDocuments({ categoryId: category._id });
            if (count > 0) {
                console.log(`   ${category.name}: ${count} products`);
            }
        }
    } catch (error) {
        console.error("❌ Error seeding products:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 MongoDB connection closed");
    }
}

seedProducts();
