"use client";

import { motion } from "framer-motion";
import { KeyRound, Lock, Unlock, FileSignature, ShieldCheck } from "lucide-react";
import type { Tab } from "../page";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof KeyRound }[] = [
  { id: "split", label: "Split Keys", icon: KeyRound },
  { id: "encrypt", label: "Encrypt", icon: Lock },
  { id: "decrypt", label: "Decrypt", icon: Unlock },
  { id: "sign", label: "Sign", icon: FileSignature },
  { id: "verify", label: "Verify", icon: ShieldCheck },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1.5">
      {/* Desktop: Horizontal tabs */}
      <div className="hidden lg:flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-mono font-semibold text-sm transition-all duration-300 flex-1 justify-center ${
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

      {/* Tablet: 3-2 grid */}
      <div className="hidden sm:grid lg:hidden grid-cols-3 gap-1.5">
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-mono font-semibold text-sm transition-all duration-300 ${
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
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-1.5 mt-1.5">
        {tabs.slice(3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-mono font-semibold text-sm transition-all duration-300 ${
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

      {/* Mobile: 2-3 grid */}
      <div className="grid sm:hidden grid-cols-2 gap-1.5">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-mono font-semibold text-sm transition-all duration-300 ${
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
      <div className="grid sm:hidden grid-cols-3 gap-1.5 mt-1.5">
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-1 px-2 py-3 rounded-xl font-mono font-semibold text-xs transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/10 border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
