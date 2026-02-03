"use client";

/**
 * zkVault Tab Navigation
 *
 * Tab switcher for vault sections:
 * - Deposit: Fund the vault and receive NFT
 * - Status: View positions and yield
 * - Withdraw: Submit withdrawal requests
 * - Claim: Claim yield separately
 * - Admin: Admin dashboard (if authorized)
 */

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowLeftRight,
  Coins,
  Shield,
  Lock,
} from "lucide-react";
import type { VaultTab } from "../types";

interface TabNavigationProps {
  activeTab: VaultTab;
  onTabChange: (tab: VaultTab) => void;
  isAdmin?: boolean;
}

interface TabConfig {
  id: VaultTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: "deposit",
    label: "Deposit",
    icon: Wallet,
    description: "Fund vault & mint NFT",
  },
  {
    id: "status",
    label: "My Positions",
    icon: TrendingUp,
    description: "View yields & status",
  },
  {
    id: "withdraw",
    label: "Withdraw",
    icon: ArrowLeftRight,
    description: "Request principal back",
  },
  {
    id: "claim",
    label: "Claim Yield",
    icon: Coins,
    description: "Claim accrued yield",
  },
];

const adminTab: TabConfig = {
  id: "admin",
  label: "Admin",
  icon: Shield,
  description: "Manage requests",
};

export function TabNavigation({
  activeTab,
  onTabChange,
  isAdmin = false,
}: TabNavigationProps) {
  const allTabs = isAdmin ? [...tabs, adminTab] : tabs;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {allTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl
              border transition-all duration-300 text-left
              ${
                isActive
                  ? "bg-primary/10 border-primary/50 text-primary"
                  : "bg-card/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl border-2 border-primary/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <div className="relative z-10 flex flex-col items-center gap-1.5 w-full">
              <div
                className={`
                  p-2 rounded-lg transition-colors
                  ${isActive ? "bg-primary/20" : "bg-muted/50"}
                `}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="text-center">
                <div className="font-semibold text-sm">{tab.label}</div>
                <div className="text-xs opacity-70 hidden md:block">
                  {tab.description}
                </div>
              </div>
            </div>

            {/* Admin badge */}
            {tab.id === "admin" && (
              <div className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-accent" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
