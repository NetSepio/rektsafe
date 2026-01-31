"use client";

import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { initHasherWasm } from "@/lib/browser-polyfills/hasher-wasm-init";
import { getDerivedKeypair } from "@/lib/wallet-session";

// Initialize hasher WASM before loading Privacy Cash SDK
let hasherInitialized = false;
async function ensureHasherWasm() {
  if (!hasherInitialized && typeof window !== "undefined") {
    initHasherWasm();
    hasherInitialized = true;
    // Give a small delay for WASM init functions to be set
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

// Wallet provider interface
export interface WalletProvider {
  publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction: (transaction: any) => Promise<any>;
}

// Cache for SDK instances and balances
interface BalanceCache {
  [key: string]: {
    balance: number;
    timestamp: number;
  };
}

// Derive keypair from signature (deterministic)
function deriveKeypairFromSignature(signature: Uint8Array): Keypair {
  // Use the first 32 bytes of the signature as seed
  const seed = signature.slice(0, 32);
  return Keypair.fromSeed(seed);
}

// Privacy Cash SDK Wrapper Class
export class PrivacyCashSDK {
  private connection: Connection;
  private walletAddress: string | null = null;
  private sdkInstance: any = null;
  private balanceCache: BalanceCache = {};
  private cacheExpiryMs = 15000; // 15 seconds

  constructor() {
    this.connection = new Connection(HELIUS_RPC, "confirmed");
  }

  setWalletAddress(address: string) {
    this.walletAddress = address;
    this.sdkInstance = null;
  }

  // Dynamically import Privacy Cash SDK
  private async loadSDK(): Promise<any> {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      // Ensure hasher WASM is initialized first
      await ensureHasherWasm();
      const module = await import("privacycash");
      return module;
    } catch (error) {
      console.warn("Privacy Cash SDK not available:", error);
      return null;
    }
  }

  // Initialize SDK with wallet provider (uses signMessage to derive key)
  async initializeWithProvider(provider: WalletProvider): Promise<any> {
    const PrivacyCashModule = await this.loadSDK();
    if (!PrivacyCashModule) {
      throw new Error("Privacy Cash SDK not available");
    }

    const { PrivacyCash } = PrivacyCashModule;

    // Sign a standard message to derive encryption key
    const encodedMessage = new TextEncoder().encode(
      "Privacy Money account sign in",
    );
    let signature: Uint8Array;

    try {
      signature = await provider.signMessage(encodedMessage);
    } catch (err: any) {
      if (
        err instanceof Error &&
        err.message?.toLowerCase().includes("user rejected")
      ) {
        throw new Error("User rejected the signature request");
      }
      throw new Error(
        "Failed to sign message: " + (err.message || "Unknown error"),
      );
    }

    // If wallet.signMessage returned an object, extract signature
    // @ts-ignore
    if (signature.signature) {
      // @ts-ignore
      signature = signature.signature;
    }

    if (!(signature instanceof Uint8Array)) {
      throw new Error("Signature is not an Uint8Array type");
    }

    // Derive keypair from signature
    const keypair = deriveKeypairFromSignature(signature);

    // Initialize Privacy Cash SDK with derived keypair
    this.sdkInstance = new PrivacyCash({
      RPC_url: HELIUS_RPC,
      owner: keypair,
      enableDebug: true,
    });

    this.walletAddress = provider.publicKey.toBase58();
    return this.sdkInstance;
  }

  // Initialize SDK with keypair directly
  async initializeWithKeypair(keypair: Keypair): Promise<any> {
    const PrivacyCashModule = await this.loadSDK();
    if (!PrivacyCashModule) {
      throw new Error("Privacy Cash SDK not available");
    }

    const { PrivacyCash } = PrivacyCashModule;

    this.sdkInstance = new PrivacyCash({
      RPC_url: HELIUS_RPC,
      owner: keypair,
      enableDebug: true,
    });

    this.walletAddress = keypair.publicKey.toBase58();
    return this.sdkInstance;
  }

  // Initialize SDK from wallet session (uses pre-derived keypair)
  async initializeFromSession(): Promise<any> {
    const keypair = getDerivedKeypair();
    if (!keypair) {
      throw new Error(
        "No wallet session found. Please sign the message first.",
      );
    }
    return this.initializeWithKeypair(keypair);
  }

  // Get the derived keypair address (for funding)
  getDerivedKeypairAddress(): string | null {
    const keypair = getDerivedKeypair();
    return keypair?.publicKey.toBase58() || null;
  }

  // Get balance of derived keypair
  async getDerivedKeypairBalance(): Promise<number> {
    const address = this.getDerivedKeypairAddress();
    if (!address) return 0;
    return this.getPublicBalance(address);
  }

  // Create a funding transaction (to be signed by wallet)
  async createFundingTransaction(
    fromWallet: any,
    amountSol: number,
  ): Promise<{ signature: string }> {
    const derivedAddress = this.getDerivedKeypairAddress();
    if (!derivedAddress) {
      throw new Error("Derived keypair not available");
    }

    const { SystemProgram, Transaction, PublicKey } =
      await import("@solana/web3.js");

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: new PublicKey(derivedAddress),
        lamports: Math.floor(amountSol * 1e9),
      }),
    );

    transaction.feePayer = fromWallet.publicKey;
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await fromWallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signed.serialize(),
    );

    await this.connection.confirmTransaction(signature);

    return { signature };
  }

  // Check if SDK is available
  async isSDKAvailable(): Promise<boolean> {
    const module = await this.loadSDK();
    return !!module;
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

  // Get private SOL balance from Privacy Cash
  async getPrivateBalance(): Promise<number> {
    if (!this.sdkInstance) {
      return 0;
    }

    const cacheKey = `private:SOL:${this.walletAddress}`;
    const cached = this.getCachedBalance(cacheKey);
    if (cached !== null) return cached;

    try {
      const result = await this.sdkInstance.getPrivateBalance();
      const balance = result.lamports / 1e9;
      this.setCachedBalance(cacheKey, balance);
      return balance;
    } catch (error) {
      console.error("Error fetching private SOL balance:", error);
      return 0;
    }
  }

  // Get private USDC balance from Privacy Cash
  async getPrivateBalanceUSDC(): Promise<number> {
    if (!this.sdkInstance) {
      return 0;
    }

    const cacheKey = `private:USDC:${this.walletAddress}`;
    const cached = this.getCachedBalance(cacheKey);
    if (cached !== null) return cached;

    try {
      const result = await this.sdkInstance.getPrivateBalanceUSDC();
      const balance = result.base_units / 1e6;
      this.setCachedBalance(cacheKey, balance);
      return balance;
    } catch (error) {
      console.error("Error fetching private USDC balance:", error);
      return 0;
    }
  }

  // Get private SPL token balance from Privacy Cash
  async getPrivateBalanceSpl(mint: string): Promise<number> {
    if (!this.sdkInstance) {
      return 0;
    }

    const tokenInfo = Object.values(SUPPORTED_TOKENS).find(
      (t) => t.mint === mint,
    );
    const symbol = tokenInfo?.symbol || "TOKEN";
    const decimals = tokenInfo?.decimals || 6;
    const cacheKey = `private:${symbol}:${this.walletAddress}`;
    const cached = this.getCachedBalance(cacheKey);
    if (cached !== null) return cached;

    try {
      const mintPubkey = new PublicKey(mint);
      const result = await this.sdkInstance.getPrivateBalanceSpl(mintPubkey);
      const balance = result.base_units / Math.pow(10, decimals);
      this.setCachedBalance(cacheKey, balance);
      return balance;
    } catch (error) {
      console.error(`Error fetching private ${symbol} balance:`, error);
      return 0;
    }
  }

  // Unified method to get private balance for any token
  async getPrivateBalanceForToken(symbol: TokenSymbol): Promise<number> {
    const token = SUPPORTED_TOKENS[symbol];

    if (symbol === "SOL") {
      return this.getPrivateBalance();
    } else if (symbol === "USDC") {
      return this.getPrivateBalanceUSDC();
    } else if (token?.mint) {
      return this.getPrivateBalanceSpl(token.mint);
    }

    return 0;
  }

  // SDK: Deposit SOL into privacy pool
  async deposit(
    lamports: number,
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.sdkInstance) {
      throw new Error(
        "SDK not initialized. Call initializeWithProvider first.",
      );
    }

    try {
      const result = await this.sdkInstance.deposit({ lamports });
      this.clearCache();

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error depositing SOL:", error);
      throw error;
    }
  }

  // SDK: Deposit USDC into privacy pool
  async depositUSDC(
    baseUnits: number,
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.sdkInstance) {
      throw new Error(
        "SDK not initialized. Call initializeWithProvider first.",
      );
    }

    try {
      const result = await this.sdkInstance.depositUSDC({
        base_units: baseUnits,
      });
      this.clearCache();

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error depositing USDC:", error);
      throw error;
    }
  }

  // SDK: Deposit SPL token into privacy pool
  async depositSPL(
    baseUnits: number,
    mint: string,
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.sdkInstance) {
      throw new Error(
        "SDK not initialized. Call initializeWithProvider first.",
      );
    }

    try {
      const mintPubkey = new PublicKey(mint);
      const result = await this.sdkInstance.depositSPL({
        base_units: baseUnits,
        mintAddress: mintPubkey,
      });

      this.clearCache();

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error depositing SPL token:", error);
      throw error;
    }
  }

  // SDK: Withdraw SOL from privacy pool
  async withdraw(
    lamports: number,
    recipientAddress?: string,
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.sdkInstance) {
      throw new Error(
        "SDK not initialized. Call initializeWithProvider first.",
      );
    }

    try {
      const result = await this.sdkInstance.withdraw({
        lamports,
        recipientAddress,
      });

      this.clearCache();

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error withdrawing SOL:", error);
      throw error;
    }
  }

  // SDK: Withdraw USDC from privacy pool
  async withdrawUSDC(
    baseUnits: number,
    recipientAddress?: string,
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.sdkInstance) {
      throw new Error(
        "SDK not initialized. Call initializeWithProvider first.",
      );
    }

    try {
      const result = await this.sdkInstance.withdrawUSDC({
        base_units: baseUnits,
        recipientAddress,
      });

      this.clearCache();

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error withdrawing USDC:", error);
      throw error;
    }
  }

  // SDK: Withdraw SPL token from privacy pool
  async withdrawSPL(
    baseUnits: number,
    mint: string,
    recipientAddress?: string,
  ): Promise<{ signature: string; success: boolean }> {
    if (!this.sdkInstance) {
      throw new Error(
        "SDK not initialized. Call initializeWithProvider first.",
      );
    }

    try {
      const mintPubkey = new PublicKey(mint);
      const result = await this.sdkInstance.withdrawSPL({
        base_units: baseUnits,
        mintAddress: mintPubkey,
        recipientAddress,
      });

      this.clearCache();

      return {
        signature: result.tx,
        success: true,
      };
    } catch (error) {
      console.error("Error withdrawing SPL token:", error);
      throw error;
    }
  }

  // SDK: Clear cache
  async clearSDKCache(): Promise<void> {
    if (this.sdkInstance) {
      await this.sdkInstance.clearCache();
    }
    this.clearCache();
  }

  // Cache helpers
  private getCachedBalance(key: string): number | null {
    const cached = this.balanceCache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheExpiryMs) {
      delete this.balanceCache[key];
      return null;
    }
    return cached.balance;
  }

  private setCachedBalance(key: string, balance: number): void {
    this.balanceCache[key] = {
      balance,
      timestamp: Date.now(),
    };
  }

  clearCache() {
    this.balanceCache = {};
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

export async function getPrivateBalanceSpl(mint: string): Promise<number> {
  return privacyCashSDK.getPrivateBalanceSpl(mint);
}
