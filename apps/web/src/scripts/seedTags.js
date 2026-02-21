/**
 * Seed Tags Script
 *
 * Populates the Tag collection from existing product tags.
 * Run after products exist to enable tag autocomplete.
 *
 * Usage:
 *   node src/scripts/seedTags.js
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

import Product from "../models/Product.js";
import Tag from "../models/Tag.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env.local");
    process.exit(1);
}

async function seedTags() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected\n");

        const products = await Product.find({}, "tags").lean();
        const allTags = new Set();
        products.forEach((p) => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach((t) => {
                    const normalized = Tag.normalizeName(t);
                    if (normalized) allTags.add(normalized);
                });
            }
        });

        const tagArray = [...allTags];
        if (tagArray.length === 0) {
            console.log("ℹ️ No tags found in products. Create products with tags first.");
            process.exit(0);
            return;
        }

        // Migrate legacy tags (no postType) to product
        await Tag.updateMany(
            { postType: { $exists: false } },
            { $set: { postType: "product" } }
        );

        await Tag.syncTags(tagArray, "product");
        console.log(`✅ Synced ${tagArray.length} tags: ${tagArray.slice(0, 10).join(", ")}${tagArray.length > 10 ? "..." : ""}\n`);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
        process.exit(0);
    }
}

seedTags();
