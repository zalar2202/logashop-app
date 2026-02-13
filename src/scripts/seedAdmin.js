/**
 * Seed Admin User Script
 *
 * This script creates the first admin user in the database.
 * Run this script once after setting up MongoDB connection.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables if not in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    const envPath = join(__dirname, "../../.env.local");
    dotenv.config({ path: envPath });
} catch (error) {
    // In production/docker, env vars are already set
    console.log("ℹ️ Skipping .env.local loading, using environment variables.");
}

// Import User model (must be after env vars are loaded)
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env.local");
    process.exit(1);
}

/**
 * Admin user data
 */
const adminData = {
    name: "Admin User",
    email: "admin@logatech.net",
    password: "Admin@123",
    role: "admin",
    status: "active",
    phone: "+1234567890",
};

/**
 * Seed the admin user
 */
async function seedAdmin() {
    try {
        // Connect to MongoDB
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully\n");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
            console.log("⚠️  Admin user already exists:");
            console.log("   Email:", existingAdmin.email);
            console.log("   Name:", existingAdmin.name);
            console.log("   Role:", existingAdmin.role);
            console.log("\n💡 If you want to reset the admin password, delete the user first.\n");
            return;
        }

        // Create admin user
        console.log("🔄 Creating admin user...");
        const admin = new User(adminData);
        await admin.save();

        console.log("✅ Admin user created successfully!\n");
        console.log("📋 Admin Details:");
        console.log("   Email:", admin.email);
        console.log("   Name:", admin.name);
        console.log("   Role:", admin.role);
        console.log("   Status:", admin.status);
        console.log("   ID:", admin._id);
        console.log("\n🔐 Login Credentials:");
        console.log("   Email:", adminData.email);
        console.log("   Password:", adminData.password);
        console.log("\n✨ You can now login to the admin panel!\n");
    } catch (error) {
        console.error("❌ Error seeding admin user:", error.message);
        if (error.code === 11000) {
            console.error("   Duplicate key error: Admin user already exists");
        }
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed");
    }
}

// Run the seed function
seedAdmin();
