/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      "@tabler/icons-react",
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
      "@supabase/supabase-js",
      "zod",
      "resend",
    ],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;

