"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";
import { EvmGuard } from "@/components/evm-guard";
import { TabNavigation } from "./components/tab-navigation";
import { CreateSection } from "./components/create-section";
import { ListSection } from "./components/list-section";
import type { PromiseTab } from "./types";

export default function PromisesPage() {
  const [activeTab, setActiveTab] = useState<PromiseTab>("create");

  return (
    <EvmGuard>
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
                Rekt Promises
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="text-foreground">Time-Locked </span>
              <span className="gradient-text">Promises</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
              Lock MON for a recipient. Release by date or by a designated
              approver. No backend, no custody.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex justify-center"
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
              {activeTab === "create" && <CreateSection />}
              {activeTab === "sent" && <ListSection mode="sent" />}
              {activeTab === "received" && <ListSection mode="received" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </EvmGuard>
  );
}
