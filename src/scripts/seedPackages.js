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
    console.log("ℹ️ Skipping .env.local loading");
}

import Package from "../models/Package.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined");
    process.exit(1);
}

const seedData = [
    // Design Packages
    {
        name: "Personal / Portfolio",
        category: "design",
        startingPrice: "$800",
        priceRange: "$800 – $1,500",
        features: ["Custom UI Design", "Responsive Layout", "Basic SEO", "Contact Form"],
        deliveryTime: "1-2 weeks",
        revisions: "2 Rounds",
        order: 1
    },
    {
        name: "Business Brochure",
        category: "design",
        startingPrice: "$1,200",
        priceRange: "$1,200 – $2,500",
        features: ["Professional UI/UX", "Brand Integration", "Social Media Setup", "Content Migration"],
        deliveryTime: "2-3 weeks",
        revisions: "3 Rounds",
        order: 2
    },
    {
        name: "E-commerce / WooCommerce",
        category: "design",
        startingPrice: "$2,000",
        priceRange: "$2,000 – $4,000",
        features: ["Product Focus UX", "Payment Integration", "Inventory Management", "User Accounts"],
        deliveryTime: "3-5 weeks",
        revisions: "3 Rounds",
        order: 3
    },
    {
        name: "Custom Web Application",
        category: "design",
        startingPrice: "$3,000",
        priceRange: "$3,000 – $8,000+",
        features: ["Complex Dashboards", "Interactive Data", "Scalable Systems", "Dedicated Support"],
        deliveryTime: "Custom",
        revisions: "Iterative",
        order: 4
    },
    // Development Packages
    {
        name: "Marketing / Landing Page",
        category: "development",
        startingPrice: "$1,000",
        priceRange: "$1,000 – $2,500",
        features: ["React/Next.js Build", "High Performance", "SEO Optimized", "Analytics Setup"],
        deliveryTime: "1 week",
        revisions: "2 Rounds",
        order: 1
    },
    {
        name: "Custom Content Site (CMS)",
        category: "development",
        startingPrice: "$2,500",
        priceRange: "$2,500 – $5,000",
        features: ["Headless CMS", "Dynamic Content", "Multi-language Support", "Fast Load Times"],
        deliveryTime: "3 weeks",
        revisions: "3 Rounds",
        order: 2
    },
    {
        name: "Web Application (MVP)",
        category: "development",
        startingPrice: "$5,000",
        priceRange: "$5,000 – $10,000",
        features: ["Custom Architecture", "User Authentication", "API Integrations", "Database Design"],
        deliveryTime: "1-2 months",
        revisions: "Continuous",
        order: 3
    },
    // Maintenance Packages
    {
        name: "Essential Support",
        category: "maintenance",
        startingPrice: "$100",
        priceRange: "per month",
        features: ["Security Monitoring", "Daily Backups", "Health Report", "Plugin Updates"],
        deliveryTime: "Monthly",
        revisions: "N/A",
        order: 1
    },
    {
        name: "Professional Support",
        category: "maintenance",
        startingPrice: "$250",
        priceRange: "per month",
        features: ["1h Dev Support", "Priority Response", "Performance Tuning", "Deep Backups"],
        deliveryTime: "Monthly",
        revisions: "N/A",
        order: 2
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Package.deleteMany({});
        console.log('🗑️ Cleared existing packages');

        await Package.insertMany(seedData);
        console.log('✨ Seeded base packages successfully');

    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seed();
