import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rektSafe | Dead Man's Switch for Crypto & Data",
  description: "Secure your digital legacy. A decentralized dead man's switch that safely passes your crypto, files, and data to your loved ones if something happens to you.",
  keywords: ["crypto", "dead man's switch", "inheritance", "blockchain", "encryption", "TSS", "threshold signatures"],
  authors: [{ name: "rektSafe" }],
  openGraph: {
    title: "rektSafe | Dead Man's Switch for Crypto & Data",
    description: "Secure your digital legacy. Pass your crypto and data to family if you're gone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen grid-pattern`}
      >
        <div className="scanlines" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
