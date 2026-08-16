"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Shield, Lock, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useWalletType } from "@/hooks/use-wallet-type";
import { useIsMonad } from "@/hooks/use-is-monad";
import { monadTestnet } from "@/lib/chains";

interface EvmGuardProps {
  children: ReactNode;
}

function ConnectScreen() {
  const { open } = useAppKit();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
              EVM Wallet Required
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-foreground">Connect Your </span>
            <span className="gradient-text">EVM Wallet</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">
            Promises are secured on Monad Testnet. Connect an EVM wallet to
            lock, approve, and claim MON gifts.
          </p>
        </motion.div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center glow-primary">
                <Shield className="w-12 h-12 text-primary" />
              </div>

              <Button
                size="lg"
                onClick={() => open()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg px-8"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect EVM Wallet
              </Button>

              <p className="text-xs text-muted-foreground font-mono">
                Use MetaMask, Rabby, or any EVM-compatible wallet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WrongWalletScreen() {
  const { open } = useAppKit();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 mb-4">
          <Wallet className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
            Wrong Wallet Type
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="text-foreground">Connect an </span>
          <span className="gradient-text">EVM Wallet</span>
        </h1>
        <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto mb-6">
          A Solana wallet is connected. Disconnect it and connect an EVM wallet
          to use Promises on Monad Testnet.
        </p>
        <Button
          size="lg"
          onClick={() => open()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Switch to EVM Wallet
        </Button>
      </div>
    </div>
  );
}

function WrongNetworkScreen() {
  const { switchNetwork } = useAppKitNetwork();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 mb-4">
          <Network className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">
            Network Required
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="text-foreground">Switch to </span>
          <span className="gradient-text">Monad Testnet</span>
        </h1>
        <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto mb-6">
          Promises run on Monad Testnet. Switch your wallet network to continue.
        </p>
        <Button
          size="lg"
          onClick={() => switchNetwork(monadTestnet)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
        >
          <Network className="w-5 h-5 mr-2" />
          Switch to Monad Testnet
        </Button>
      </div>
    </div>
  );
}

export function EvmGuard({ children }: EvmGuardProps) {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAppKitAccount();
  const walletType = useWalletType();
  const isMonad = useIsMonad();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectScreen />;
  }

  if (walletType !== "evm") {
    return <WrongWalletScreen />;
  }

  if (!isMonad) {
    return <WrongNetworkScreen />;
  }

  return <>{children}</>;
}
