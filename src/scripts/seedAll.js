/**
 * Seed All Data Script
 *
 * Runs all seed scripts in the correct order.
 *
 * Usage:
 *   node src/scripts/seedAll.js
 *   node src/scripts/seedAll.js --force  (clears existing data first)
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isForce = process.argv.includes("--force");

const scripts = [
    { name: "Admin User", file: "seedAdmin.js" },
    { name: "Categories", file: "seedCategories.js" },
    { name: "Products", file: "seedProducts.js" },
];

async function runScript(scriptPath, name) {
    return new Promise((resolve, reject) => {
        console.log(`\n${"=".repeat(50)}`);
        console.log(`🚀 Running: ${name}`);
        console.log("=".repeat(50));

        const args = [scriptPath];
        if (isForce) args.push("--force");

        const child = spawn("node", args, {
            stdio: "inherit",
            shell: true,
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${name} failed with code ${code}`));
            }
        });

        child.on("error", (error) => {
            reject(error);
        });
    });
}

async function seedAll() {
    console.log("🌱 LogaShop Database Seeder");
    console.log("===========================");

    if (isForce) {
        console.log("⚠️  Force mode enabled - existing data will be cleared!\n");
    }

    for (const script of scripts) {
        const scriptPath = join(__dirname, script.file);
        try {
            await runScript(scriptPath, script.name);
        } catch (error) {
            console.error(`\n❌ Failed at ${script.name}:`, error.message);
            process.exit(1);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ All seeds completed successfully!");
    console.log("=".repeat(50));
    console.log("\n🎉 Your database is ready for development!\n");
}

seedAll();
