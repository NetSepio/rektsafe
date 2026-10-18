import type { Metadata } from "next";
import { ogImage } from "@/app/metadata";

export const metadata: Metadata = {
  title: "RektSafe Vault",
  description:
    "RektSafe Vault is a hardware security device for cryptocurrency self-custody, passwordless authentication, and AI-powered transaction protection. Launching soon.",
  keywords: [
    "RektSafe Vault",
    "hardware wallet",
    "self-custody",
    "passkeys",
    "FIDO2",
    "clear signing",
    "Ethereum",
    "Solana",
    "rektSafe",
  ],
  alternates: {
    canonical: "/wallet/",
  },
  openGraph: {
    title: "RektSafe Vault | rektSafe",
    description:
      "Your assets. Your identity. Your keys. Your control. AI-powered hardware security, launching soon.",
    type: "website",
    url: "https://rektsafe.com/wallet/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "RektSafe Vault | rektSafe",
    description:
      "Don't just protect your keys. Protect what you sign. Hardware security, launching soon.",
    creator: "@NetSepio",
    images: [ogImage.url],
  },
};

export default function HardwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
