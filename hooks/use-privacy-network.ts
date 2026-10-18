"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { useWalletType } from "@/hooks/use-wallet-type";
import { privacyNetworkById, type PrivacyNetwork } from "@/lib/chains";

export function useConnectedChainId(): number | undefined {
  const { chainId, caipNetworkId } = useAppKitNetwork();

  if (chainId !== undefined && chainId !== null && `${chainId}` !== "") {
    const parsed = Number(chainId);
    if (Number.isFinite(parsed)) return parsed;
  }

  if (typeof caipNetworkId === "string") {
    const match = /^eip155:(\d+)$/.exec(caipNetworkId);
    if (match) return Number(match[1]);
  }

  return undefined;
}

export function usePrivacyNetwork(): {
  chainId: number | undefined;
  network: PrivacyNetwork | undefined;
  isSupported: boolean;
} {
  const walletType = useWalletType();
  const chainId = useConnectedChainId();
  const network = walletType === "evm" ? privacyNetworkById(chainId) : undefined;

  return {
    chainId,
    network,
    isSupported: network !== undefined,
  };
}
