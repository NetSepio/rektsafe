"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  KeyRound,
  Users,
  Upload,
  Clock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Send,
  Wallet,
  Lock,
  Eye,
} from "lucide-react";

type Feature = "vault" | "zksend";

interface Step {
  icon: typeof KeyRound;
  number: string;
  title: string;
  description: string;
  code: string;
}

const vaultSteps: Step[] = [
  {
    icon: KeyRound,
    number: "01",
    title: "Generate Keys",
    description:
      "Create your master key pair using Ed25519. Your private key is split into shares using threshold cryptography.",
    code: `> generate_keypair()
> split_shares(n=5, threshold=3)
✓ Shares distributed`,
  },
  {
    icon: Users,
    number: "02",
    title: "Choose Guardians",
    description:
      "Select trusted parties to hold key shares. Set the threshold - how many shares are needed to reconstruct.",
    code: `> add_guardian("family_member_1")
> add_guardian("family_member_2")
> set_threshold(3)
✓ 5 guardians configured`,
  },
  {
    icon: Upload,
    number: "03",
    title: "Encrypt Assets",
    description:
      "Encrypt your files, wallet seeds, or any sensitive data with AES-256-GCM. Only encrypted data leaves your device.",
    code: `> encrypt_file(wallet_backup.json)
> sign_hash(sha256)
✓ File encrypted + signed`,
  },
  {
    icon: Clock,
    number: "04",
    title: "Set Timer",
    description:
      "Configure the dead man's switch. If you don't check in within the set period, the unlock process begins.",
    code: `> set_checkin_interval("90_days")
> set_recovery_delay("30_days")
✓ Timer armed`,
  },
  {
    icon: Unlock,
    number: "05",
    title: "Recovery",
    description:
      "If triggered, guardians are notified. When threshold signatures are collected, decryption key is reconstructed.",
    code: `> check_inactivity()
> notify_guardians()
> collect_signatures(3/5)
✓ Decryption authorized`,
  },
];

const zkSendSteps: Step[] = [
  {
    icon: Shield,
    number: "01",
    title: "Connect Wallet",
    description:
      "Connect your Solana wallet. Your private key never leaves your device - only a signature is used to derive the encryption key.",
    code: `> connect_wallet()
> sign_message("Privacy Money account sign in")
✓ Encryption key derived`,
  },
  {
    icon: Lock,
    number: "02",
    title: "Shield Assets",
    description:
      "Deposit SOL, USDC, USDT, or other supported tokens into the Privacy Cash pool. Your assets become anonymous.",
    code: `> deposit(1.5 SOL)
> generate_proof()
> submit_to_pool()
✓ Assets shielded`,
  },
  {
    icon: Eye,
    number: "03",
    title: "Private Balance",
    description:
      "Your shielded balance is encrypted and stored privately. Only you can view your private assets using your derived key.",
    code: `> get_private_balance()
> decrypt_utxos()
✓ Balance: 1.5 SOL private`,
  },
  {
    icon: Send,
    number: "04",
    title: "Send Privately",
    description:
      "Transfer assets to any Solana address privately. The recipient receives clean funds from the privacy pool.",
    code: `> private_send(0.5 SOL, recipient)
> generate_transfer_proof()
✓ Private transfer complete`,
  },
  {
    icon: Wallet,
    number: "05",
    title: "Unshield Anytime",
    description:
      "Withdraw your assets back to your public wallet whenever you want. The connection to your deposits is broken.",
    code: `> withdraw(1.0 SOL, my_wallet)
> generate_withdraw_proof()
✓ Assets unshielded`,
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative"
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-shrink-0 flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary"
          >
            <step.icon className="w-8 h-8 text-primary" />
          </motion.div>
          {index < 4 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
              className="w-px h-24 bg-gradient-to-b from-primary/50 to-transparent mt-4 hidden lg:block"
            />
          )}
        </div>

        <div className="flex-1 pb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl font-bold text-primary/20 font-mono">
              {step.number}
            </span>
            <h3 className="text-xl font-bold text-foreground font-mono">
              {step.title}
            </h3>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {step.description}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
            className="rounded-lg overflow-hidden bg-black/50 border border-border/50"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-border/10 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                bash — 80x24
              </span>
            </div>
            <pre className="p-4 text-sm font-mono text-primary/80 overflow-x-auto">
              <code>{step.code}</code>
            </pre>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeFeature, setActiveFeature] = useState<Feature>("vault");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  const steps = activeFeature === "vault" ? vaultSteps : zkSendSteps;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider">
              Process
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">How It </span>
            <span className="gradient-text">Works</span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto font-mono text-sm mb-8">
            Choose a feature to learn how it works. Both use military-grade
            encryption to keep your digital assets secure and private.
          </p>

          {/* Feature Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveFeature("vault")}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-mono font-semibold transition-all duration-300 ${
                activeFeature === "vault"
                  ? "bg-primary/10 border-2 border-primary text-primary"
                  : "bg-card/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Threshold Vault</span>
            </button>
            <button
              onClick={() => setActiveFeature("zksend")}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-mono font-semibold transition-all duration-300 ${
                activeFeature === "zksend"
                  ? "bg-accent/10 border-2 border-accent text-accent"
                  : "bg-card/50 border border-border text-muted-foreground hover:text-foreground hover:border-accent/50"
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>Private Transfers</span>
            </button>
          </div>
        </motion.div>

        <div className="hidden lg:block fixed top-1/2 right-8 -translate-y-1/2 z-20">
          <div className="w-1 h-64 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              style={{ height: progressWidth }}
              className={`w-full ${
                activeFeature === "vault"
                  ? "bg-gradient-to-b from-primary to-accent"
                  : "bg-gradient-to-b from-accent to-cyan-400"
              }`}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-0"
          >
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href={activeFeature === "vault" ? "/vault/" : "/zksend/"}
            className={`inline-flex items-center gap-2 font-mono transition-colors ${
              activeFeature === "vault"
                ? "text-primary hover:text-primary/80"
                : "text-accent hover:text-accent/80"
            }`}
          >
            Try the{" "}
            {activeFeature === "vault" ? "Vault Demo" : "Private Transfer Demo"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
