"use client";

import { PublicKey } from "@solana/web3.js";

// Wallet session for storing signature across page navigation
// This stays in memory for the session (lost on page refresh for security)

export interface WalletSession {
  publicKey: PublicKey;
  address: string;
  signature: Uint8Array;
  initializedAt: number;
}

let currentSession: WalletSession | null = null;

// Initialize wallet session with signature
export async function initializeWalletSession(walletProvider: {
  publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<WalletSession> {
  const message = new TextEncoder().encode(
    "Welcome to RektSafe. For Cypherpunks, By Cypherpunks! \n\nPowered by NetSepio",
  );

  let signature: Uint8Array;
  try {
    signature = await walletProvider.signMessage(message);
  } catch (err: any) {
    throw new Error(
      "Signature request rejected: " + (err.message || "User cancelled"),
    );
  }

  // Handle different signature formats
  // @ts-ignore
  if (signature.signature) {
    // @ts-ignore
    signature = signature.signature;
  }

  if (!(signature instanceof Uint8Array)) {
    throw new Error("Invalid signature format");
  }

  currentSession = {
    publicKey: walletProvider.publicKey,
    address: walletProvider.publicKey.toBase58(),
    signature,
    initializedAt: Date.now(),
  };

  return currentSession;
}

// Get current session if exists
export function getWalletSession(): WalletSession | null {
  return currentSession;
}

// Get signature from session
export function getSessionSignature(): Uint8Array | null {
  return currentSession?.signature || null;
}

// Clear session (e.g., on disconnect)
export function clearWalletSession(): void {
  currentSession = null;
}

// Check if session is valid for a given wallet address
export function isSessionValidForWallet(address: string): boolean {
  return currentSession !== null && currentSession.address === address;
}
