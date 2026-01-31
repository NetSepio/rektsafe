"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useWalletSession } from "@/components/wallet-session-provider";
import {
  privacyCashSDK,
  SUPPORTED_TOKENS,
  type TokenSymbol,
} from "../lib/privacy-cash-sdk";

export interface TokenBalance {
  symbol: TokenSymbol;
  name: string;
  publicBalance: number;
  privateBalance: number;
  decimals: number;
  color: string;
  isNative: boolean;
  mint: string | null;
}

export interface Balances {
  [key: string]: TokenBalance;
}

export function useBalances() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { isInitialized: isSessionInitialized, session } = useWalletSession();
  const [balances, setBalances] = useState<Balances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  // Initialize balances structure
  const initializeBalances = useCallback((): Balances => {
    const initial: Balances = {};
    Object.entries(SUPPORTED_TOKENS).forEach(([symbol, config]) => {
      initial[symbol] = {
        symbol: symbol as TokenSymbol,
        name: config.name,
        publicBalance: 0,
        privateBalance: 0,
        decimals: config.decimals,
        color: config.color,
        isNative: config.isNative,
        mint: config.mint,
      };
    });
    return initial;
  }, []);

  // Initialize SDK from wallet session
  const initializeSDK = useCallback(async () => {
    if (!address || initializationAttempted.current || !isSessionInitialized) {
      return false;
    }

    try {
      initializationAttempted.current = true;

      // Use the session's derived keypair to initialize SDK
      await privacyCashSDK.initializeFromSession();
      setIsSDKInitialized(true);
      return true;
    } catch (err) {
      console.warn("SDK initialization failed:", err);
      setIsSDKInitialized(false);
      return false;
    }
  }, [address, isSessionInitialized]);

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address) {
      setBalances(initializeBalances());
      setIsSDKInitialized(false);
      initializationAttempted.current = false;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update SDK wallet address
      privacyCashSDK.setWalletAddress(address);

      const newBalances = initializeBalances();

      // Fetch public balances for all tokens from Helius RPC
      const publicBalancePromises = Object.entries(SUPPORTED_TOKENS).map(
        async ([symbol, config]) => {
          const tokenSymbol = symbol as TokenSymbol;

          if (config.isNative) {
            // SOL public balance
            const publicBal = await privacyCashSDK.getPublicBalance(address);
            newBalances[tokenSymbol].publicBalance = publicBal;
          } else {
            // SPL token public balance
            const publicBal = await privacyCashSDK.getPublicBalanceSpl(
              address,
              config.mint!,
            );
            newBalances[tokenSymbol].publicBalance = publicBal;
          }
        },
      );

      await Promise.all(publicBalancePromises);

      // Try to initialize SDK and fetch private balances
      const sdkReady = await initializeSDK();

      if (sdkReady) {
        // Fetch private balances
        const privateBalancePromises = Object.entries(SUPPORTED_TOKENS).map(
          async ([symbol]) => {
            const tokenSymbol = symbol as TokenSymbol;
            const privateBal =
              await privacyCashSDK.getPrivateBalanceForToken(tokenSymbol);
            newBalances[tokenSymbol].privateBalance = privateBal;
          },
        );
        await Promise.all(privateBalancePromises);
      }

      setBalances(newBalances);
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, initializeBalances, initializeSDK]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Reset initialization flag when wallet or session changes
  useEffect(() => {
    initializationAttempted.current = false;
    setIsSDKInitialized(false);
  }, [address, session?.initializedAt]);

  const refresh = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Get array of all tokens for UI rendering
  const tokensArray = useCallback((): TokenBalance[] => {
    return Object.values(balances).sort((a, b) => {
      // Sort by: SOL first, then by total balance, then alphabetically
      if (a.symbol === "SOL") return -1;
      if (b.symbol === "SOL") return 1;
      const aTotal = a.publicBalance + a.privateBalance;
      const bTotal = b.publicBalance + b.privateBalance;
      if (bTotal !== aTotal) return bTotal - aTotal;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [balances]);

  // Get tokens with public balance > 0 (for shielding)
  const getShieldableTokens = useCallback((): TokenBalance[] => {
    return tokensArray().filter((t) => t.publicBalance > 0.001);
  }, [tokensArray]);

  // Get tokens with private balance > 0 (for sending/unshielding)
  const getPrivateTokens = useCallback((): TokenBalance[] => {
    return tokensArray().filter((t) => t.privateBalance > 0.001);
  }, [tokensArray]);

  return {
    balances,
    tokens: tokensArray(),
    shieldableTokens: getShieldableTokens(),
    privateTokens: getPrivateTokens(),
    isLoading,
    error,
    isSDKInitialized,
    walletProvider,
    refresh,
  };
}
