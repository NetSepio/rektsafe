"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Brain, Cpu, Fingerprint, ShieldAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HardwareTeaser() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[320px] bg-[#00d4ff]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#00d4ff]/30 bg-card/60 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-transparent to-accent/10" />
          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-10 p-8 sm:p-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4ff]" />
                </span>
                <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
                  RektSafe Vault · launching soon
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-foreground">Don&apos;t just protect your keys. </span>
                <span className="gradient-text">Protect what you sign.</span>
              </h2>
              <p className="text-muted-foreground font-mono text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                One compact device for crypto self-custody, passwordless
                identity, and AI-powered transaction warnings shown before you
                approve.
              </p>

              <div className="flex flex-wrap gap-3 mb-8 text-xs font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  Crypto Vault
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70">
                  <Fingerprint className="w-3.5 h-3.5 text-[#00d4ff]" />
                  Identity Vault
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70">
                  <Brain className="w-3.5 h-3.5 text-accent" />
                  AI Guardian
                </span>
              </div>

              <Link href="/wallet/">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-mono px-6">
                  <Cpu className="w-4 h-4" />
                  See RektSafe Vault
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-xs">
                <div className="absolute -inset-4 bg-accent/10 blur-2xl rounded-full" />
                <div className="relative rounded-3xl border border-border bg-[#0c0c14] p-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Transaction insight
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent">
                      <ShieldAlert className="w-3 h-3" />
                      Risk
                    </span>
                  </div>
                  <div className="rounded-2xl bg-black border border-accent/30 p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Network</span>
                      <span className="text-foreground">Ethereum</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Operation</span>
                      <span className="text-foreground">Token approval</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Limit</span>
                      <span className="text-accent">Unlimited</span>
                    </div>
                    <p className="text-[11px] text-foreground/80 leading-relaxed pt-2 border-t border-border/50">
                      This approval could let the contract spend your tokens
                      later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
