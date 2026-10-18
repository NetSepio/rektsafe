import { Metadata } from "next";
import { ogImage } from "@/app/metadata";

export const metadata: Metadata = {
  title: { absolute: "zkSig | Threshold Signatures - rektSafe" },
  description:
    "Split keys, encrypt files, and sign or verify messages with Ed25519 and AES-256-GCM.",
  keywords: [
    "zkSig",
    "threshold signatures",
    "TSS",
    "key splitting",
    "Ed25519",
    "AES-256",
    "encryption",
    "digital signatures",
    "crypto inheritance",
  ],
  alternates: { canonical: "/zksig/" },
  openGraph: {
    title: "zkSig | Threshold Signatures - rektSafe",
    description:
      "Split keys, encrypt data, and sign messages with threshold cryptography. Your keys, your control.",
    type: "website",
    url: "https://rektsafe.com/zksig/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkSig | Threshold Signatures - rektSafe",
    description:
      "Split keys, encrypt files, and sign messages with threshold cryptography.",
    creator: "@NetSepio",
    images: [ogImage.url],
  },
};
