/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};
module.exports = nextConfig;


// Vercel deployment: skip ESLint during production build.
const __vercelEslintConfig = { eslint: { ignoreDuringBuilds: true } };
module.exports = { ...module.exports, ...__vercelEslintConfig };
