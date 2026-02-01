"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Upload, File, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTSS } from "../context/tss-context";

export function EncryptSection() {
  const {
    encryptFile,
    downloadEncryptedFile,
    encryptedFile,
    originalFileName,
    shares,
    totalParties,
    threshold,
    output,
  } = useTSS();
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type || "Unknown",
      });
    }
  };

  const clearFile = () => {
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEncrypt = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    setIsEncrypting(true);
    await encryptFile(fileInputRef.current.files[0]);
    setIsEncrypting(false);
  };

  if (!shares.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-mono font-semibold mb-2">
              No Keys Generated
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Please go to the <strong>Split Keys</strong> tab first to generate
              your threshold key shares before encrypting files.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-mono">
              <Lock className="w-5 h-5 text-primary" />
              Encrypt File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Files are encrypted using <strong>AES-256-GCM</strong>. You will
                need{" "}
                <strong>
                  {threshold} of {totalParties}
                </strong>{" "}
                key shares to decrypt.
              </p>
            </div>

            {!encryptedFile ? (
              <>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to select file to encrypt
                    </span>
                    <span className="text-xs text-muted-foreground/50">
                      Any file type supported
                    </span>
                  </label>
                </div>

                {fileInfo && (
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-medium truncate">
                          {fileInfo.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(fileInfo.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={clearFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleEncrypt}
                  disabled={!fileInfo || isEncrypting}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isEncrypting ? "Encrypting..." : "Encrypt File"}
                </Button>
              </>
            ) : (
              <div className="p-6 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-mono font-semibold mb-1">File Encrypted</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {originalFileName} is now encrypted and ready
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={downloadEncryptedFile} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Encrypted File
                  </Button>
                  <Button
                    onClick={clearFile}
                    variant="outline"
                    className="flex-1"
                  >
                    Encrypt Another
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Share the downloaded .encrypted file with your guardians. They
                  can upload it in the Decrypt tab.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
