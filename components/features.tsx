"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Lock,
  Users,
  Zap,
  FileKey,
  Globe,
  Fingerprint,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "zkSig — Threshold Signatures",
    description:
      "Split keys with n-of-k threshold scheme. Encrypt files. Sign & verify messages. All with Ed25519 + AES-256-GCM.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "zkSend — Private Transfers",
    description:
      "Shield, send, and unshield Solana assets. Zero-knowledge privacy for your transactions. Break the chain.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Architecture",
    description:
      "We never store your keys or data. Everything encrypted client-side. No servers, no tracking, no compromises.",
    color: "text-[#00d4ff]",
    bgColor: "bg-[#00d4ff]/10",
  },
  {
    icon: Users,
    title: "Multi-Party Trust",
    description:
      "Distribute key shares to trusted guardians. Require M-of-N signatures for recovery. No single point of failure.",
    color: "text-[#ffaa00]",
    bgColor: "bg-[#ffaa00]/10",
  },
  {
    icon: FileKey,
    title: "Universal File Encryption",
    description:
      "Encrypt any file type — wills, wallet seeds, passwords, documents. Secure inheritance for any digital asset.",
    color: "text-[#9d4edd]",
    bgColor: "bg-[#9d4edd]/10",
  },
  {
    icon: Globe,
    title: "Truly Decentralized",
    description:
      "No accounts, no servers, no custody. Runs entirely in your browser. For cypherpunks, by cypherpunks.",
    color: "text-[#ff3366]",
    bgColor: "bg-[#ff3366]/10",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <div className="relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/50 hover:bg-card/80 h-full">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        </div>

        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`relative w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
        >
          <feature.icon className={`w-6 h-6 ${feature.color}`} />
        </motion.div>

        <h3 className="relative text-lg font-semibold text-foreground mb-2 font-mono">
          {feature.title}
        </h3>
        <p className="relative text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        <div className="absolute bottom-4 right-4 text-6xl font-bold text-foreground/5 font-mono select-none">
          0{index + 1}
        </div>
      </div>
    </motion.div>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Fingerprint className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-accent uppercase tracking-wider">
              Features
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Built for </span>
            <span className="gradient-text">Security</span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto font-mono text-sm">
            Every feature is designed with one goal: ensuring your digital
            assets are accessible to those you trust, only when it matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={
            isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }
          }
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex items-center justify-center gap-4"
        >
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-primary/50" />
          <Globe className="w-5 h-5 text-primary/50" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-primary/50" />
        </motion.div>
      </div>
    </section>
  );
}
