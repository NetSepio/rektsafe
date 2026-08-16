"use client";

import { useAppKitAccount } from "@reown/appkit/react";

export type WalletType = "evm" | "solana" | null;

export function useWalletType(): WalletType {
  const { caipAddress } = useAppKitAccount();

  if (!caipAddress) return null;

  if (caipAddress.startsWith("eip155:")) {
    return "evm";
  }

  if (caipAddress.startsWith("solana:")) {
    return "solana";
  }

  return null;
}
