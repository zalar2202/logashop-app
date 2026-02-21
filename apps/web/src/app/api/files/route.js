import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getFile, getContentType } from "@/lib/storage";

/** Map category to public fallback subpath (for legacy files in public/assets/storage) */
const PUBLIC_FALLBACK = {
    avatars: "users/avatars",
    receipts: "payments/receipts",
    documents: "documents",
    products: "products",
    categories: "categories",
};

/**
 * File Serving API Route
 *
 * GET /api/files?category=avatars&filename=uuid.ext
 *
 * Serves stored files (avatars, receipts, documents) with proper Content-Type.
 * Primary: reads from storage/ (per lib/storage)
 * Fallback: public/assets/storage/ (for legacy or manually placed files)
 *
 * Security: Filename is validated to prevent path traversal.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category") || "avatars";
        const filename = searchParams.get("filename");

        if (!filename) {
            return NextResponse.json(
                { success: false, error: "Missing filename parameter" },
                { status: 400 }
            );
        }

        // Prevent path traversal - filename must be a simple name (no /, \, or ..)
        const sanitized = filename.replace(/[/\\]/g, "").split("..").join("");
        if (sanitized !== filename) {
            return NextResponse.json(
                { success: false, error: "Invalid filename" },
                { status: 400 }
            );
        }

        const allowedCategories = ["avatars", "receipts", "documents", "products", "categories"];
        if (!allowedCategories.includes(category)) {
            return NextResponse.json(
                { success: false, error: "Invalid category" },
                { status: 400 }
            );
        }

        let result = await getFile(filename, category);

        // Fallback: try public/assets/storage if storage returns not found
        if (!result.success && PUBLIC_FALLBACK[category]) {
            const subDir = PUBLIC_FALLBACK[category];
            const publicPath = path.join(process.cwd(), "public", "assets", "storage", subDir, filename);
            if (fs.existsSync(publicPath)) {
                const stream = fs.createReadStream(publicPath);
                result = {
                    success: true,
                    stream,
                    contentType: getContentType(filename),
                };
            }
        }

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "File not found" },
                { status: 404 }
            );
        }

        // Stream the file with proper headers
        return new NextResponse(result.stream, {
            headers: {
                "Content-Type": result.contentType || getContentType(filename),
                "Cache-Control": "public, max-age=86400, immutable",
            },
        });
    } catch (error) {
        console.error("[api/files] Error serving file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to serve file" },
            { status: 500 }
        );
    }
}
