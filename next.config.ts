import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ["privacycash-evm"],

  webpack: (config, { isServer }) => {
    // The privacy SDK imports WASM by file name. Stub it in every compilation.
    // Do not replace Node builtins here: Next's server handler calls
    // process.hrtime.bigint(), and the browser process shim has no hrtime.
    config.resolve.alias = {
      ...config.resolve.alias,
      "web-worker": require.resolve("./lib/browser-polyfills/web-worker.js"),
      "bigint-buffer": require.resolve(
        "./lib/browser-polyfills/bigint-buffer.js",
      ),
      "light_wasm_hasher_bg.wasm":
        require.resolve("./lib/browser-polyfills/wasm-stub.js"),
      "hasher_wasm_simd_bg.wasm":
        require.resolve("./lib/browser-polyfills/wasm-stub.js"),
      "node-localstorage":
        require.resolve("./lib/browser-polyfills/node-localstorage.ts"),
    };

    // These shims replace Node builtins. Keep them on the browser bundle only.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        path: require.resolve("./lib/browser-polyfills/path.ts"),
        crypto: "crypto-browserify",
        stream: "stream-browserify",
        process: "process/browser",
        buffer: "buffer",
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
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

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      );
    }

    // viem pulls in every chain, including Tempo. ox mines Tempo salts with
    // import(variable) for node:worker_threads. This app never calls that.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /[\\/]ox[\\/].*[\\/]virtualMasterPool\.js$/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
};

export default nextConfig;
