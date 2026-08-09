import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    turbopack: {
        root: __dirname,
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "qlqwmitchjtoqggfcyir.supabase.co",
            },
        ],
    },
};

export default nextConfig;