"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Code2, Lock, FileCode } from "lucide-react";

const technologies = [
  {
    category: "Cryptography",
    items: [
      { name: "Ed25519", desc: "Digital signatures" },
      { name: "AES-256-GCM", desc: "File encryption" },
      { name: "SHA-256", desc: "Hash function" },
      { name: "TSS", desc: "Threshold signatures" },
    ],
  },
  {
    category: "Web APIs",
    items: [
      { name: "Web Crypto API", desc: "Native crypto operations" },
      { name: "SubtleCrypto", desc: "Low-level crypto primitives" },
      { name: "File API", desc: "File handling" },
      { name: "IndexedDB", desc: "Local storage" },
    ],
  },
  {
    category: "Stack",
    items: [
      { name: "Next.js 15", desc: "React framework" },
      { name: "TypeScript", desc: "Type safety" },
      { name: "Tailwind CSS", desc: "Styling" },
      { name: "shadcn/ui", desc: "Components" },
    ],
  },
];

export function TechStack() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <Cpu className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
              Technology
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Battle-Tested </span>
            <span className="text-[#00d4ff]">Primitives</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto font-mono text-sm">
            No custom crypto. Only standard, audited algorithms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {technologies.map((tech, techIndex) => (
            <motion.div
              key={tech.category}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: techIndex * 0.1 }}
              className="rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm p-6"
            >
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                {tech.category === "Cryptography" && <Lock className="w-4 h-4" />}
                {tech.category === "Web APIs" && <Code2 className="w-4 h-4" />}
                {tech.category === "Stack" && <FileCode className="w-4 h-4" />}
                {tech.category}
              </h3>

              <div className="space-y-4">
                {tech.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: techIndex * 0.1 + itemIndex * 0.05,
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors"
                  >
                    <span className="font-mono text-sm text-foreground">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.desc}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">
              All crypto runs in your browser. No server involved.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
