"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  formatEther,
  formatUnits,
} from "ethers";
import type { Eip1193Provider } from "@/lib/eip1193";
import { useWalletType } from "@/hooks/use-wallet-type";
import { useIsEthereum } from "@/hooks/use-is-ethereum";
import { useWalletSession } from "@/components/wallet-session-provider";
import {
  privacyCashSDK,
  SUPPORTED_TOKENS,
  type TokenSymbol as SolanaTokenSymbol,
} from "../lib/privacy-cash-sdk";
import {
  ETH_USDT_ADDRESS,
  getEthereumPrivateBalance,
  type EvmPrivacyToken,
} from "../lib/evm-privacy";
import type { TransferChain } from "../lib/explorer";

export type TokenSymbol = SolanaTokenSymbol | "ETH";

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

const ETHEREUM_TOKENS: Record<
  "ETH" | "USDT",
  Omit<TokenBalance, "publicBalance" | "privateBalance">
> = {
  ETH: {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    color: "#00d4ff",
    isNative: true,
    mint: null,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    color: "#ff006e",
    isNative: false,
    mint: ETH_USDT_ADDRESS,
  },
};

export function useBalances() {
  const { address, isConnected } = useAppKitAccount();
  const walletType = useWalletType();
  const isEthereum = useIsEthereum();
  const chain: TransferChain =
    walletType === "evm" && isEthereum ? "ethereum" : "solana";
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { walletProvider: evmProvider } =
    useAppKitProvider<Eip1193Provider>("eip155");
  const { isInitialized: isSessionInitialized, evmSignature } =
    useWalletSession();
  const [balances, setBalances] = useState<Balances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  // Initialize balances structure
  const initializeBalances = useCallback((): Balances => {
    const initial: Balances = {};
    if (chain === "ethereum") {
      Object.values(ETHEREUM_TOKENS).forEach((config) => {
        initial[config.symbol] = {
          ...config,
          publicBalance: 0,
          privateBalance: 0,
        };
      });
      return initial;
    }

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
  }, [chain]);

  // Initialize SDK with wallet provider for transaction signing
  const initializeSDK = useCallback(async () => {
    if (
      !address ||
      initializationAttempted.current ||
      !isSessionInitialized ||
      !walletProvider
    ) {
      return false;
    }

    try {
      initializationAttempted.current = true;

      // Set up transaction signer using wallet adapter
      privacyCashSDK.setWalletAddress(address);
      privacyCashSDK.setTransactionSigner(async (tx: any) => {
        return await walletProvider.signTransaction(tx);
      });

      setIsSDKInitialized(privacyCashSDK.isInitialized());
      return privacyCashSDK.isInitialized();
    } catch (err) {
      console.warn("SDK initialization failed:", err);
      setIsSDKInitialized(false);
      return false;
    }
  }, [address, isSessionInitialized, walletProvider]);

  const fetchEthereumBalances = useCallback(async () => {
    if (!address) return;

    const newBalances = initializeBalances();
    let provider: BrowserProvider | JsonRpcProvider;

    if (evmProvider) {
      provider = new BrowserProvider(evmProvider);
    } else {
      const { ETH_NETWORK } = await import("privacycash-evm");
      provider = new JsonRpcProvider(ETH_NETWORK.rpcUrl);
    }

    const [ethBalance, usdtRaw] = await Promise.all([
      provider.getBalance(address),
      new Contract(
        ETH_USDT_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        provider,
      ).balanceOf(address) as Promise<bigint>,
    ]);

    newBalances.ETH.publicBalance = Number(formatEther(ethBalance));
    newBalances.USDT.publicBalance = Number(formatUnits(usdtRaw, 6));

    if (evmSignature) {
      const tokens: EvmPrivacyToken[] = ["eth", "usdt"];
      await Promise.all(
        tokens.map(async (token) => {
          const symbol = token === "eth" ? "ETH" : "USDT";
          newBalances[symbol].privateBalance = await getEthereumPrivateBalance(
            {
              address,
              signature: evmSignature,
              token,
            },
          );
        }),
      );
      setIsSDKInitialized(true);
    } else {
      setIsSDKInitialized(false);
    }

    setBalances(newBalances);
  }, [address, evmProvider, evmSignature, initializeBalances]);

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address) {
      setBalances(initializeBalances());
      setIsSDKInitialized(false);
      initializationAttempted.current = false;
      return;
    }

    if (chain === "ethereum") {
      setIsLoading(true);
      setError(null);
      try {
        await fetchEthereumBalances();
      } catch (err) {
        console.error("Error fetching Ethereum balances:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch balances",
        );
      } finally {
        setIsLoading(false);
      }
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
          async ([symbol, config]) => {
            const tokenSymbol = symbol as TokenSymbol;
            if (config.isNative) {
              const privateBal = await privacyCashSDK.getPrivateBalance();
              newBalances[tokenSymbol].privateBalance = privateBal;
            }
            // TODO: Add support for private SPL token balances
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
  }, [
    address,
    chain,
    isConnected,
    initializeBalances,
    initializeSDK,
    fetchEthereumBalances,
  ]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Reset initialization flag when wallet changes
  useEffect(() => {
    initializationAttempted.current = false;
    setIsSDKInitialized(false);
  }, [address]);

  const refresh = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Get array of all tokens for UI rendering
  const tokensArray = useCallback((): TokenBalance[] => {
    return Object.values(balances).sort((a, b) => {
      const native = chain === "ethereum" ? "ETH" : "SOL";
      if (a.symbol === native) return -1;
      if (b.symbol === native) return 1;
      const aTotal = a.publicBalance + a.privateBalance;
      const bTotal = b.publicBalance + b.privateBalance;
      if (bTotal !== aTotal) return bTotal - aTotal;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [balances, chain]);

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
    chain,
    tokens: tokensArray(),
    shieldableTokens: getShieldableTokens(),
    privateTokens: getPrivateTokens(),
    isLoading,
    error,
    isSDKInitialized,
    refresh,
  };
}
