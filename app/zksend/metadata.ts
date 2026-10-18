import type { Metadata } from "next";
import { ogImage } from "@/app/metadata";

export const metadata: Metadata = {
  title: { absolute: "zkSend | Private Transfers - rektSafe" },
  description:
    "Shield, send, and unshield privately. Solana supports SOL, USDC, and USDT. Ethereum mainnet supports ETH and USDT.",
  keywords: [
    "zkSend",
    "private transfers",
    "Solana",
    "Ethereum",
    "ETH",
    "USDT",
    "zero knowledge",
    "rektSafe",
  ],
  alternates: { canonical: "/zksend/" },
  openGraph: {
    title: "zkSend | Private Transfers - rektSafe",
    description:
      "Shield, send, and unshield on Solana (SOL, USDC, USDT) or Ethereum mainnet (ETH, USDT).",
    type: "website",
    url: "https://rektsafe.com/zksend/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkSend | Private Transfers - rektSafe",
    description:
      "Shield, send, and unshield on Solana or Ethereum mainnet.",
    creator: "@NetSepio",
    images: [ogImage.url],
  },
};
