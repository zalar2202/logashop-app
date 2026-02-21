/**
 * POST /api/manager/db/seed
 * Run a specific seed script (manager only).
 * Body: { script: "admin"|"manager"|"users"|"categories"|"products"|"tags"|"shippingzones" }
 */

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getAuthenticatedUser } from "@/lib/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCRIPT_MAP = {
    admin: "seedAdmin.js",
    manager: "seedManager.js",
    users: "seedUsers.js",
    categories: "seedCategories.js",
    products: "seedProducts.js",
    tags: "seedTags.js",
    shippingzones: "seedShippingZones.js",
};

export async function POST(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Manager access required" }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const script = body?.script?.toLowerCase();

        if (!script || !SCRIPT_MAP[script]) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid script. Use one of: ${Object.keys(SCRIPT_MAP).join(", ")}`,
                },
                { status: 400 }
            );
        }

        const scriptFile = SCRIPT_MAP[script];
        const webRoot = join(__dirname, "../../../../../../");
        const scriptPath = join(webRoot, "src", "scripts", scriptFile);

        const result = await new Promise((resolve) => {
            const child = spawn("node", [scriptPath], {
                cwd: webRoot,
                stdio: ["ignore", "pipe", "pipe"],
            });

            let stdout = "";
            let stderr = "";
            child.stdout?.on("data", (d) => { stdout += d.toString(); });
            child.stderr?.on("data", (d) => { stderr += d.toString(); });

            child.on("close", (code) => {
                resolve({
                    success: code === 0,
                    code,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                });
            });

            child.on("error", (err) => {
                resolve({
                    success: false,
                    error: err.message,
                    stderr: err.message,
                });
            });
        });

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.stderr || result.error || `Script exited with code ${result.code}`,
                    detail: result.stdout,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${script}`,
            detail: result.stdout || undefined,
        });
    } catch (error) {
        console.error("[seed API]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Seed failed" },
            { status: 500 }
        );
    }
}
