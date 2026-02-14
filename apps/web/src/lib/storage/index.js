/**
 * Storage Service - Abstracted file storage layer
 * 
 * Supports multiple storage strategies:
 * - Local filesystem (development, VPS servers)
 * - Cloudinary (images/media - production)
 * - AWS S3 (documents - production)
 * - Vercel Blob (serverless platforms)
 * 
 * Switch strategy via environment variable: NEXT_PUBLIC_STORAGE_STRATEGY
 */

import { localStorageStrategy } from './local';

// Environment configuration
const STORAGE_STRATEGY = process.env.NEXT_PUBLIC_STORAGE_STRATEGY || 'local';

// Import strategies based on configuration
let storageStrategy;

switch (STORAGE_STRATEGY) {
    case 'local':
        storageStrategy = localStorageStrategy;
        break;
    case 'cloudinary':
        // Future: import { cloudinaryStorageStrategy } from './cloudinary';
        // storageStrategy = cloudinaryStorageStrategy;
        console.warn('Cloudinary storage not yet implemented, falling back to local');
        storageStrategy = localStorageStrategy;
        break;
    case 's3':
        // Future: import { s3StorageStrategy } from './s3';
        // storageStrategy = s3StorageStrategy;
        console.warn('S3 storage not yet implemented, falling back to local');
        storageStrategy = localStorageStrategy;
        break;
    case 'vercel-blob':
        // Future: import { vercelBlobStorageStrategy } from './vercel-blob';
        // storageStrategy = vercelBlobStorageStrategy;
        console.warn('Vercel Blob storage not yet implemented, falling back to local');
        storageStrategy = localStorageStrategy;
        break;
    default:
        console.warn(`Unknown storage strategy: ${STORAGE_STRATEGY}, falling back to local`);
        storageStrategy = localStorageStrategy;
}

// Export unified storage interface
export const storage = storageStrategy;

// Re-export specific functions for convenience
export const { uploadFile, deleteFile, getFile, getPlaceholderImage, validateFile, getContentType } = storageStrategy;

/**
 * Usage Examples:
 * 
 * // Upload avatar
 * const result = await uploadFile(avatarFile, 'avatars');
 * if (result.success) {
 *     console.log(result.filename, result.url);
 * }
 * 
 * // Upload receipt
 * const result = await uploadFile(receiptFile, 'receipts');
 * 
 * // Delete file
 * await deleteFile('old-avatar.png', 'avatars');
 * 
 * // Get file
 * const file = await getFile('avatar.png', 'avatars');
 * if (file.success) {
 *     return new NextResponse(file.stream, {
 *         headers: { 'Content-Type': file.contentType }
 *     });
 * }
 */

