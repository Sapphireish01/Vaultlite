/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure all API routes are always dynamic — never statically optimized.
    // This prevents Vercel's build from trying to collect page data for routes
    // that use cookies() or other dynamic functions.
    experimental: {
        // No external packages needed — using built-in Next.js dynamic forcing.
    },
};

module.exports = nextConfig;
