"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "rektsafe-cookie-consent";

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent: ConsentState = {
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    const consent: ConsentState = {
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleDecline = () => {
    const consent: ConsentState = {
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Cookie className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          Cookie Preferences
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          We value your privacy
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDecline}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main content */}
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <p>
                      We use cookies to enhance your browsing experience, analyze site traffic,
                      and personalize content. By clicking "Accept All", you consent to our use
                      of cookies. Read our{" "}
                      <a
                        href="/privacy/"
                        className="text-primary hover:text-primary/80 hover:underline font-medium"
                      >
                        Privacy Policy
                      </a>{" "}
                      to learn more about how we handle your data.
                    </p>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-2 pb-1">
                          {/* Essential cookies */}
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Shield className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">
                                  Essential Cookies
                                </h4>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                  Required
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                These cookies are necessary for the website to function properly.
                                They enable core features like security, network management, and
                                accessibility. You cannot disable these cookies.
                              </p>
                            </div>
                          </div>

                          {/* Analytics cookies */}
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-accent"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">
                                  Analytics Cookies
                                </h4>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                  Optional
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                These cookies help us understand how visitors interact with our
                                website by collecting and reporting information anonymously.
                                This helps us improve our services.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors text-left sm:text-center"
                    >
                      {showDetails ? "Hide details" : "Manage preferences"}
                    </button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAcceptEssential}
                        className="text-xs border-border/50 hover:bg-primary/5"
                      >
                        Essential Only
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAcceptAll}
                        className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                      >
                        Accept All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
