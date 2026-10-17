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
import { BrowserProvider } from "ethers";
import { PublicKey } from "@solana/web3.js";
import { useWalletType } from "@/hooks/use-wallet-type";
import type { Eip1193Provider } from "@/lib/eip1193";
import {
  EVM_SIGN_MESSAGE,
  readEvmSignature,
  storeEvmSignature,
} from "@/app/zksend/lib/evm-privacy";
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
  evmSignature: string | null;
  initializeSession: () => Promise<void>;
  initializeEvmSession: () => Promise<void>;
  clearSession: () => void;
}

const WalletSessionContext = createContext<
  WalletSessionContextType | undefined
>(undefined);

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAppKitAccount();
  const walletType = useWalletType();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { walletProvider: evmProvider } =
    useAppKitProvider<Eip1193Provider>("eip155");

  const [session, setSession] = useState<WalletSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evmSignature, setEvmSignature] = useState<string | null>(null);

  // Clear session when wallet disconnects. The Ethereum privacy signature
  // stays in localStorage so the same key can decrypt shielded notes later.
  useEffect(() => {
    if (!isConnected || !address) {
      clearWalletSession();
      setSession(null);
      setIsInitialized(false);
      setEvmSignature(null);
      setError(null);
      return;
    }

    if (walletType === "evm") {
      setEvmSignature(readEvmSignature(address));
    } else {
      setEvmSignature(null);
    }
  }, [isConnected, address, walletType]);

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
    if (walletType === "evm") {
      setIsInitialized(true);
      return;
    }

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
  }, [walletProvider, address, walletType]);

  const initializeEvmSession = useCallback(async () => {
    if (!address || !evmProvider) {
      setError("Wallet not connected");
      return;
    }

    const stored = readEvmSignature(address);
    if (stored) {
      setEvmSignature(stored);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = new BrowserProvider(evmProvider);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(EVM_SIGN_MESSAGE);
      storeEvmSignature(address, signature);
      setEvmSignature(signature);
    } catch (err: any) {
      console.error("Failed to initialize Ethereum privacy session:", err);
      setError(err.message || "Signature request rejected");
      setEvmSignature(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, evmProvider]);

  const clearSession = useCallback(() => {
    clearWalletSession();
    setSession(null);
    setIsInitialized(false);
    setEvmSignature(null);
    setError(null);
  }, []);

  return (
    <WalletSessionContext.Provider
      value={{
        session,
        isInitialized,
        isLoading,
        error,
        evmSignature,
        initializeSession,
        initializeEvmSession,
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
