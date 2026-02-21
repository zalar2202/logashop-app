/**
 * POST /api/manager/db/seed-all
 * Run all seed scripts in order (manager only).
 */

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getAuthenticatedUser } from "@/lib/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function POST(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "manager") {
            return NextResponse.json({ success: false, error: "Manager access required" }, { status: 403 });
        }

        const webRoot = join(__dirname, "../../../../../../");
        const scriptPath = join(webRoot, "src", "scripts", "seedAll.js");

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
            message: "All seeds completed",
            detail: result.stdout || undefined,
        });
    } catch (error) {
        console.error("[seed-all API]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Seed all failed" },
            { status: 500 }
        );
    }
}
