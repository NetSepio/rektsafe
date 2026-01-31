// Initialize @lightprotocol/hasher.rs with proper WASM loading for browser

declare global {
  interface Window {
    __HASHER_WASM_INIT__?: boolean;
  }
}

// Set up WASM init functions that fetch from the correct path
export function initHasherWasm() {
  if (typeof window === "undefined") return;
  if (window.__HASHER_WASM_INIT__) return;

  // Dynamically import the hasher module and set up WASM loading
  // Using dynamic import to avoid TypeScript module resolution issues
  const importHasher = new Function(
    "return import('@lightprotocol/hasher.rs')",
  ) as () => Promise<any>;

  importHasher()
    .then((hasherModule: any) => {
      const { setWasmInit, setWasmSimdInit } = hasherModule;

      if (setWasmInit) {
        setWasmInit(() => {
          return fetch("/wasm/light_wasm_hasher_bg.wasm").then((res) =>
            res.arrayBuffer(),
          );
        });
      }

      if (setWasmSimdInit) {
        setWasmSimdInit(() => {
          return fetch("/wasm/hasher_wasm_simd_bg.wasm").then((res) =>
            res.arrayBuffer(),
          );
        });
      }

      window.__HASHER_WASM_INIT__ = true;
      console.log("[Hasher WASM] Initialized successfully");
    })
    .catch((err: any) => {
      console.error("[Hasher WASM] Failed to initialize:", err);
    });
}

export default initHasherWasm;
