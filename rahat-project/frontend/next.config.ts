import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify OpenNext runtime requires SSR — never use output: 'export'
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;
