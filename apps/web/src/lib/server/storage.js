import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Ensure storage directory exists
const STORAGE_DIR = path.join(process.cwd(), "storage", "digital_products");

const ensureDir = async () => {
    try {
        await fs.access(STORAGE_DIR);
    } catch {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
    }
};

/**
 * Save a file securely to the local filesystem (outside public folder).
 * @param {File} file - The file object from FormData
 * @returns {Promise<string>} - The relative path to the saved file
 */
export async function saveSecureFile(file) {
    await ensureDir();

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename to prevent collisions & guessable names
    const fileExt = path.extname(file.name);
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const safeName = `${uniqueSuffix}${fileExt}`;
    const filePath = path.join(STORAGE_DIR, safeName);

    await fs.writeFile(filePath, buffer);

    return `storage/digital_products/${safeName}`;
}

/**
 * Stream a secure file to the client.
 * @param {string} relativePath - The relative path stored in DB
 * @returns {Promise<ReadableStream>} - File stream
 */
// Actually, Next.js API returns a Response with stream.
// We will just handle the path in the route handler.
// But a helper to get full path is useful.
export function getSecureFilePath(relativePath) {
    return path.join(process.cwd(), relativePath);
}
