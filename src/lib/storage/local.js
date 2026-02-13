import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Local Filesystem Storage Strategy
 * For development and VPS/dedicated server deployments
 * 
 * ⚠️ WARNING: Does NOT work on serverless platforms (Vercel, Netlify)
 * Use cloud storage (Cloudinary, S3, Vercel Blob) for serverless deployments
 */

// Storage configuration
const STORAGE_CONFIG = {
    baseDir: 'storage', // Moved outside public for better standalone support
    avatars: 'users/avatars',
    receipts: 'payments/receipts',
    documents: 'documents',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    allowedDocumentTypes: [
        'application/pdf', 
        'application/zip', 
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'video/mp4',
        'video/webm'
    ],
};

/**
 * Ensure directory exists, create if it doesn't
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.log(`[STORAGE DEBUG] Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalFilename) {
    const ext = getFileExtension(originalFilename);
    return `${uuidv4()}${ext}`;
}

/**
 * Get Content-Type for file serving
 */
export function getContentType(filename) {
    const ext = getFileExtension(filename);
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.rar': 'application/vnd.rar',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Validate file type and size
 */
export function validateFile(file, category = 'image') {
    const errors = [];

    // Check file size
    if (file.size > STORAGE_CONFIG.maxFileSize) {
        errors.push(`File size exceeds ${STORAGE_CONFIG.maxFileSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    const allowedTypes = category === 'image' 
        ? STORAGE_CONFIG.allowedImageTypes 
        : [...STORAGE_CONFIG.allowedImageTypes, ...STORAGE_CONFIG.allowedDocumentTypes];

    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Upload file to local storage
 * 
 * @param {File} file - File object from FormData
 * @param {string} category - Storage category (avatars, receipts, documents)
 * @param {string} oldFilename - Optional: filename to delete (for updates)
 * @returns {Promise<{success: boolean, filename?: string, url?: string, path?: string, error?: string}>}
 */
export async function uploadFile(file, category = 'avatars', oldFilename = null) {
    try {
        // Validate file
        const validation = validateFile(file, category.includes('avatar') ? 'image' : 'document');
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.errors.join(', '),
            };
        }

        // Determine storage path based on category
        let subDir;
        switch (category) {
            case 'avatars':
                subDir = STORAGE_CONFIG.avatars;
                break;
            case 'receipts':
                subDir = STORAGE_CONFIG.receipts;
                break;
            case 'documents':
                subDir = STORAGE_CONFIG.documents;
                break;
            default:
                subDir = category; // Allow custom subdirectories
        }

        const storageDir = path.join(process.cwd(), STORAGE_CONFIG.baseDir, subDir);
        ensureDirectoryExists(storageDir);

        // Generate unique filename
        const filename = generateUniqueFilename(file.name);
        const filePath = path.join(storageDir, filename);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        // Delete old file if provided (for updates)
        if (oldFilename) {
            await deleteFile(oldFilename, category);
        }

        // Return file information
        // Use the API serving route instead of direct public access
        const publicUrl = `/api/files?category=${category}&filename=${filename}`;
        const publicPath = `/api/files?category=${category}`;

        console.log(`[STORAGE DEBUG] Uploaded: ${filename} to ${filePath}`);
        console.log(`[STORAGE DEBUG] Public URL: ${publicUrl}`);

        return {
            success: true,
            filename,
            url: publicUrl,
            path: publicPath,
        };
    } catch (error) {
        console.error('File upload error:', error);
        console.error('[STORAGE DEBUG] Stack:', error.stack);
        return {
            success: false,
            error: error.message || 'Failed to upload file',
        };
    }
}

/**
 * Delete file from local storage
 * 
 * @param {string} filename - Filename to delete
 * @param {string} category - Storage category
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFile(filename, category = 'avatars') {
    try {
        if (!filename) {
            return { success: true }; // Nothing to delete
        }

        // Determine storage path
        let subDir;
        switch (category) {
            case 'avatars':
                subDir = STORAGE_CONFIG.avatars;
                break;
            case 'receipts':
                subDir = STORAGE_CONFIG.receipts;
                break;
            case 'documents':
                subDir = STORAGE_CONFIG.documents;
                break;
            default:
                subDir = category;
        }

        const filePath = path.join(process.cwd(), STORAGE_CONFIG.baseDir, subDir, filename);

        // Delete file if exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { success: true };
    } catch (error) {
        console.error('File deletion error:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete file',
        };
    }
}

/**
 * Get file from local storage
 * 
 * @param {string} filename - Filename to retrieve
 * @param {string} category - Storage category
 * @returns {Promise<{success: boolean, stream?: ReadStream, contentType?: string, error?: string}>}
 */
export async function getFile(filename, category = 'avatars') {
    try {
        // Determine storage path
        let subDir;
        switch (category) {
            case 'avatars':
                subDir = STORAGE_CONFIG.avatars;
                break;
            case 'receipts':
                subDir = STORAGE_CONFIG.receipts;
                break;
            case 'documents':
                subDir = STORAGE_CONFIG.documents;
                break;
            default:
                subDir = category;
        }

        const filePath = path.join(process.cwd(), STORAGE_CONFIG.baseDir, subDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: 'File not found',
            };
        }

        // Create read stream
        const stream = fs.createReadStream(filePath);
        const contentType = getContentType(filename);

        return {
            success: true,
            stream,
            contentType,
        };
    } catch (error) {
        console.error('File retrieval error:', error);
        return {
            success: false,
            error: error.message || 'Failed to retrieve file',
        };
    }
}

/**
 * Get placeholder image stream
 */
export function getPlaceholderImage() {
    const placeholderPath = path.join(process.cwd(), 'public/assets/images/misc/placeholder.png');
    
    if (fs.existsSync(placeholderPath)) {
        return {
            success: true,
            stream: fs.createReadStream(placeholderPath),
            contentType: 'image/png',
        };
    }

    return {
        success: false,
        error: 'Placeholder image not found',
    };
}

export const localStorageStrategy = {
    uploadFile,
    deleteFile,
    getFile,
    getPlaceholderImage,
    validateFile,
    getContentType,
};

