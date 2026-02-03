"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Menu,
  X,
  Terminal,
  Lock,
  Wallet,
  LogOut,
  AtSign,
  Home,
  KeyRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useSnsName } from "@/hooks/use-sns-name";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/zksig/", label: "zkSig", icon: KeyRound },
  { href: "/zksend/", label: "zkSend", icon: Zap },
  { href: "/zkvault/", label: "zkVault", icon: Wallet },
];

// Compact wallet status component for navbar
function WalletStatus() {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { snsName, isLoading } = useSnsName(address);

  if (!isConnected || !address) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      {/* Compact wallet pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        {snsName ? (
          <>
            <AtSign className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-bold text-primary hidden sm:inline">
              {snsName}
            </span>
            <span className="text-xs text-muted-foreground font-mono sm:hidden">
              {address.slice(0, 4)}...{address.slice(-4)}
            </span>
          </>
        ) : (
          <>
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-mono text-primary">
              {address.slice(0, 4)}...{address.slice(-4)}
            </span>
          </>
        )}
      </div>

      {/* Disconnect button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => disconnect()}
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title="Disconnect wallet"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [glitchText, setGlitchText] = useState("rektSafe");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();
  const { isConnected } = useAppKitAccount();

  // Check if we're on the zksig page
  const isZksigPage = pathname === "/zksig" || pathname === "/zksig/";
  // Show Connect Wallet button only when wallet is NOT connected
  // (on any page - homepage or vault page)
  const showEnterVaultButton = !isConnected;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGlitch = () => {
    const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let iterations = 0;
    const interval = setInterval(() => {
      setGlitchText(
        "rektSafe"
          .split("")
          .map((char, index) => {
            if (index < iterations) return "rektSafe"[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );
      iterations += 1 / 2;
      if (iterations >= "rektSafe".length) {
        clearInterval(interval);
        setGlitchText("rektSafe");
      }
    }, 30);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Shield className="w-8 h-8 text-primary" />
              <Lock className="w-4 h-4 text-accent absolute -bottom-1 -right-1" />
            </motion.div>
            <span
              className="text-xl font-bold font-mono tracking-wider text-foreground group-hover:text-primary transition-colors"
              onMouseEnter={handleGlitch}
            >
              {glitchText}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link, index) => {
              const isActive =
                pathname === link.href || pathname === link.href.slice(0, -1);
              const isHovered = hoveredLink === link.href;
              const Icon = link.icon;

              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    href={link.href}
                    className={`
                      relative flex items-center gap-2 px-5 py-3 text-base font-semibold
                      rounded-xl transition-all duration-300 overflow-hidden group
                      ${
                        isActive
                          ? "text-primary bg-primary/10 border border-primary/30"
                          : "text-muted-foreground hover:text-foreground border border-transparent"
                      }
                    `}
                  >
                    {/* Background glow effect on hover */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                      initial={{ opacity: 0, x: "-100%" }}
                      animate={{
                        opacity: isHovered || isActive ? 1 : 0,
                        x: isHovered || isActive ? "0%" : "-100%",
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Icon */}
                    <span className="relative z-10">
                      <Icon
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                        }`}
                      />
                    </span>

                    {/* Label */}
                    <span className="relative z-10">{link.label}</span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover border glow */}
                    <motion.span
                      className="absolute inset-0 rounded-xl border border-primary/0 transition-colors duration-300"
                      animate={{
                        borderColor:
                          isHovered && !isActive
                            ? "rgba(0, 255, 136, 0.3)"
                            : "rgba(0, 255, 136, 0)",
                        boxShadow:
                          isHovered && !isActive
                            ? "0 0 20px rgba(0, 255, 136, 0.1), inset 0 0 20px rgba(0, 255, 136, 0.05)"
                            : "none",
                      }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right side: Wallet Status + Connect Wallet Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:flex items-center gap-3"
          >
            {/* Wallet connection status - shown when connected */}
            <WalletStatus />

            {/* Connect Wallet button - hidden when on zksig page and connected */}
            {showEnterVaultButton && (
              <Link href="/zksig/">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-primary/10 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 glow-primary text-base px-6 py-2.5 hover:scale-105 active:scale-95 font-semibold"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 text-foreground hover:bg-primary/10 rounded-xl transition-all duration-300 border border-transparent hover:border-primary/20"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => {
                const isActive =
                  pathname === link.href || pathname === link.href.slice(0, -1);
                const Icon = link.icon;

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300
                        ${
                          isActive
                            ? "text-primary bg-primary/10 border border-primary/30"
                            : "text-foreground hover:text-primary hover:bg-primary/5 border border-transparent"
                        }
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span className="text-lg font-semibold">
                        {link.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveIndicator"
                          className="ml-auto w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile wallet status */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-2"
                >
                  <WalletStatus />
                </motion.div>
              )}

              {/* Mobile Connect Wallet button */}
              {showEnterVaultButton && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <Link
                    href="/zksig/"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      size="lg"
                      className="w-full bg-primary/10 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground text-base py-4 font-semibold"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
