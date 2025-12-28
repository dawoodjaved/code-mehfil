/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@codepair/ui"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@monaco-editor/react": "@monaco-editor/react",
    };
    return config;
  },
};

module.exports = nextConfig;

