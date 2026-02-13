# File Storage Directory

This directory stores uploaded files using the local filesystem storage strategy.

## Structure

```
storage/
├── users/
│   └── avatars/        # User profile pictures
├── payments/
│   └── receipts/       # Payment receipts (future)
└── documents/          # General documents (future)
```

## Important Notes

- **Development:** Files stored here are for local development only
- **Production:** 
  - For VPS/dedicated servers: Ensure this directory is backed up regularly
  - For serverless (Vercel, Netlify): Use cloud storage (Cloudinary, S3, Vercel Blob)
- **Git:** This directory should be in `.gitignore` to avoid committing uploaded files
- **Security:** Files served via `/api/files` route with proper Content-Type headers

## File Naming

- All files use UUID v4 for uniqueness: `abc-123-def-456.png`
- Original filenames not preserved for security
- File extension preserved for Content-Type detection

## Cleanup

- Files auto-deleted when user/entity is deleted
- Files auto-replaced when user uploads new avatar
- Manual cleanup not required

## Migration

To switch to cloud storage:
1. Install cloud provider SDK
2. Implement storage strategy in `src/lib/storage/{provider}.js`
3. Set `NEXT_PUBLIC_STORAGE_STRATEGY` environment variable
4. No frontend changes needed!

