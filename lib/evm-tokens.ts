export type EvmPrivacyToken = "eth" | "bnb" | "usdc" | "usdt" | "usdg";
export type EvmTokenSymbol = "ETH" | "BNB" | "USDC" | "USDT" | "USDG";

export interface EvmTokenMeta {
  symbol: EvmTokenSymbol;
  privacyToken: EvmPrivacyToken;
  name: string;
  decimals: number;
  color: string;
  isNative: boolean;
  mint: string | null;
}

// Structural slice of privacycash-evm NetworkConfig. A token is listed only
// when both the pool and the token contract are set.
export interface EvmPoolSource {
  chainKey: string;
  nativeSymbol?: "ETH" | "BNB";
  nativeToken?: "eth" | "bnb";
  usdcPoolAddress: string;
  usdcTokenAddress: string;
  usdcDecimals: number;
  usdtPoolAddress: string;
  usdtTokenAddress: string;
  usdtDecimals: number;
  usdgPoolAddress: string;
  usdgTokenAddress: string;
  usdgDecimals: number;
}

const TOKEN_COLOR: Record<EvmTokenSymbol, string> = {
  ETH: "#00d4ff",
  BNB: "#f3ba2f",
  USDC: "#2775ca",
  USDT: "#ff006e",
  USDG: "#9d4edd",
};

export function evmTokensFromPools(net: EvmPoolSource): EvmTokenMeta[] {
  const nativeSymbol: "ETH" | "BNB" =
    net.nativeSymbol ?? (net.chainKey === "bnb" ? "BNB" : "ETH");
  const nativeToken: "eth" | "bnb" =
    net.nativeToken ?? (nativeSymbol === "BNB" ? "bnb" : "eth");

  const tokens: EvmTokenMeta[] = [
    {
      symbol: nativeSymbol,
      privacyToken: nativeToken,
      name: nativeSymbol === "BNB" ? "BNB" : "Ether",
      decimals: 18,
      color: TOKEN_COLOR[nativeSymbol],
      isNative: true,
      mint: null,
    },
  ];

  const erc20 = [
    {
      symbol: "USDC" as const,
      privacyToken: "usdc" as const,
      name: "USD Coin",
      pool: net.usdcPoolAddress,
      address: net.usdcTokenAddress,
      decimals: net.usdcDecimals,
    },
    {
      symbol: "USDT" as const,
      privacyToken: "usdt" as const,
      name: "Tether",
      pool: net.usdtPoolAddress,
      address: net.usdtTokenAddress,
      decimals: net.usdtDecimals,
    },
    {
      symbol: "USDG" as const,
      privacyToken: "usdg" as const,
      name: "USDG",
      pool: net.usdgPoolAddress,
      address: net.usdgTokenAddress,
      decimals: net.usdgDecimals,
    },
  ];

  for (const token of erc20) {
    if (!token.pool || !token.address) continue;
    tokens.push({
      symbol: token.symbol,
      privacyToken: token.privacyToken,
      name: token.name,
      decimals: token.decimals,
      color: TOKEN_COLOR[token.symbol],
      isNative: false,
      mint: token.address,
    });
  }

  return tokens;
}
