"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import { initHasherWasm } from "@/lib/browser-polyfills/hasher-wasm-init";

// Import hasher module with proper typing
const getHasherModule = () => {
  if (typeof window === "undefined")
    return Promise.resolve({ WasmFactory: null });
  // @ts-ignore - No type declarations for this module
  return import("@lightprotocol/hasher.rs");
};

// Browser storage for Privacy Cash SDK
class BrowserStorage {
  private prefix: string = "privacycash_";

  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(this.prefix + key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.prefix + key, value);
  }

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === "undefined") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }

  get length(): number {
    if (typeof window === "undefined") return 0;
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }

  key(index: number): string | null {
    if (typeof window === "undefined") return null;
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        if (count === index) {
          return key.slice(this.prefix.length);
        }
        count++;
      }
    }
    return null;
  }
}

// Singleton storage instance
const browserStorage = new BrowserStorage();

// Initialize hasher WASM before loading Privacy Cash SDK
let hasherInitialized = false;
async function ensureHasherWasm() {
  if (!hasherInitialized && typeof window !== "undefined") {
    initHasherWasm();
    hasherInitialized = true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Privacy Cash SDK Configuration
const HELIUS_RPC =
  process.env.NEXT_PUBLIC_HELIUS_RPC ||
  process.env.NEXT_PUBLIC_SOLANA_RPC ||
  "https://api.mainnet-beta.solana.com";

// Supported tokens configuration
export const SUPPORTED_TOKENS = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    mint: null,
    decimals: 9,
    color: "#00ff88",
    isNative: true,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    color: "#00d4ff",
    isNative: false,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    color: "#ff006e",
    isNative: false,
  },
  ZEC: {
    symbol: "ZEC",
    name: "Zcash (Wormhole)",
    mint: "A7g2V9w5Q4z7J8K3mN6pL1oR5tY2uI9eW0qF3xZ7cV4b",
    decimals: 8,
    color: "#f4b728",
    isNative: false,
  },
  ORE: {
    symbol: "ORE",
    name: "Ore",
    mint: "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSyb5",
    decimals: 9,
    color: "#ff9500",
    isNative: false,
  },
  stORE: {
    symbol: "stORE",
    name: "Staked Ore",
    mint: "st8i1d8n6k9o3j4l5p7q2r4t6y8u0i1e3w5q7y9u1i3o5",
    decimals: 9,
    color: "#a855f7",
    isNative: false,
  },
} as const;

export type TokenSymbol = keyof typeof SUPPORTED_TOKENS;

// Encryption service instance (initialized with signature)
let encryptionServiceInstance: any = null;

// Privacy Cash SDK Wrapper Class
export class PrivacyCashSDK {
  private connection: Connection;
  private walletAddress: string | null = null;
  private transactionSigner: ((tx: any) => Promise<any>) | null = null;

  constructor() {
    this.connection = new Connection(HELIUS_RPC, "confirmed");
  }

  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  setTransactionSigner(signer: (tx: any) => Promise<any>) {
    this.transactionSigner = signer;
  }

  // Initialize encryption service with signature
  async initializeWithSignature(signature: Uint8Array): Promise<void> {
    await ensureHasherWasm();

    // Import from the utils export
    const utilsModule = await import("privacycash/utils");
    const EncryptionService = utilsModule.EncryptionService;
    encryptionServiceInstance = new EncryptionService();
    encryptionServiceInstance.deriveEncryptionKeyFromSignature(
      Buffer.from(signature),
    );
  }

  // Check if SDK is initialized
  isInitialized(): boolean {
    return encryptionServiceInstance !== null;
  }

