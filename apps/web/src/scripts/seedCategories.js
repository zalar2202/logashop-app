/**
 * Seed Categories Script
 *
 * Creates sample categories for development/testing.
 *
 * Usage:
 *   node src/scripts/seedCategories.js
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

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env.local");
    process.exit(1);
}

/**
 * Sample categories data
 */
const categoriesData = [
    // Parent Categories
    {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and gadgets",
        isActive: true,
        sortOrder: 1,
    },
    {
        name: "Clothing",
        slug: "clothing",
        description: "Fashion and apparel",
        isActive: true,
        sortOrder: 2,
    },
    {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Home improvement and garden supplies",
        isActive: true,
        sortOrder: 3,
    },
    {
        name: "Sports & Outdoors",
        slug: "sports-outdoors",
        description: "Sports equipment and outdoor gear",
        isActive: true,
        sortOrder: 4,
    },
    {
        name: "Books & Media",
        slug: "books-media",
        description: "Books, movies, music, and games",
        isActive: true,
        sortOrder: 5,
    },
];

/**
 * Subcategories (will be linked to parent after creation)
 */
const subCategoriesData = [
    // Electronics subcategories
    { name: "Smartphones", slug: "smartphones", parentSlug: "electronics", sortOrder: 1 },
    { name: "Laptops", slug: "laptops", parentSlug: "electronics", sortOrder: 2 },
    { name: "Tablets", slug: "tablets", parentSlug: "electronics", sortOrder: 3 },
    {
        name: "Accessories",
        slug: "electronics-accessories",
        parentSlug: "electronics",
        sortOrder: 4,
    },

    // Clothing subcategories
    { name: "Men's Clothing", slug: "mens-clothing", parentSlug: "clothing", sortOrder: 1 },
    { name: "Women's Clothing", slug: "womens-clothing", parentSlug: "clothing", sortOrder: 2 },
    { name: "Kids' Clothing", slug: "kids-clothing", parentSlug: "clothing", sortOrder: 3 },
    { name: "Shoes", slug: "shoes", parentSlug: "clothing", sortOrder: 4 },

    // Home & Garden subcategories
    { name: "Furniture", slug: "furniture", parentSlug: "home-garden", sortOrder: 1 },
    { name: "Kitchen", slug: "kitchen", parentSlug: "home-garden", sortOrder: 2 },
    { name: "Decor", slug: "decor", parentSlug: "home-garden", sortOrder: 3 },
    { name: "Garden Tools", slug: "garden-tools", parentSlug: "home-garden", sortOrder: 4 },
];

async function seedCategories() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully\n");

        // Check if categories already exist
        const existingCount = await Category.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} categories already exist.`);
            console.log("   Use --force flag to clear and reseed.\n");

            if (process.argv.includes("--force")) {
                console.log("🗑️  Clearing existing categories...");
                await Category.deleteMany({});
                console.log("✅ Categories cleared\n");
            } else {
                return;
            }
        }

        // Create parent categories
        console.log("🔄 Creating parent categories...");
        const createdParents = {};

        for (const catData of categoriesData) {
            const category = new Category(catData);
            await category.save();
            createdParents[catData.slug] = category;
            console.log(`   ✓ ${catData.name}`);
        }

        // Create subcategories
        console.log("\n🔄 Creating subcategories...");

        for (const subData of subCategoriesData) {
            const parent = createdParents[subData.parentSlug];
            if (parent) {
                const subcategory = new Category({
                    name: subData.name,
                    slug: subData.slug,
                    parentId: parent._id,
                    isActive: true,
                    sortOrder: subData.sortOrder,
                });
                await subcategory.save();
                console.log(`   ✓ ${subData.name} (under ${parent.name})`);
            }
        }

        const totalCategories = await Category.countDocuments();
        console.log(`\n✅ Successfully created ${totalCategories} categories!`);
        console.log("\n📋 Category Summary:");
        console.log(`   Parent categories: ${categoriesData.length}`);
        console.log(`   Subcategories: ${subCategoriesData.length}`);
    } catch (error) {
        console.error("❌ Error seeding categories:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 MongoDB connection closed");
    }
}

seedCategories();
