import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WalletProvider } from "@/components/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: {
    default: "rektSafe | Dead Man's Switch for Crypto & Data",
    template: "%s | rektSafe",
  },
  description:
    "Secure your digital legacy. A decentralized dead man's switch that safely passes your crypto, files, and data to your loved ones if something happens to you.",
  keywords: [
    "crypto",
    "dead man's switch",
    "inheritance",
    "blockchain",
    "encryption",
    "TSS",
    "threshold signatures",
    "Solana",
    "wallet",
    "digital legacy",
    "crypto inheritance",
    "secure vault",
  ],
  authors: [{ name: "rektSafe", url: "https://rektsafe.com" }],
  creator: "rektSafe",
  publisher: "rektSafe",
  robots: "index, follow",
  metadataBase: new URL("https://rektsafe.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "rektSafe | Dead Man's Switch for Crypto & Data",
    description:
      "Secure your digital legacy. Pass your crypto and data to family if you're gone.",
    type: "website",
    url: "https://rektsafe.com",
    siteName: "rektSafe",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "rektSafe - Dead Man's Switch for Crypto & Data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "rektSafe | Dead Man's Switch for Crypto & Data",
    description:
      "Secure your digital legacy. Pass your crypto and data to family if you're gone.",
    creator: "@rektsafe",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#00ff88",
      },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: undefined,
  },
  category: "technology",
  classification: "Cryptocurrency, Security, Privacy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen grid-pattern`}
      >
        <WalletProvider>
          <div className="scanlines" />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
