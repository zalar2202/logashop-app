/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: "standalone",
    reactCompiler: true,
    experimental: {
        // ... experimental options
    },
    sassOptions: {
        silenceDeprecations: ["import"],
    },
    // CORS for /api when ALLOWED_ORIGINS is set (avoids middleware + standalone trace issue)
    async headers() {
        const origins = (process.env.ALLOWED_ORIGINS || "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
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
                        value: "Content-Type, Authorization, X-Client, X-Cart-Session",
                    },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ],
            },
        ];
    },
};

export default nextConfig;
