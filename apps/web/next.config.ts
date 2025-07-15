import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {},
  },
  transpilePackages: ["@db"],
  webpack: (config: any) => {
    config.resolve.alias["@db"] = path.resolve(
      __dirname,
      "../../packages/db/src"
    );
    return config;
  },
};

module.exports = nextConfig;
