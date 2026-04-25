import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@heroui/react", "recharts", "date-fns"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/share/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default config;
