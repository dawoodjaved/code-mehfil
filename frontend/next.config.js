/** @type {import('next').NextConfig} */
const webpack = require("webpack");

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@codemehfil/ui"],
  webpack: (config, { isServer }) => {
    // Polyfills for Node.js modules used by yjs and y-websocket
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
        util: require.resolve("util"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "@monaco-editor/react": "@monaco-editor/react",
    };

    // Provide Buffer and process globally
    if (!isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }

    // Monaco Editor worker configuration
    if (!isServer) {
      // Exclude Monaco from server-side rendering
      config.resolve.alias["monaco-editor"] = "monaco-editor/esm/vs/editor/editor.api";
    }

    return config;
  },
};

module.exports = nextConfig;

