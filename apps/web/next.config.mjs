import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: "standalone",
    outputFileTracingRoot: path.join(__dirname, "../../"),
    reactCompiler: true,
    experimental: {
    },
    sassOptions: {
        silenceDeprecations: ["import"],
    },
    // CORS for /api when ALLOWED_ORIGINS is set (avoids middleware + standalone trace issue)
    async headers() {
        let origins = (process.env.ALLOWED_ORIGINS || "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
        // Dev default: allow Expo web (localhost:8081) when ALLOWED_ORIGINS is unset
        if (origins.length === 0 && process.env.NODE_ENV !== "production") {
            origins = ["http://localhost:8081", "http://127.0.0.1:8081"];
        }
        if (origins.length === 0) return [];
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: origins.length === 1 ? origins[0] : "*",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization, X-Client, X-Cart-Session, X-Wishlist-Session",
                    },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ],
            },
        ];
    },
};

export default nextConfig;
