"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { ETHEREUM_CHAIN_ID } from "@/lib/chains";

export function useIsEthereum(): boolean {
  const { chainId, caipNetworkId } = useAppKitNetwork();

  if (chainId !== undefined && Number(chainId) === ETHEREUM_CHAIN_ID) {
    return true;
  }

  if (caipNetworkId === `eip155:${ETHEREUM_CHAIN_ID}`) {
    return true;
  }

  return false;
}
