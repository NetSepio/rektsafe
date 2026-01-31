"use client";

import { Keypair, PublicKey } from "@solana/web3.js";

// Wallet session for storing derived keypair across page navigation
// This stays in memory for the session (lost on page refresh for security)

export interface WalletSession {
  publicKey: PublicKey;
  address: string;
  derivedKeypair: Keypair;
  signature: Uint8Array;
  initializedAt: number;
}

let currentSession: WalletSession | null = null;

// Derive keypair from signature (deterministic)
function deriveKeypairFromSignature(signature: Uint8Array): Keypair {
  const seed = signature.slice(0, 32);
  return Keypair.fromSeed(seed);
}

// Initialize wallet session with signature
export async function initializeWalletSession(walletProvider: {
  publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<WalletSession> {
  const message = new TextEncoder().encode(
    "Welcome to RektSafe. For Cypherpunks, By Cypherpunks",
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

  const derivedKeypair = deriveKeypairFromSignature(signature);

  currentSession = {
    publicKey: walletProvider.publicKey,
    address: walletProvider.publicKey.toBase58(),
    derivedKeypair,
    signature,
    initializedAt: Date.now(),
  };

  return currentSession;
}

// Get current session if exists
export function getWalletSession(): WalletSession | null {
  return currentSession;
}

// Clear session (e.g., on disconnect)
export function clearWalletSession(): void {
  currentSession = null;
}

// Check if session is valid for a given wallet address
export function isSessionValidForWallet(address: string): boolean {
  return currentSession !== null && currentSession.address === address;
}

// Get derived keypair if session exists
export function getDerivedKeypair(): Keypair | null {
  return currentSession?.derivedKeypair || null;
}
