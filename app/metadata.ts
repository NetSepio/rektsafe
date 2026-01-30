import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: "rektSafe | Dead Man's Switch for Crypto & Data",
  description:
    "Secure your digital legacy. A decentralized dead man's switch that safely passes your crypto, files, and data to your loved ones if something happens to you.",
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
    description: "Your data, your control. Learn about our privacy-first approach.",
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
