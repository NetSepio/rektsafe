"use client";

import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { mainnet } from "@reown/appkit/networks";
import { useWalletType } from "@/hooks/use-wallet-type";
import { useIsEthereum } from "@/hooks/use-is-ethereum";
import { motion } from "framer-motion";
import { Wallet, Shield, Lock, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode, useState, useEffect } from "react";
import { useWalletSession } from "@/components/wallet-session-provider";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

interface WalletGuardProps {
  children: ReactNode;
  /** zkSend accepts an Ethereum mainnet wallet for shielded ETH and USDT. */
  allowEthereum?: boolean;
}

// Wallet connect screen component
function WalletConnectScreen() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 mb-4">
            <Lock className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
              Authentication Required
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-foreground">Connect Your </span>
            <span className="gradient-text">Wallet</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
            Access zkSig for threshold signatures or zkSend for private
            transfers on Solana and Ethereum. Connect a Solana or EVM wallet
            to continue.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Dark header section */}
                <div className="bg-gradient-to-b from-card to-background p-8 border-b border-border/50">
                  <div className="flex flex-col items-center gap-6">
                    {/* Lock Animation */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center glow-primary">
                        <Shield className="w-12 h-12 text-primary" />
                      </div>
                      <motion.div
                        className="absolute -inset-3 rounded-2xl border-2 border-primary/20"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.5, 0.1, 0.5],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-mono font-bold text-foreground">
                        Multi-Chain Access
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Connect any supported Solana or EVM wallet. The modal
                        will show available networks and wallets.
                      </p>
                    </div>

                    {/* Supported Wallets */}
                    <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-mono">
                      <span className="text-muted-foreground">Supported:</span>
                      <div className="flex flex-wrap justify-center items-center gap-2">
                        <span className="px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-semibold">
                          Phantom
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-semibold">
                          Solflare
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-semibold">
                          MetaMask
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-semibold">
                          WalletConnect
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connect button section */}
                <div className="p-8 bg-card/50 flex justify-center">
                  <ConnectWalletButton
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg px-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              {
                icon: Shield,
                title: "Secure",
                desc: "Client-side encryption only",
              },
              {
                icon: Lock,
                title: "Private",
                desc: "No data stored on servers",
              },
              {
                icon: Wallet,
                title: "Free",
                desc: "No fees to use the platform",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-4 rounded-xl bg-card/40 border border-border/50 text-center backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-mono font-semibold text-foreground mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Session initialization screen
function SessionInitScreen({
  isLoading,
  error,
  onRetry,
}: {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
              Initializing Session
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-foreground">Secure </span>
            <span className="gradient-text">Session</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
            Please sign the message to establish a secure session for private
            transfers. This signature is used to derive your encryption key.
          </p>
        </motion.div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center glow-primary">
                  {isLoading ? (
                    <div className="w-10 h-10 border-3 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-10 h-10 text-primary" />
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-mono font-bold text-foreground">
                  {isLoading
                    ? "Waiting for Signature..."
                    : "Signature Required"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {error ||
                    "Please approve the signature request in your wallet"}
                </p>
              </div>

              {error && (
                <Button
                  onClick={onRetry}
                  className="bg-primary hover:bg-primary/90"
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SwitchToEthereumScreen() {
  const { switchNetwork } = useAppKitNetwork();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 mb-4">
          <Network className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
            Ethereum Required
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="text-foreground">Switch to </span>
          <span className="gradient-text">Ethereum</span>
        </h1>
        <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto mb-6">
          Shielded transfers for EVM wallets run on Ethereum mainnet, for ETH
          and USDT. Switch networks to continue.
        </p>
        <Button
          size="lg"
          onClick={() => switchNetwork(mainnet)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
        >
          <Network className="w-5 h-5 mr-2" />
          Switch to Ethereum
        </Button>
      </div>
    </div>
  );
}

// Wrong wallet type screen
function WrongWalletScreen() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 mb-4">
          <Wallet className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
            Solana Required
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="text-foreground">Connect a </span>
          <span className="gradient-text">Solana Wallet</span>
        </h1>
        <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
          This feature is built for Solana. An EVM wallet is connected.
          Disconnect it and connect a Solana wallet to continue, or open zkSend
          for shielded ETH and USDT.
        </p>
      </div>
    </div>
  );
}

// Inner component that uses AppKit hooks - only rendered client-side
function WalletGuardInner({
  children,
  allowEthereum = false,
}: WalletGuardProps) {
  const { isConnected } = useAppKitAccount();
  const walletType = useWalletType();
  const isEthereum = useIsEthereum();
  const {
    isInitialized,
    isLoading,
    error,
    evmSignature,
    initializeSession,
    initializeEvmSession,
  } = useWalletSession();

  // Initialize session when wallet is connected but session is not initialized
  useEffect(() => {
    if (walletType === "evm") return;
    if (isConnected && !isInitialized && !isLoading && !error) {
      initializeSession();
    }
  }, [
    walletType,
    isConnected,
    isInitialized,
    isLoading,
    error,
    initializeSession,
  ]);

  useEffect(() => {
    if (!allowEthereum || walletType !== "evm" || !isEthereum) return;
    if (isConnected && !evmSignature && !isLoading && !error) {
      initializeEvmSession();
    }
  }, [
    allowEthereum,
    walletType,
    isEthereum,
    isConnected,
    evmSignature,
    isLoading,
    error,
    initializeEvmSession,
  ]);

  if (!isConnected) {
    return <WalletConnectScreen />;
  }

  if (walletType === "evm") {
    if (!allowEthereum) {
      return <WrongWalletScreen />;
    }
    if (!isEthereum) {
      return <SwitchToEthereumScreen />;
    }
    if (!evmSignature) {
      return (
        <SessionInitScreen
          isLoading={isLoading}
          error={error}
          onRetry={initializeEvmSession}
        />
      );
    }
    return <>{children}</>;
  }

  // Show loading state while initializing session
  if (!isInitialized) {
    return (
      <SessionInitScreen
        isLoading={isLoading}
        error={error}
        onRetry={initializeSession}
      />
    );
  }

  // User is connected and session is initialized - render children
  return <>{children}</>;
}

// Main export component with SSR protection
export function WalletGuard({ children, allowEthereum }: WalletGuardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 mb-4">
              <Lock className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
                Authentication Required
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              <span className="text-foreground">Connect Your </span>
              <span className="gradient-text">Wallet</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
              Secure access to your threshold signature vault and private
              transfers. Connect your Solana wallet to get started.
            </p>
          </div>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="bg-gradient-to-b from-card to-background p-8 border-b border-border/50">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center glow-primary">
                      <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-mono font-bold text-foreground">
                        Loading...
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <WalletGuardInner allowEthereum={allowEthereum}>{children}</WalletGuardInner>
  );
}
