"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "rektsafe-cookie-consent";

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Cookie className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          Privacy Notice
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Stored only in this browser
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={dismiss}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <p>
                      rektSafe does not use analytics or advertising cookies.
                      This choice is saved in localStorage on this device so
                      the notice stays dismissed. Read the{" "}
                      <a
                        href="/privacy/"
                        className="text-primary hover:text-primary/80 hover:underline font-medium"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      onClick={dismiss}
                      className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                    >
                      Got it
                    </Button>
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
