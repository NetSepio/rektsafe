"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletGuard } from "@/components/wallet-guard";
import { BalanceCard } from "./components/balance-card";
import { ShieldSection } from "./components/shield-section";
import { SendSection } from "./components/send-section";
import { UnshieldSection } from "./components/unshield-section";
import { HistorySection } from "./components/history-section";
import { TabNavigation } from "./components/tab-navigation";
import { TransactionProvider } from "./context/transaction-context";
import { useAppKitAccount } from "@reown/appkit/react";

export type Tab = "shield" | "send" | "unshield" | "history";

export default function ZkSendPage() {
  const [activeTab, setActiveTab] = useState<Tab>("shield");
  const { isConnected, address } = useAppKitAccount();

  return (
    <WalletGuard>
      <TransactionProvider>
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                  Zero Knowledge
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="text-foreground">Private </span>
                <span className="gradient-text">Transfers</span>
              </h1>
              <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
                Shield your assets, send privately, and unshield when needed.
                Your transactions, your privacy.
              </p>
            </motion.div>

            {/* Balance Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <BalanceCard />
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </motion.div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "shield" && <ShieldSection />}
                {activeTab === "send" && <SendSection />}
                {activeTab === "unshield" && <UnshieldSection />}
                {activeTab === "history" && <HistorySection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </TransactionProvider>
    </WalletGuard>
  );
}
