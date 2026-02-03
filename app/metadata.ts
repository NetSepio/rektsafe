import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: "rektSafe | Crypto Security Suite - Inheritance, Privacy & Yield",
  description:
    "rektSafe: Secure your crypto with threshold signatures (zkSig), private transfers (zkSend), and NFT-based lending vaults (zkVault). For Cypherpunks, By Cypherpunks.",
};

export const vaultMetadata: Metadata = {
  title: "Secure Vault | Threshold Signature Encryption",
  description:
    "Access the rektSafe vault. Encrypt and decrypt your files using threshold signatures. Connect your Solana wallet to secure your digital assets.",
  openGraph: {
    title: "rektSafe Vault | Secure Encryption",
    description:
      "Encrypt and decrypt files with threshold signatures. Your crypto inheritance vault.",
  },
};

export const privacyMetadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how rektSafe protects your privacy. Zero-knowledge architecture, no data collection, and client-side encryption.",
  openGraph: {
    title: "Privacy Policy | rektSafe",
    description:
      "Your data, your control. Learn about our privacy-first approach.",
  },
};

export const termsMetadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms of service for using rektSafe. Understand your responsibilities and our limitations.",
  openGraph: {
    title: "Terms of Service | rektSafe",
    description: "Terms and conditions for using rektSafe.",
  },
};
