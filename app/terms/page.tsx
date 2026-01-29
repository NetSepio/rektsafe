"use client";

import { motion } from "framer-motion";
import { FileText, AlertTriangle, Scale, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-accent uppercase tracking-wider">
              Terms of Service
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Terms & </span>
            <span className="gradient-text">Conditions</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-mono text-sm">
            Please read these terms carefully before using rektSafe.
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
          className="mb-12"
        >
          <Card className="border-[#ffaa00]/30 bg-[#ffaa00]/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-[#ffaa00] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Important Notice
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    rektSafe is experimental software provided as-is. By using
                    this service, you acknowledge that you understand the risks
                    involved with cryptographic operations and take full
                    responsibility for your data and keys. We cannot help
                    recover lost data or keys.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">01.</span>
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                By accessing or using rektSafe (&quot;the Service&quot;), you agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use the Service.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting. Your continued use
                of the Service constitutes acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">02.</span>
                Description of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                rektSafe is a client-side cryptographic tool that enables:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>File encryption using AES-256-GCM</li>
                <li>Digital signatures using Ed25519</li>
                <li>Threshold signature scheme demonstrations</li>
                <li>Key generation and management tools</li>
              </ul>
              <p>
                The Service operates entirely within your web browser. No data
                is transmitted to or stored on our servers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">03.</span>
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>You are solely responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Safeguarding your private keys and key shares. Loss of keys
                  means permanent loss of access to encrypted data.
                </li>
                <li>
                  Ensuring the security of your devices and browsers. We are
                  not responsible for malware, keyloggers, or other security
                  compromises on your end.
                </li>
                <li>
                  Verifying the authenticity of this website. Always check you
                  are on the correct domain to avoid phishing attacks.
                </li>
                <li>
                  Complying with all applicable laws regarding cryptography and
                  data protection in your jurisdiction.
                </li>
                <li>
                  Making secure backups of important keys and encrypted data.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">04.</span>
                Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
                NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Warranty of merchantability or fitness for a particular
                  purpose
                </li>
                <li>
                  Warranty that the Service will be uninterrupted, timely,
                  secure, or error-free
                </li>
                <li>
                  Warranty that the results obtained from using the Service
                  will be accurate or reliable
                </li>
                <li>
                  Warranty that any errors in the software will be corrected
                </li>
              </ul>
              <p>
                WE MAKE NO WARRANTIES REGARDING THE SECURITY OF THE SERVICE OR
                THE SAFETY OF YOUR DATA. USE AT YOUR OWN RISK.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">05.</span>
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                LIMITATION:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of data, files, or encrypted content</li>
                <li>Loss of cryptocurrency or digital assets</li>
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Loss of keys or inability to decrypt data</li>
                <li>Any damages arising from unauthorized access to your data</li>
              </ul>
              <p>
                THIS LIMITATION APPLIES WHETHER THE DAMAGES ARISE FROM USE OR
                MISUSE OF THE SERVICE, INABILITY TO USE THE SERVICE, OR
                INTERRUPTION OF THE SERVICE.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">06.</span>
                Cryptography Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                You acknowledge that the use of cryptography is subject to laws
                and regulations in various jurisdictions. You are responsible
                for ensuring your use of the Service complies with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Local laws regarding encryption and cryptography</li>
                <li>Export control regulations</li>
                <li>Any restrictions in your country of residence</li>
              </ul>
              <p>
                The Service uses standard, publicly available cryptographic
                algorithms provided by the Web Crypto API.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">07.</span>
                Open Source License
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                rektSafe is open source software licensed under the MIT License:
              </p>
              <div className="p-4 rounded-lg bg-black/30 font-mono text-xs">
                <p className="mb-2">MIT License</p>
                <p className="mb-2">
                  Copyright (c) 2026 rektSafe Contributors
                </p>
                <p>
                  Permission is hereby granted, free of charge, to any person
                  obtaining a copy of this software and associated documentation
                  files (the &quot;Software&quot;), to deal in the Software without
                  restriction, including without limitation the rights to use,
                  copy, modify, merge, publish, distribute, sublicense, and/or
                  sell copies of the Software, and to permit persons to whom the
                  Software is furnished to do so, subject to the conditions
                  stated in the full license.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">08.</span>
                Indemnification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                You agree to indemnify and hold harmless the authors,
                contributors, and maintainers of rektSafe from any claims,
                damages, losses, liabilities, costs, or expenses arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of the Service</li>
                <li>Your violation of these terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content or data you encrypt or store</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">09.</span>
                Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                These terms shall be governed by and construed in accordance
                with the laws of the jurisdiction in which the primary
                maintainer resides, without regard to conflict of law
                principles.
              </p>
              <p>
                Any disputes arising from these terms or the use of the Service
                shall be resolved through good faith negotiation. If a dispute
                cannot be resolved amicably, it shall be submitted to binding
                arbitration.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-mono text-xl flex items-center gap-3">
                <span className="text-primary">10.</span>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:legal@rektsafe.xyz"
                    className="text-primary hover:underline"
                  >
                    legal@rektsafe.xyz
                  </a>
                </li>
                <li>
                  GitHub: Open an issue on our public repository for technical
                  questions
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Separator className="mb-8" />
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <Scale className="w-5 h-5" />
            <span className="text-sm font-mono">
              By using rektSafe, you acknowledge that you have read,
              understood, and agree to these terms.
            </span>
            <Scale className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
