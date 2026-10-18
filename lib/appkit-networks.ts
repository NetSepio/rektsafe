import {
  base,
  bsc,
  defineChain,
  mainnet,
  type AppKitNetwork,
} from "@reown/appkit/networks";

// Robinhood Chain mainnet (4663). The testnet (46630) is not listed.
export const robinhoodChain = defineChain({
  id: 4663,
  chainNamespace: "eip155",
  caipNetworkId: "eip155:4663",
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});

export const evmAppKitNetworks = [
  mainnet,
  base,
  bsc,
  robinhoodChain,
] as const satisfies readonly AppKitNetwork[];

export function appKitNetworkById(
  chainId: number,
): AppKitNetwork | undefined {
  return evmAppKitNetworks.find((network) => network.id === chainId);
}
