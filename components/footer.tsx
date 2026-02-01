"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Github, Twitter, Mail, Heart, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">rektSafe</span>
              <span className="mx-2">|</span>
              <span>
                © {new Date().getFullYear()} NetSepio. All Rights Reserved
              </span>
            </span>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6"
          >
            <Link
              href="/privacy/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <a
              href="https://github.com/netsepio/rektsafe"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/netsepio"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://t.me/RektSafeOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
            <a
              href="mailto:support@netsepio.com"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-6 pt-6 border-t border-border/30 text-center"
        >
          <p className="text-xs text-muted-foreground font-mono">
            Built with <Heart className="w-3 h-3 inline text-accent" /> for the
            cypherpunks
          </p>
          <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
            [SECURE] [DECENTRALIZED] [TRUSTLESS]
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