  // Get public SOL balance from Helius RPC
  async getPublicBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9;
    } catch (error) {
      console.error("Error fetching public SOL balance:", error);
      return 0;
    }
  }

  // Get public SPL token balance from Helius RPC
  async getPublicBalanceSpl(address: string, mint: string): Promise<number> {
    try {
      const owner = new PublicKey(address);
      const mintPubkey = new PublicKey(mint);

      const { getAssociatedTokenAddress, getAccount } =
        await import("@solana/spl-token");
      const ata = await getAssociatedTokenAddress(mintPubkey, owner);

      try {
        const account = await getAccount(this.connection, ata);
        const tokenInfo = Object.values(SUPPORTED_TOKENS).find(
          (t) => t.mint === mint,
        );
        const decimals = tokenInfo?.decimals || 6;
        return Number(account.amount) / Math.pow(10, decimals);
      } catch {
        return 0;
      }
    } catch (error) {
      console.error("Error fetching public SPL balance:", error);
      return 0;
    }
  }

  // Get private SOL balance using SDK
  async getPrivateBalance(): Promise<number> {
    if (!encryptionServiceInstance || !this.walletAddress) {
      return 0;
    }

    try {
      const { getUtxos } = await import("privacycash/utils");
      const { WasmFactory } = await getHasherModule();
      if (!WasmFactory) throw new Error("Hasher module not available");
      const lightWasm = await WasmFactory.getInstance();

      const utxos = await getUtxos({
        connection: this.connection,
        publicKey: new PublicKey(this.walletAddress),
        encryptionService: encryptionServiceInstance,
        storage: browserStorage,
      });

      let totalLamports = 0;
      for (const utxo of utxos) {
        // @ts-ignore - spent property may not be in type definition
        if (!utxo.spent && utxo.amount) {
          totalLamports += utxo.amount.toNumber();
        }
      }

      return totalLamports / 1e9;
    } catch (error) {
      console.error("Error fetching private SOL balance:", error);
      return 0;
    }
  }

  // SDK: Deposit SOL into privacy pool
  async deposit(
    lamports: number,
  ): Promise<{ signature: string; success: boolean }> {
    if (
      !encryptionServiceInstance ||
      !this.walletAddress ||
      !this.transactionSigner
    ) {
      throw new Error(
        "SDK not initialized. Call initializeWithSignature first.",
      );
    }

    try {
      const { deposit } = await import("privacycash/utils");
      const { WasmFactory } = await getHasherModule();
      if (!WasmFactory) throw new Error("Hasher module not available");
      const lightWasm = await WasmFactory.getInstance();
      const publicKey = new PublicKey(this.walletAddress);

      const result = await deposit({
        connection: this.connection,
        publicKey,
        amount_in_lamports: lamports,
        encryptionService: encryptionServiceInstance,
        transactionSigner: this.transactionSigner,
        lightWasm,
        storage: browserStorage,
        keyBasePath: "rektsafe",
      });

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error depositing SOL:", error);
      throw error;
    }
  }

  // SDK: Withdraw SOL from privacy pool
  async withdraw(
    lamports: number,
    recipientAddress?: string,
  ): Promise<{ signature: string; success: boolean }> {
    if (
      !encryptionServiceInstance ||
      !this.walletAddress ||
      !this.transactionSigner
    ) {
      throw new Error(
        "SDK not initialized. Call initializeWithSignature first.",
      );
    }

    try {
      const { withdraw } = await import("privacycash/utils");
      const { WasmFactory } = await getHasherModule();
      if (!WasmFactory) throw new Error("Hasher module not available");
      const lightWasm = await WasmFactory.getInstance();
      const publicKey = new PublicKey(this.walletAddress);
      const recipient = recipientAddress
        ? new PublicKey(recipientAddress)
        : publicKey;

      const result = await withdraw({
        connection: this.connection,
        publicKey,
        amount_in_lamports: lamports,
        encryptionService: encryptionServiceInstance,
        lightWasm,
        storage: browserStorage,
        keyBasePath: "rektsafe",
        recipient,
      });

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error withdrawing SOL:", error);
      throw error;
    }
  }
}

// Singleton instance
export const privacyCashSDK = new PrivacyCashSDK();

// Hook-compatible function exports
export async function getPublicBalance(address: string): Promise<number> {
  return privacyCashSDK.getPublicBalance(address);
}

export async function getPublicBalanceSpl(
  address: string,
  mint: string,
): Promise<number> {
  return privacyCashSDK.getPublicBalanceSpl(address, mint);
}

export async function getPrivateBalance(): Promise<number> {
  return privacyCashSDK.getPrivateBalance();
}
