"use client";

import { useAppKitNetwork } from "@reown/appkit/react";
import { MONAD_CHAIN_ID } from "@/lib/chains";

export function useIsMonad(): boolean {
  const { chainId, caipNetworkId } = useAppKitNetwork();

  if (chainId !== undefined && Number(chainId) === MONAD_CHAIN_ID) {
    return true;
  }

  if (caipNetworkId === `eip155:${MONAD_CHAIN_ID}`) {
    return true;
  }

  return false;
}
