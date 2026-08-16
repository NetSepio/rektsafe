import { defineChain } from "@reown/appkit/networks";

const monadRpcUrl =
  process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";

export const MONAD_CHAIN_ID = 10143;

export const monadTestnet = defineChain({
  id: MONAD_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Testnet MON Token",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [monadRpcUrl] },
    public: { http: [monadRpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  caipNetworkId: "eip155:10143",
  chainNamespace: "eip155",
});
