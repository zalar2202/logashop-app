import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

/**
 * File Upload API Route
 *
 * POST /api/upload
 *
 * Handles file uploads with validation and returns file information
 * Supports FormData with 'file' field and optional 'category' field
 *
 * Categories: avatars (default), receipts, documents
 */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const category = formData.get("category") || "avatars";
        const oldFilename = formData.get("oldFilename") || null; // For updates

        // Validate file exists
        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No file provided",
                },
                { status: 400 }
            );
        }

        // Validate category
        const allowedCategories = ["avatars", "receipts", "documents", "products", "categories"];
        if (!allowedCategories.includes(category)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid category. Allowed: ${allowedCategories.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Upload file using storage strategy
        const result = await uploadFile(file, category, oldFilename);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.error || "File upload failed",
                },
                { status: 400 }
            );
        }

        // Return success response with file information
        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            data: {
                filename: result.filename,
                url: result.url,
                path: result.path,
            },
        });
    } catch (error) {
        console.error("Upload API error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "File upload failed",
            },
            { status: 500 }
        );
    }
}
