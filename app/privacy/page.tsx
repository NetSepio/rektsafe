"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, Trash2, FileKey } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const privacyPrinciples = [
  {
    icon: Lock,
    title: "Keys Stay With You",
    description:
      "rektSafe cannot read your files or key shares. zkSig encryption and signing run in your browser. We do not store those keys.",
  },
  {
    icon: Eye,
    title: "No Accounts",
    description:
      "No accounts, no emails, and no analytics. The site does not build a profile of you.",
  },
  {
    icon: Server,
    title: "Client-Side Keys",
    description:
      "zkSig runs in your browser. zkSend sends shielded transactions through your wallet, public RPC endpoints, and Privacy Cash. rektSafe does not operate those networks.",
  },
  {
    icon: Trash2,
    title: "What Stays on This Device",
    description:
      "rektSafe does not store your keys or files. An EVM zkSend sign-in and this browser's transfer history can stay in localStorage so you can decrypt notes later.",
  },
  {
    icon: FileKey,
    title: "Open Source",
    description:
      "Our code is open source and auditable. You can verify that we do what we claim. No hidden backdoors.",
  },
  {
    icon: Shield,
    title: "Standard Cryptography",
    description:
      "zkSig uses Ed25519, AES-256-GCM, and SHA-256 via the Web Crypto API. zkSend adds zero-knowledge proofs for private transfers.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-wider">
              Privacy Policy
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Your Data, </span>
            <span className="gradient-text">Your Control</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-mono text-sm">
            We built rektSafe with privacy as the foundation. Not as an
            afterthought.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <span className="text-xs text-muted-foreground font-mono">
            Last Updated: October 2026
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {privacyPrinciples.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <principle.icon className="w-5 h-5 text-primary" />
                    </div>
                    {principle.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">
                1. Information We Don&apos;t Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>rektSafe does not run accounts or analytics:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No account registration</li>
                <li>No email addresses collected by rektSafe</li>
                <li>No analytics or advertising cookies</li>
                <li>
                  Wallet, RPC, and Privacy Cash requests are visible to those
                  networks. rektSafe does not operate them.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">
                2. How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                zkSig uses the Web Crypto API in your browser. zkSend also
                talks to public networks:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Key splitting, file encryption, and message signing happen
                  locally
                </li>
                <li>
                  Wallet keys stay in your wallet. rektSafe does not receive
                  them
                </li>
                <li>
                  Encrypted files stay on your machine. The app does not upload
                  them
                </li>
                <li>
                  Shield, send, and unshield submit transactions through your
                  wallet, a public RPC endpoint, and Privacy Cash
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">
                3. Data Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>rektSafe does not keep a copy of your keys or files:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No encrypted files or key shares are stored by rektSafe</li>
                <li>
                  The Solana zkSend session stays in memory and clears when you
                  refresh
                </li>
                <li>
                  EVM zkSend stores the sign-in signature in this
                  browser&apos;s localStorage so the same key can decrypt shielded
                  notes
                </li>
                <li>
                  Transfer history and the cookie-notice choice can also stay
                  in localStorage on this device
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">
                4. Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                rektSafe does not run analytics or advertising. Connecting a
                wallet or using zkSend does contact services we do not operate:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your wallet, including WalletConnect through Reown</li>
                <li>Solana and EVM RPC endpoints</li>
                <li>Privacy Cash, for shielded transfers</li>
                <li>No advertising or marketing pixels</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">
                5. Open Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Our commitment to transparency means our code is fully open
                source:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You can audit the entire codebase</li>
                <li>Security researchers can verify our claims</li>
                <li>No hidden functionality or backdoors</li>
                <li>Community-driven security improvements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">
                6. Security Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                While we take every precaution to ensure security, please be
                aware:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  You are responsible for securely storing and distributing key
                  shares
                </li>
                <li>
                  If you lose access to sufficient key shares, encrypted data
                  cannot be recovered
                </li>
                <li>
                  Browser security vulnerabilities could theoretically expose
                  in-memory data
                </li>
                <li>
                  Always verify you&apos;re on the legitimate rektSafe domain
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl">7. Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                If you have questions about this privacy policy or our security
                practices:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:privacy@rektsafe.xyz"
                    className="text-primary hover:underline"
                  >
                    privacy@rektsafe.xyz
                  </a>
                </li>
                <li>
                  GitHub Issues: Report security concerns through our GitHub
                  repository
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center p-6 rounded-2xl bg-primary/5 border border-primary/20"
        >
          <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-mono">
            Privacy isn&apos;t a feature. It&apos;s the architecture.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
