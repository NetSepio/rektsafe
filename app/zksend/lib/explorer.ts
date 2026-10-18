export type TransferChain = "solana" | "ethereum";

export function txExplorerUrl(
  chain: TransferChain | undefined,
  signature: string,
) {
  if (chain === "ethereum") {
    return `https://etherscan.io/tx/${signature}`;
  }
  return `https://explorer.solana.com/tx/${signature}`;
}
