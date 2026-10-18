export const ETHEREUM_CHAIN_ID = 1;

export interface PrivacyNetwork {
  chainId: number;
  name: string;
  shortName: string;
  nativeSymbol: "ETH" | "BNB";
  /** Symbols that have a Privacy Cash pool on this mainnet. */
  tokens: readonly string[];
  explorerUrl: string;
}

// Mainnets privacycash-evm 1.3.3 can shield. Testnets are omitted on purpose.
export const PRIVACY_NETWORKS: readonly PrivacyNetwork[] = [
  {
    chainId: 1,
    name: "Ethereum",
    shortName: "Ethereum",
    nativeSymbol: "ETH",
    tokens: ["ETH", "USDT"],
    explorerUrl: "https://etherscan.io",
  },
  {
    chainId: 8453,
    name: "Base",
    shortName: "Base",
    nativeSymbol: "ETH",
    tokens: ["ETH", "USDC"],
    explorerUrl: "https://basescan.org",
  },
  {
    chainId: 56,
    name: "BNB Smart Chain",
    shortName: "BNB Chain",
    nativeSymbol: "BNB",
    tokens: ["BNB", "USDT"],
    explorerUrl: "https://bscscan.com",
  },
  {
    chainId: 4663,
    name: "Robinhood Chain",
    shortName: "Robinhood",
    nativeSymbol: "ETH",
    tokens: ["ETH", "USDG"],
    explorerUrl: "https://robinhoodchain.blockscout.com",
  },
];

export function privacyNetworkById(
  chainId: number | undefined | null,
): PrivacyNetwork | undefined {
  if (chainId == null || !Number.isFinite(chainId)) return undefined;
  return PRIVACY_NETWORKS.find((network) => network.chainId === chainId);
}

export function joinTokens(symbols: readonly string[]): string {
  if (symbols.length <= 1) return symbols[0] ?? "";
  if (symbols.length === 2) return `${symbols[0]} and ${symbols[1]}`;
  return `${symbols.slice(0, -1).join(", ")}, and ${symbols[symbols.length - 1]}`;
}

export const EVM_PRIVACY_TOKEN_SUMMARY = PRIVACY_NETWORKS.map(
  (network) => `${network.name} (${joinTokens(network.tokens)})`,
).join(", ");
