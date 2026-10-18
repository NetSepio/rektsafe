import { privacyNetworkById } from "@/lib/chains";

export type TransferChain = "solana" | "ethereum";

export function txExplorerUrl(
  chain: TransferChain | undefined,
  signature: string,
  chainId?: number,
) {
  if (chain === "ethereum") {
    const explorer =
      privacyNetworkById(chainId)?.explorerUrl ?? "https://etherscan.io";
    return `${explorer}/tx/${signature}`;
  }
  return `https://explorer.solana.com/tx/${signature}`;
}
