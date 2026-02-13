/**
 * Seed Manager User Script
 *
 * This script creates a manager user in the database.
 * Run this script when you need a manager account with manager role.
 *
 * Usage:
 *   node src/scripts/seedManager.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env.local") });

// Import User model (must be after env vars are loaded)
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env.local");
    process.exit(1);
}

/**
 * Manager user data
 */
const managerData = {
    name: "Manager User",
    email: "manager@logatech.net",
    password: "Manager@123",
    role: "manager",
    status: "active",
    phone: "+1234567891",
};

/**
 * Seed the manager user
 */
async function seedManager() {
    try {
        // Connect to MongoDB
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully\n");

        // Check if manager already exists
        const existingManager = await User.findOne({ email: managerData.email });

        if (existingManager) {
            console.log("⚠️  Manager user already exists:");
            console.log("   Email:", existingManager.email);
            console.log("   Name:", existingManager.name);
            console.log("   Role:", existingManager.role);
            console.log("\n💡 If you want to reset the manager password, delete the user first.\n");
            return;
        }

        // Create manager user
        console.log("🔄 Creating manager user...");
        const manager = new User(managerData);
        await manager.save();

        console.log("✅ Manager user created successfully!\n");
        console.log("📋 Manager Details:");
        console.log("   Email:", manager.email);
        console.log("   Name:", manager.name);
        console.log("   Role:", manager.role);
        console.log("   Status:", manager.status);
        console.log("   ID:", manager._id);
        console.log("\n🔐 Login Credentials:");
        console.log("   Email:", managerData.email);
        console.log("   Password:", managerData.password);
        console.log("\n✨ You can now login with the manager account!\n");
    } catch (error) {
        console.error("❌ Error seeding manager user:", error.message);
        if (error.code === 11000) {
            console.error("   Duplicate key error: Manager user already exists");
        }
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed");
    }
}

// Run the seed function
seedManager();
