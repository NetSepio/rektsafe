"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, Trash2, FileKey } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const privacyPrinciples = [
  {
    icon: Lock,
    title: "Zero Knowledge Architecture",
    description:
      "We cannot access your encrypted data. Ever. All encryption happens in your browser using keys that never leave your device.",
  },
  {
    icon: Eye,
    title: "No Data Collection",
    description:
      "We don't collect personal information. No accounts, no emails, no tracking. Your privacy is the default.",
  },
  {
    icon: Server,
    title: "Client-Side Only",
    description:
      "This application runs entirely in your browser. No data is sent to any server. You can verify this by inspecting the network traffic.",
  },
  {
    icon: Trash2,
    title: "No Persistence",
    description:
      "We don't store your keys, files, or encrypted data. Once you close the tab, everything is gone from memory.",
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
      "We use only standard, well-audited cryptographic primitives: Ed25519, AES-256-GCM, and SHA-256 via the Web Crypto API.",
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
            Last Updated: January 2026
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
              <p>rektSafe is designed to collect zero personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No account registration required</li>
                <li>No email addresses collected</li>
                <li>No IP addresses logged</li>
                <li>No analytics or tracking cookies</li>
                <li>No device fingerprinting</li>
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
                rektSafe operates entirely within your web browser using
                JavaScript and the Web Crypto API:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  All cryptographic operations (key generation, encryption,
                  signing) happen locally
                </li>
                <li>Your private keys never leave your device</li>
                <li>Files are encrypted in-memory before any transmission</li>
                <li>
                  No data is sent to our servers (we don&apos;t have any servers for
                  crypto operations)
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
              <p>
                By design, rektSafe does not store any of your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No encrypted files are stored on our servers</li>
                <li>No key shares are persisted anywhere</li>
                <li>No metadata about your usage is collected</li>
                <li>
                  All data exists only in your browser&apos;s memory and is lost when
                  you close the tab
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
                We don&apos;t use any third-party services that could access your
                data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No Google Analytics or similar tracking</li>
                <li>No CDN-hosted JavaScript libraries</li>
                <li>No external APIs that process your data</li>
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
