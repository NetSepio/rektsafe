"use client";

import { motion } from "framer-motion";
import { Shield, Send, Unlock, History } from "lucide-react";
import type { Tab } from "../page";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
  { id: "shield", label: "Shield", icon: Shield },
  { id: "send", label: "Send", icon: Send },
  { id: "unshield", label: "Unshield", icon: Unlock },
  { id: "history", label: "History", icon: History },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1.5">
      {/* Desktop: Horizontal tabs */}
      <div className="hidden sm:flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-semibold text-sm transition-all duration-300 flex-1 justify-center ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                <Icon className="w-4 h-4" />
              </span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: Grid layout */}
      <div className="grid grid-cols-2 sm:hidden gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono font-semibold text-sm transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/10 border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
