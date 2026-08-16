"use client";

import { motion } from "framer-motion";
import { Gift, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { PromiseTab } from "../types";

interface TabNavigationProps {
  activeTab: PromiseTab;
  onTabChange: (tab: PromiseTab) => void;
}

const tabs: { id: PromiseTab; label: string; icon: React.ElementType }[] = [
  { id: "create", label: "Create", icon: Gift },
  { id: "sent", label: "Sent", icon: ArrowUpRight },
  { id: "received", label: "Received", icon: ArrowDownRight },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-300 font-mono
              ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="promiseTabBg"
                className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
