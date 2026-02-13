import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { saveSecureFile } from "@/lib/server/storage";

export async function POST(req) {
    try {
        const user = await verifyAuth(req).catch(() => null);

        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, error: "Unauthorized access" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type (basic check)
        const allowedTypes = [
            "application/zip",
            "application/x-zip-compressed",
            "application/pdf",
            "application/epub+zip",
            "audio/mpeg",
            "video/mp4",
            "image/jpeg",
            "image/png",
            // Add other common digital goods formats
        ];

        // Optional: strict type check if needed. For now allow any non-executables?
        // Let's just allow generic safe types.

        // Save file securely
        const relativePath = await saveSecureFile(file);

        return NextResponse.json({
            success: true,
            filePath: relativePath,
            fileName: file.name,
            fileSize: file.size,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { success: false, error: "Upload failed: " + error.message },
            { status: 500 }
        );
    }
}
