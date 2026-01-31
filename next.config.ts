import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  trailingSlash: true,

  webpack: (config, { isServer }) => {
    // Handle node: prefixed imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
        resource.request = resource.request.replace(/^node:/, "");
      }),
    );

    // Polyfills for Node.js modules
    config.resolve.alias = {
      ...config.resolve.alias,
      path: require.resolve("./lib/browser-polyfills/path.ts"),
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      process: "process/browser",
      buffer: "buffer",
      // Custom polyfills for privacycash SDK
      "node-localstorage":
        require.resolve("./lib/browser-polyfills/node-localstorage.ts"),
      // WASM stubs - actual WASM loaded at runtime
      "light_wasm_hasher_bg.wasm":
        require.resolve("./lib/browser-polyfills/wasm-stub.js"),
      "hasher_wasm_simd_bg.wasm":
        require.resolve("./lib/browser-polyfills/wasm-stub.js"),
    };

    config.resolve.fallback = {
      fs: false,
      os: false,
      tty: false,
      net: false,
      tls: false,
      http: false,
      https: false,
      zlib: false,
      assert: false,
      url: false,
      querystring: false,
      dgram: false,
      dns: false,
      module: false,
      vm: false,
      constants: false,
      child_process: false,
      worker_threads: false,
      cluster: false,
      readline: false,
      repl: false,
      console: false,
      perf_hooks: false,
      async_hooks: false,
      timers: false,
      events: false,
      string_decoder: false,
      util: false,
      punycode: false,
      domain: false,
      diagnostics_channel: false,
    };

    // Provide globals
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    );

    return config;
  },
};

export default nextConfig;
