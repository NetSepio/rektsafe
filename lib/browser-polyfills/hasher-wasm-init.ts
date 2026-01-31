// Initialize @lightprotocol/hasher.rs with proper WASM loading for browser
// @ts-ignore - No type declarations for this module
import * as hasherModule from "@lightprotocol/hasher.rs";

declare global {
  interface Window {
    __HASHER_WASM_INIT__?: boolean;
  }
}

// Get the base path for the current deployment
function getBasePath(): string {
  // For GitHub Pages with subdirectory (e.g., /rektsafe/)
  // Check if we're on a subpath by looking at the script src
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (src.includes("/_next/")) {
      // Extract base path from script URL
      const basePath = src.substring(0, src.indexOf("/_next/"));
      return basePath;
    }
  }
  return "";
}

// Set up WASM init functions that fetch from the correct path
export function initHasherWasm() {
  if (typeof window === "undefined") return;
  if (window.__HASHER_WASM_INIT__) return;

  const basePath = getBasePath();
  console.log("[Hasher WASM] Base path:", basePath);

  try {
    const { setWasmInit, setWasmSimdInit } = hasherModule;

    if (setWasmInit) {
      setWasmInit(() => {
        const wasmUrl = basePath + "/wasm/light_wasm_hasher_bg.wasm";
        console.log("[Hasher WASM] Loading SISD from:", wasmUrl);
        return fetch(wasmUrl).then((res) => {
          if (!res.ok) {
            throw new Error(
              `Failed to load WASM: ${res.status} ${res.statusText}`,
            );
          }
          return res.arrayBuffer();
        });
      });
    }

    if (setWasmSimdInit) {
      setWasmSimdInit(() => {
        const wasmUrl = basePath + "/wasm/hasher_wasm_simd_bg.wasm";
        console.log("[Hasher WASM] Loading SIMD from:", wasmUrl);
        return fetch(wasmUrl).then((res) => {
          if (!res.ok) {
            throw new Error(
              `Failed to load WASM: ${res.status} ${res.statusText}`,
            );
          }
          return res.arrayBuffer();
        });
      });
    }

    window.__HASHER_WASM_INIT__ = true;
    console.log("[Hasher WASM] Initialized successfully");
  } catch (err: any) {
    console.error("[Hasher WASM] Failed to initialize:", err);
  }
}

export default initHasherWasm;
