"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Cpu,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
  Shield,
  ShieldAlert,
  Usb,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const layers = [
  {
    icon: Wallet,
    title: "Crypto Vault",
    description: "Secure on-chain assets and approve transactions",
    color: "text-primary",
    bgColor: "bg-primary/10",
    border: "hover:border-primary/40",
  },
  {
    icon: Fingerprint,
    title: "Identity Vault",
    description: "Passkeys, hardware 2FA and authenticator codes",
    color: "text-[#00d4ff]",
    bgColor: "bg-[#00d4ff]/10",
    border: "hover:border-[#00d4ff]/40",
  },
  {
    icon: Brain,
    title: "AI Guardian",
    description: "Decode transactions and surface hidden risks",
    color: "text-accent",
    bgColor: "bg-accent/10",
    border: "hover:border-accent/40",
  },
];

const capabilities = [
  {
    icon: Lock,
    title: "Secure crypto self-custody",
    description:
      "Protect Ethereum, Solana and supported digital assets using non-exportable private keys held inside dedicated secure hardware. Sign supported transactions through physical device confirmation.",
  },
  {
    icon: ShieldAlert,
    title: "Intelligent clear signing",
    description:
      "Decode supported smart-contract interactions, token approvals and DeFi operations. Identify dangerous permissions and suspicious activity before signing.",
  },
  {
    icon: Fingerprint,
    title: "Passkeys and hardware 2FA",
    description:
      "Use FIDO2/WebAuthn authentication for compatible accounts, with physical confirmation through the device.",
  },
  {
    icon: KeyRound,
    title: "Authenticator and password vault",
    description:
      "Generate TOTP/HOTP verification codes and securely manage credentials, with encrypted password storage planned as an additional capability.",
  },
];

const securityPoints = [
  "Private keys remain inside the secure element",
  "Transaction approval requires physical confirmation",
  "Signed firmware, verified updates and isolated credentials",
  "High-assurance security architecture with an EAL5+/EAL6+ evaluation pathway",
];

export default function HardwarePage() {
  return (
    <div className="min-h-screen pt-24 pb-20 overflow-x-hidden">
      <section className="relative px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff]/15 rounded-full blur-[128px]" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 mb-6">
              <Cpu className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
                Launching soon
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">
              AI-Powered Hardware Security · Self-Custody · Digital Identity
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">RektSafe Vault</span>
            </h1>
            <p className="text-xl sm:text-2xl text-foreground font-semibold mb-6">
              Your assets. Your identity. Your keys. Your control.
            </p>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              RektSafe Vault is a next-generation hardware security device that
              combines cryptocurrency self-custody, passwordless authentication
              and AI-powered transaction protection in one compact, secure
              wallet.
            </p>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-4">
              Built around dedicated cryptographic hardware, RektSafe Vault
              protects digital assets and online identities while helping users
              understand exactly what they&apos;re approving before they sign.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="text-foreground">One device. </span>
              <span className="gradient-text">Three layers of protection.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {layers.map((layer, index) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`p-6 rounded-2xl bg-card/50 border border-border/50 h-full transition-colors ${layer.border}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${layer.bgColor} flex items-center justify-center mb-4`}
                >
                  <layer.icon className={`w-6 h-6 ${layer.color}`} />
                </div>
                <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                  {layer.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {layer.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className="text-foreground">Why </span>
              <span className="gradient-text">RektSafe Vault?</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Traditional hardware wallets protect private keys, but users can
              still lose assets by unknowingly approving malicious
              transactions, unlimited token permissions or deceptive
              smart-contract interactions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              RektSafe Vault adds intelligence to the signing process, turning
              confusing technical requests into understandable actions and
              warnings displayed directly on the device.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-6 bg-accent/10 blur-3xl rounded-full" />
              <div className="relative rounded-[2rem] border border-border bg-[#0c0c14] p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground">
                      Transaction insight
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent border border-accent/40 rounded-full px-2 py-0.5">
                    Risk detected
                  </span>
                </div>
                <div className="rounded-2xl bg-black border border-accent/30 p-5 space-y-3">
                  <dl className="space-y-3 font-mono text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Network</dt>
                      <dd className="text-foreground">Ethereum</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Operation</dt>
                      <dd className="text-foreground">Token approval</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Spending limit</dt>
                      <dd className="text-accent">Unlimited</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-foreground/90 leading-relaxed pt-3 border-t border-border/60">
                    This approval could let the specified contract spend your
                    tokens later without additional confirmation.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <Usb className="w-3.5 h-3.5" />
                  Shown on the device before you sign
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground/80 leading-relaxed text-center">
                Illustrative transaction screen. Transaction details are
                independently verified; AI analysis provides additional
                context.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center">
            <span className="text-foreground">Core </span>
            <span className="gradient-text">capabilities</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {capabilities.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="p-6 rounded-2xl bg-card/50 border border-border/50 h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-mono text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-foreground">Built to </span>
              <span className="gradient-text">evolve</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-[#00d4ff]/30 bg-[#00d4ff]/5">
              <div className="flex items-center gap-3 mb-4">
                <Laptop className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="font-mono font-semibold text-foreground">
                  V1 · Connected Intelligence
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cloud-assisted transaction analysis through a connected phone
                or laptop, with secure verification and signing performed on
                the hardware wallet.
              </p>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-mono font-semibold text-foreground">
                  V2 · Sovereign Intelligence
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compact on-device AI enables offline transaction classification
                and risk explanations for supported operations, with
                intelligence improving through verified updates.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
            Both versions share the proposed ESP32-S3 + NXP SE050E2 hardware
            foundation, including a dedicated screen, physical approval buttons
            and USB-C connectivity.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            <span className="text-foreground">Security at </span>
            <span className="gradient-text">the core</span>
          </h2>
          <ul className="space-y-3">
            {securityPoints.map((point) => (
              <li
                key={point}
                className="flex gap-3 p-4 rounded-xl border border-border/60 bg-card/40 text-sm text-foreground"
              >
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed px-1">
            The complete device&apos;s security certification remains a
            development objective, not an existing certification.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-card/50 border border-border/50">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            RektSafe Vault
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Don&apos;t just protect your keys.{" "}
            <span className="text-foreground">Protect what you sign.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://x.com/netsepio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-mono px-6">
                Follow @netsepio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a
              href="https://t.me/RektSafeOfficial"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-border hover:border-primary hover:text-primary font-mono px-6"
              >
                Join Telegram
              </Button>
            </a>
            <Link href="/">
              <Button
                variant="ghost"
                className="font-mono text-muted-foreground hover:text-primary"
              >
                Back to rektSafe
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
