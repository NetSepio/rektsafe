"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, KeyRound } from "lucide-react";
import { WalletGuard } from "@/components/wallet-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabNavigation } from "./components/tab-navigation";
import { SplitKeysSection } from "./components/split-keys-section";
import { EncryptSection } from "./components/encrypt-section";
import { DecryptSection } from "./components/decrypt-section";
import { SignSection } from "./components/sign-section";
import { VerifySection } from "./components/verify-section";
import { TSSProvider, useTSS } from "./context/tss-context";

export type Tab = "split" | "encrypt" | "decrypt" | "sign" | "verify";

function TerminalOutput({
  lines,
  type = "info",
}: {
  lines: string[];
  type?: "info" | "success" | "error" | "warning";
}) {
  const colors = {
    info: "text-[#00d4ff]",
    success: "text-primary",
    error: "text-[#ff3366]",
    warning: "text-[#ffaa00]",
  };

  return (
    <div className="rounded-lg overflow-hidden bg-black/80 border border-border/50 font-mono text-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-border/10 border-b border-border/30">
        <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
        <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-xs text-muted-foreground">output</span>
      </div>
      <div className="p-3 space-y-1">
        {lines.map((line, i) => (
          <div key={i} className={colors[type]}>
            <span className="text-muted-foreground">$</span> {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function Sidebar() {
  const { output, hasGeneratedKeys, threshold, totalParties, shares } = useTSS();

  return (
    <div className="space-y-6">
      {/* Output Terminal */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-24">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-mono">
            <Terminal className="w-4 h-4 text-primary" />
            Output
          </CardTitle>
        </CardHeader>
        <CardContent>
          {output ? (
            <TerminalOutput lines={output.lines} type={output.type} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-mono">No output yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Start by splitting keys
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      {hasGeneratedKeys && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-black/30">
                  <span className="text-xs text-muted-foreground">Total Parties</span>
                  <div className="text-xl font-mono text-primary">
                    {totalParties}
                  </div>
                </div>
                <div className="p-2 rounded bg-black/30">
                  <span className="text-xs text-muted-foreground">Threshold</span>
                  <div className="text-xl font-mono text-accent">
                    {threshold}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Any {threshold} of {totalParties} can decrypt/sign
              </p>

              {/* Share indicators */}
              <div className="pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground block mb-2">Key Shares</span>
                <div className="flex flex-wrap gap-1.5">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center"
                      title={`Party ${share.id}`}
                    >
                      <KeyRound className="w-3.5 h-3.5 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function ZkSigContent() {
  const [activeTab, setActiveTab] = useState<Tab>("split");

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider">
              Zero Knowledge Signatures
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-foreground">Threshold </span>
            <span className="gradient-text">Signatures</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
            Split your keys, encrypt your data, and sign messages with threshold cryptography.
            Your keys, your control.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "split" && <SplitKeysSection />}
                {activeTab === "encrypt" && <EncryptSection />}
                {activeTab === "decrypt" && <DecryptSection />}
                {activeTab === "sign" && <SignSection />}
                {activeTab === "verify" && <VerifySection />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ZkSigPage() {
  return (
    <WalletGuard>
      <TSSProvider>
        <ZkSigContent />
      </TSSProvider>
    </WalletGuard>
  );
}
