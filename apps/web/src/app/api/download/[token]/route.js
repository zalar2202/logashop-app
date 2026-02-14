import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import DigitalDelivery from "@/models/DigitalDelivery";
import dbConnect from "@/lib/mongodb";
// import { createReadStream } from "fs"; // Use for streaming if needed

// Force Node.js runtime for file system access
export const runtime = "nodejs";

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { token } = await params;

        const delivery = await DigitalDelivery.findOne({ downloadToken: token });

        if (!delivery) {
            return new NextResponse("Invalid download link", { status: 404 });
        }

        if (!delivery.isValid()) {
            return new NextResponse("Download link expired or limit reached", { status: 403 });
        }

        // Increment count
        delivery.downloadCount += 1;
        await delivery.save();

        // Resolve secure file path
        // delivery.fileUrl should be relative path: "storage/digital_products/xxx.zip"
        const filePath = path.join(process.cwd(), delivery.fileUrl);

        try {
            await fs.access(filePath);
        } catch {
            console.error(`File missing at ${filePath}`);
            return new NextResponse("File resource not found", { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const stats = await fs.stat(filePath);

        // Determine content type extension
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            ".zip": "application/zip",
            ".pdf": "application/pdf",
            ".epub": "application/epub+zip",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".mp3": "audio/mpeg",
            ".mp4": "video/mp4",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${delivery.fileName || "download"}${path.extname(delivery.fileName) ? "" : ext}"`,
                "Content-Length": stats.size.toString(),
            },
        });
    } catch (error) {
        console.error("Download error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
