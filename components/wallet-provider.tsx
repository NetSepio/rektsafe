"use client";

import { createAppKit } from "@reown/appkit/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ReactNode, useEffect, useState } from "react";

// Project ID from Reown Cloud
// Get one at: https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "demo";

// Configure Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Metadata for the app
const metadata = {
  name: "rektSafe",
  description: "Dead Man's Switch for Crypto & Data",
  url: "https://rektsafe.com",
  icons: ["https://rektsafe.com/icon.png"],
};

// Initialize AppKit
function initAppKit() {
  if (typeof window === "undefined") return;

  try {
    createAppKit({
      adapters: [solanaWeb3JsAdapter],
      networks: [solana, solanaTestnet, solanaDevnet],
      metadata,
      projectId,
      features: {
        analytics: false,
        email: false,
        socials: [],
      },
      themeMode: "dark",
      themeVariables: {
        "--w3m-accent": "#00ff88",
        "--w3m-color-mix": "#0a0a0f",
        "--w3m-color-mix-strength": 80,
        "--w3m-font-family": "var(--font-geist-mono), ui-monospace, monospace",
      },
    });
  } catch (e) {
    // AppKit might already be initialized
    console.log("AppKit init (may already exist):", e);
  }
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAppKit();
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
