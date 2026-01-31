"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { PublicKey } from "@solana/web3.js";
import {
  initializeWalletSession,
  getWalletSession,
  clearWalletSession,
  isSessionValidForWallet,
  getSessionSignature,
  WalletSession,
} from "@/lib/wallet-session";
import { privacyCashSDK } from "@/app/zksend/lib/privacy-cash-sdk";

interface WalletSessionContextType {
  session: WalletSession | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initializeSession: () => Promise<void>;
  clearSession: () => void;
}

const WalletSessionContext = createContext<
  WalletSessionContextType | undefined
>(undefined);

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");

  const [session, setSession] = useState<WalletSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear session when wallet disconnects
  useEffect(() => {
    if (!isConnected || !address) {
      clearWalletSession();
      setSession(null);
      setIsInitialized(false);
      setError(null);
    }
  }, [isConnected, address]);

  // Check for existing session on mount
  useEffect(() => {
    if (isConnected && address) {
      const existingSession = getWalletSession();
      if (existingSession && isSessionValidForWallet(address)) {
        setSession(existingSession);
        setIsInitialized(true);
      }
    }
  }, [isConnected, address]);

  const initializeSession = useCallback(async () => {
    if (!walletProvider || !address) {
      setError("Wallet not connected");
      return;
    }

    // Check if we already have a valid session
    if (isSessionValidForWallet(address)) {
      const existingSession = getWalletSession();
      if (existingSession) {
        setSession(existingSession);
        setIsInitialized(true);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a compatible provider interface
      const provider = {
        publicKey: new PublicKey(address),
        signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
          const result = await walletProvider.signMessage(message);
          // Handle different return formats
          if (result instanceof Uint8Array) {
            return result;
          }
          // @ts-ignore
          if (result.signature) {
            // @ts-ignore
            return result.signature;
          }
          throw new Error("Unexpected signature format");
        },
      };

      const newSession = await initializeWalletSession(provider);

      // Initialize Privacy Cash SDK with the signature
      await privacyCashSDK.initializeWithSignature(newSession.signature);
      privacyCashSDK.setWalletAddress(newSession.address);

      setSession(newSession);
      setIsInitialized(true);
    } catch (err: any) {
      console.error("Failed to initialize wallet session:", err);
      setError(err.message || "Failed to initialize session");
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [walletProvider, address]);

  const clearSession = useCallback(() => {
    clearWalletSession();
    setSession(null);
    setIsInitialized(false);
    setError(null);
  }, []);

  return (
    <WalletSessionContext.Provider
      value={{
        session,
        isInitialized,
        isLoading,
        error,
        initializeSession,
        clearSession,
      }}
    >
      {children}
    </WalletSessionContext.Provider>
  );
}

export function useWalletSession() {
  const context = useContext(WalletSessionContext);
  if (context === undefined) {
    throw new Error(
      "useWalletSession must be used within a WalletSessionProvider",
    );
  }
  return context;
}
