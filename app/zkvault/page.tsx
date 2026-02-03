"use client";

/**
 * zkVault - NFT-Based Lending Vault Page
 *
 * Features:
 * - Deposit USDC/USDT to receive NFT positions
 * - View position status and accrued yield
 * - Submit withdrawal requests with 48h cooling-off
 * - Claim yield separately from principal
 * - Admin dashboard for multisig operations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Shield } from "lucide-react";
import { WalletGuard } from "@/components/wallet-guard";
import { VaultProvider } from "./context/vault-context";
import { TabNavigation } from "./components/tab-navigation";
import { TVLCard } from "./components/tvl-card";
import { DepositSection } from "./components/deposit-section";
import { StatusSection } from "./components/status-section";
import { WithdrawSection } from "./components/withdraw-section";
import { ClaimSection } from "./components/claim-section";
import { AdminSection } from "./components/admin-section";
import type { VaultTab } from "./types";

function VaultContent() {
  const [activeTab, setActiveTab] = useState<VaultTab>("deposit");
  const [isAdmin] = useState(true); // In production, check against admin addresses

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
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider">
              ZERO KNOWLEDGE LENDING
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-foreground">zk</span>
            <span className="gradient-text">Vault</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
            Deposit funds, earn yield. Secure lending with multisig protection.
          </p>
        </motion.div>

        {/* TVL Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <TVLCard />
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdmin={isAdmin}
          />
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
            {activeTab === "deposit" && <DepositSection />}
            {activeTab === "status" && <StatusSection />}
            {activeTab === "withdraw" && <WithdrawSection />}
            {activeTab === "claim" && <ClaimSection />}
            {activeTab === "admin" && <AdminSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ZkVaultPage() {
  return (
    <WalletGuard>
      <VaultProvider>
        <VaultContent />
      </VaultProvider>
    </WalletGuard>
  );
}
