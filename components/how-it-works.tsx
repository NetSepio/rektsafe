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

type Feature = "zksig" | "zksend";

interface Step {
  icon: typeof KeyRound;
  number: string;
  title: string;
  description: string;
  code: string;
}

const zksigSteps: Step[] = [
  {
    icon: KeyRound,
    number: "01",
    title: "Split the Key",
    description:
      "Create an Ed25519 key and split it into shares. Set how many shares exist and how many are required to reconstruct it. The full private key is not stored.",
    code: `> generate_keypair()
> split_shares(n=5, k=3)
✓ Shares ready`,
  },
  {
    icon: Users,
    number: "02",
    title: "Give Shares to People You Trust",
    description:
      "Download the shares and give them out yourself. RektSafe does not hold the shares, keep a guardian list, or send reminders.",
    code: `> export_shares()
> threshold = 3 of 5
✓ You distribute the shares`,
  },
  {
    icon: Upload,
    number: "03",
    title: "Encrypt Files",
    description:
      "Encrypt files, wallet seeds, or notes with AES-256-GCM. Encryption runs in the browser.",
    code: `> encrypt_file(wallet_backup.json)
✓ Ciphertext ready`,
  },
  {
    icon: Unlock,
    number: "04",
    title: "Decrypt With Enough Shares",
    description:
      "Bring together at least the threshold number of shares to reconstruct the key and decrypt. Fewer shares cannot open the file.",
    code: `> load_shares(3)
> decrypt_file()
✓ File restored`,
  },
  {
    icon: Shield,
    number: "05",
    title: "Sign and Verify",
    description:
      "Sign a message with the key, then check a signature against the public key.",
    code: `> sign_message()
> verify_signature()
✓ Signature valid`,
  },
];

const zkSendSteps: Step[] = [
  {
    icon: Shield,
    number: "01",
    title: "Connect Wallet",
    description:
      "Connect a Solana wallet, or an Ethereum wallet on mainnet. Your private key stays in the wallet. Solana signs the RektSafe welcome message. Ethereum must sign the Privacy Cash sign-in string, or shielded funds cannot be decrypted.",
    code: `> connect_wallet()
> sign(solana_welcome | ethereum_sign_in)
✓ Viewing key derived`,
  },
  {
    icon: Lock,
    number: "02",
    title: "Shield Assets",
    description:
      "Deposit SOL, USDC, or USDT on Solana, or ETH and USDT on Ethereum, into the Privacy Cash pool. Your assets become anonymous.",
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
      "Transfer to a Solana address, or to an Ethereum address when your wallet is on Ethereum. The recipient receives funds from the privacy pool.",
    code: `> private_send(0.5 SOL, recipient)
> generate_transfer_proof()
✓ Private transfer complete`,
  },
  {
    icon: Wallet,
    number: "05",
    title: "Unshield Anytime",
    description:
      "Withdraw back to a public Solana or Ethereum address whenever you want. The connection to your deposits is broken.",
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
  const [activeFeature, setActiveFeature] = useState<Feature>("zksig");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  const steps = activeFeature === "zksig" ? zksigSteps : zkSendSteps;

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
            Choose a feature to learn how it works. zkSig uses Ed25519 and
            AES-256-GCM in the browser. zkSend uses zero-knowledge proofs for
            private transfers.
          </p>

          {/* Feature Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveFeature("zksig")}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-mono font-semibold transition-all duration-300 ${
                activeFeature === "zksig"
                  ? "bg-primary/10 border-2 border-primary text-primary"
                  : "bg-card/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>zkSig — TSS</span>
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
              <span>zkSend</span>
            </button>
          </div>
        </motion.div>

        <div className="hidden lg:block fixed top-1/2 right-8 -translate-y-1/2 z-20">
          <div className="w-1 h-64 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              style={{ height: progressWidth }}
              className={`w-full ${
                activeFeature === "zksig"
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
            href={activeFeature === "zksig" ? "/zksig/" : "/zksend/"}
            className={`inline-flex items-center gap-2 font-mono transition-colors ${
              activeFeature === "zksig"
                ? "text-primary hover:text-primary/80"
                : "text-accent hover:text-accent/80"
            }`}
          >
            Try the {activeFeature === "zksig" ? "zkSig Demo" : "zkSend Demo"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
