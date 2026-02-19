/**
 * Seed Default Shipping Zones
 *
 * Run: node src/scripts/seedShippingZones.js
 * Use --force to drop existing zones and recreate.
 *
 * Creates three zones:
 *   1. Domestic US (default) — standard, express, overnight, pickup
 *   2. US Remote (AK, HI) — standard, express (higher rates)
 *   3. International — standard, express (international rates)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env.local") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URI not found in environment variables");
    process.exit(1);
}

// Inline schema to avoid Next.js module resolution issues in scripts
const ShippingMethodSchema = new mongoose.Schema(
    {
        methodId: { type: String, required: true },
        label: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        price: { type: Number, required: true, min: 0 },
        freeThreshold: { type: Number, default: null },
        estimatedDays: { type: String, trim: true, default: "" },
        isActive: { type: Boolean, default: true },
    },
    { _id: false }
);

const ShippingZoneSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        countries: [{ type: String, uppercase: true, trim: true }],
        states: [{ type: String, uppercase: true, trim: true }],
        methods: [ShippingMethodSchema],
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const ShippingZone =
    mongoose.models.ShippingZone || mongoose.model("ShippingZone", ShippingZoneSchema);

const DEFAULT_ZONES = [
    {
        name: "Domestic US (Contiguous)",
        countries: ["US"],
        states: [], // all states except AK, HI (those are handled by Remote zone which has higher priority)
        methods: [
            {
                methodId: "standard",
                label: "Standard Shipping",
                description: "Delivered in 5-7 business days",
                price: 499,
                freeThreshold: 5000,
                estimatedDays: "5-7 business days",
                isActive: true,
            },
            {
                methodId: "express",
                label: "Express Shipping",
                description: "Delivered in 2-3 business days",
                price: 999,
                freeThreshold: null,
                estimatedDays: "2-3 business days",
                isActive: true,
            },
            {
                methodId: "overnight",
                label: "Overnight Shipping",
                description: "Next business day delivery",
                price: 1999,
                freeThreshold: null,
                estimatedDays: "Next business day",
                isActive: true,
            },
            {
                methodId: "pickup",
                label: "Store Pickup",
                description: "Pick up at our location — free",
                price: 0,
                freeThreshold: null,
                estimatedDays: "Same day",
                isActive: true,
            },
        ],
        isDefault: true,
        isActive: true,
        sortOrder: 10,
    },
    {
        name: "US Remote (AK, HI)",
        countries: ["US"],
        states: ["AK", "HI"],
        methods: [
            {
                methodId: "standard",
                label: "Standard Shipping",
                description: "Delivered in 7-14 business days",
                price: 999,
                freeThreshold: 7500,
                estimatedDays: "7-14 business days",
                isActive: true,
            },
            {
                methodId: "express",
                label: "Express Shipping",
                description: "Delivered in 3-5 business days",
                price: 1999,
                freeThreshold: null,
                estimatedDays: "3-5 business days",
                isActive: true,
            },
        ],
        isDefault: false,
        isActive: true,
        sortOrder: 5, // Higher priority (lower number) than generic US
    },
    {
        name: "Canada",
        countries: ["CA"],
        states: [],
        methods: [
            {
                methodId: "standard",
                label: "Standard International",
                description: "Delivered in 10-15 business days",
                price: 1499,
                freeThreshold: 10000,
                estimatedDays: "10-15 business days",
                isActive: true,
            },
            {
                methodId: "express",
                label: "Express International",
                description: "Delivered in 5-7 business days",
                price: 2999,
                freeThreshold: null,
                estimatedDays: "5-7 business days",
                isActive: true,
            },
        ],
        isDefault: false,
        isActive: true,
        sortOrder: 20,
    },
    {
        name: "International (Rest of World)",
        countries: [], // no specific countries — this is paired with isDefault behavior
        states: [],
        methods: [
            {
                methodId: "standard",
                label: "International Standard",
                description: "Delivered in 15-25 business days",
                price: 2499,
                freeThreshold: 15000,
                estimatedDays: "15-25 business days",
                isActive: true,
            },
            {
                methodId: "express",
                label: "International Express",
                description: "Delivered in 7-12 business days",
                price: 4999,
                freeThreshold: null,
                estimatedDays: "7-12 business days",
                isActive: true,
            },
        ],
        isDefault: false,
        isActive: true,
        sortOrder: 100,
    },
];

async function seedShippingZones() {
    const force = process.argv.includes("--force");

    try {
        await mongoose.connect(MONGO_URI);
        console.log("📦 Connected to MongoDB");

        const existingCount = await ShippingZone.countDocuments();

        if (existingCount > 0 && !force) {
            console.log(
                `⚠️  ${existingCount} shipping zone(s) already exist. Use --force to recreate.`
            );
            process.exit(0);
        }

        if (force) {
            await ShippingZone.deleteMany({});
            console.log("🗑️  Cleared existing shipping zones");
        }

        const created = await ShippingZone.insertMany(DEFAULT_ZONES);
        console.log(`✅ Created ${created.length} shipping zones:`);
        created.forEach((z) => {
            const methodCount = z.methods.length;
            const countries = z.countries.length > 0 ? z.countries.join(", ") : "Fallback";
            const states = z.states.length > 0 ? ` (${z.states.join(", ")})` : "";
            const def = z.isDefault ? " [DEFAULT]" : "";
            console.log(`   • ${z.name} — ${countries}${states} — ${methodCount} methods${def}`);
        });
    } catch (error) {
        console.error("❌ Seed error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("📦 Disconnected from MongoDB");
    }
}

seedShippingZones();
