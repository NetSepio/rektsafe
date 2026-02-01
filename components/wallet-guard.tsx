"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitWallet } from "@reown/appkit-wallet-button/react";
import { motion } from "framer-motion";
import { Wallet, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode, useState, useEffect } from "react";
import { useWalletSession } from "@/components/wallet-session-provider";

interface WalletGuardProps {
  children: ReactNode;
}

// Check if wallet is installed
const getWalletInstallUrl = (wallet: string): string | null => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
      userAgent,
    );

  if (wallet === "phantom") {
    if (isMobile) {
      return "https://phantom.app/download";
    }
    return "https://phantom.app/download";
  }
  if (wallet === "solflare") {
    if (isMobile) {
      return "https://solflare.com/download";
    }
    return "https://solflare.com/download";
  }
  return null;
};

// Check if Phantom is installed
const isPhantomInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  const phantom = (
    window as Window & { phantom?: { solana?: { isPhantom?: boolean } } }
  ).phantom;
  return phantom?.solana?.isPhantom === true;
};

// Check if Solflare is installed
const isSolflareInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  const solflare = (window as Window & { solflare?: { isSolflare?: boolean } })
    .solflare;
  return solflare?.isSolflare === true;
};

// Wallet Connect Options Component
function WalletConnectOptions({ onConnect }: { onConnect?: () => void }) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletStates, setWalletStates] = useState({
    phantom: { installed: false, checked: false },
    solflare: { installed: false, checked: false },
  });

  // Check wallet installation status on mount
  useEffect(() => {
    setWalletStates({
      phantom: { installed: isPhantomInstalled(), checked: true },
      solflare: { installed: isSolflareInstalled(), checked: true },
    });
  }, []);

  // Use a single hook instance for all connections
  const { connect } = useAppKitWallet({
    namespace: "solana",
    onSuccess: () => {
      setIsConnecting(null);
      setError(null);
      onConnect?.();
    },
    onError: (err: Error) => {
      setIsConnecting(null);
      setError(err.message || "Failed to connect");
      console.error("Wallet connection error:", err);
    },
  });

  const handleConnect = async (
    wallet: "phantom" | "solflare" | "walletConnect",
  ) => {
    setError(null);
    setIsConnecting(wallet);

    try {
      if (wallet === "walletConnect") {
        await connect("walletConnect");
      } else {
        // For Phantom and Solflare, try direct connection
        // The connect function will handle the specific wallet
        await connect(wallet);
      }
    } catch (err) {
      setIsConnecting(null);
      setError("Connection failed. Please try again.");
      console.error("Connection error:", err);
    }
  };

  const handleInstall = (wallet: string) => {
    const url = getWalletInstallUrl(wallet);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <div className="w-full max-w-xs p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Phantom Button */}
      {walletStates.phantom.checked && !walletStates.phantom.installed ? (
        <Button
          onClick={() => handleInstall("phantom")}
          className="w-full max-w-xs h-14 text-lg font-mono font-semibold bg-[#AB9FF2] hover:bg-[#9B8FE2] text-white border-0 transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          Install Phantom
        </Button>
      ) : (
        <Button
          onClick={() => handleConnect("phantom")}
          disabled={!!isConnecting}
          className="w-full max-w-xs h-14 text-lg font-mono font-semibold bg-[#AB9FF2] hover:bg-[#9B8FE2] text-white border-0 transition-all duration-300"
        >
          {isConnecting === "phantom" ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              Phantom
            </>
          )}
        </Button>
      )}

      {/* Solflare Button */}
      {walletStates.solflare.checked && !walletStates.solflare.installed ? (
        <Button
          onClick={() => handleInstall("solflare")}
          className="w-full max-w-xs h-14 text-lg font-mono font-semibold bg-[#FC4D1C] hover:bg-[#EC3D0C] text-white border-0 transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Install Solflare
        </Button>
      ) : (
        <Button
          onClick={() => handleConnect("solflare")}
          disabled={!!isConnecting}
          className="w-full max-w-xs h-14 text-lg font-mono font-semibold bg-[#FC4D1C] hover:bg-[#EC3D0C] text-white border-0 transition-all duration-300"
        >
          {isConnecting === "solflare" ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Solflare
            </>
          )}
        </Button>
      )}

      {/* WalletConnect Button - for mobile/other wallets */}
      <Button
        onClick={() => handleConnect("walletConnect")}
        disabled={!!isConnecting}
        variant="outline"
        className="w-full max-w-xs h-12 text-base font-mono font-semibold border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300"
      >
        {isConnecting === "walletConnect" ? (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Other Wallets
          </>
        )}
      </Button>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <Wallet className="w-3.5 h-3.5" />
        <span>New to Solana?</span>
        <a
          href="https://phantom.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 hover:underline font-medium"
        >
          Get Phantom Wallet →
        </a>
      </div>
    </div>
  );
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
            Access zkSig for threshold signatures and zkSend for private
            transfers. Connect your Solana wallet to encrypt, decrypt, shield,
            and manage your digital assets with zero-knowledge privacy.
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
                        Secure Access Required
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Wallet authentication is required to access zkSig and
                        zkSend. Your keys never leave your device.
                      </p>
                    </div>

                    {/* Supported Wallets */}
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-muted-foreground">Supported:</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-semibold">
                          Phantom
                        </span>
                        <span className="px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-semibold">
                          Solflare
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connect button section */}
                <div className="p-8 bg-card/50">
                  <WalletConnectOptions />
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

// Inner component that uses AppKit hooks - only rendered client-side
function WalletGuardInner({ children }: WalletGuardProps) {
  const { isConnected } = useAppKitAccount();
  const { isInitialized, isLoading, error, initializeSession } =
    useWalletSession();

  // Initialize session when wallet is connected but session is not initialized
  useEffect(() => {
    if (isConnected && !isInitialized && !isLoading && !error) {
      initializeSession();
    }
  }, [isConnected, isInitialized, isLoading, error, initializeSession]);

  if (!isConnected) {
    return <WalletConnectScreen />;
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
export function WalletGuard({ children }: WalletGuardProps) {
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

  return <WalletGuardInner>{children}</WalletGuardInner>;
}
