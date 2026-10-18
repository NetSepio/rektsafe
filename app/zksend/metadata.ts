import type { Metadata } from "next";
import { ogImage } from "@/app/metadata";

export const metadata: Metadata = {
  title: { absolute: "zkSend | Private Transfers - rektSafe" },
  description:
    "Shield, send, and unshield privately. Solana supports SOL, USDC, and USDT. EVM mainnets: Ethereum (ETH, USDT), Base (ETH, USDC), BNB Smart Chain (BNB, USDT), Robinhood Chain (ETH, USDG).",
  keywords: [
    "zkSend",
    "private transfers",
    "Solana",
    "Ethereum",
    "Base",
    "BNB",
    "Robinhood Chain",
    "ETH",
    "USDT",
    "USDC",
    "USDG",
    "zero knowledge",
    "rektSafe",
  ],
  alternates: { canonical: "/zksend/" },
  openGraph: {
    title: "zkSend | Private Transfers - rektSafe",
    description:
      "Shield, send, and unshield on Solana (SOL, USDC, USDT) or a Privacy Cash EVM mainnet.",
    type: "website",
    url: "https://rektsafe.com/zksend/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkSend | Private Transfers - rektSafe",
    description:
      "Shield, send, and unshield on Solana or a supported EVM mainnet.",
    creator: "@NetSepio",
    images: [ogImage.url],
  },
};
