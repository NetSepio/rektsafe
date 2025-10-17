import "./globals.css";
import type { Metadata } from "next";
import WalletContextProvider from "./providers/WalletContext";

export const metadata: Metadata = {
  title: "TSS File Encryption with Solana Wallet",
  description: "Next.js + Solana + TSS demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
