"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Unlock, Upload, CheckCircle, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTSS } from "../context/tss-context";

export function DecryptSection() {
  const {
    shares,
    threshold,
    encryptedFile,
    originalFileName,
    decryptFile,
    loadEncryptedFile,
    hasGeneratedKeys,
  } = useTSS();
  const [selectedParties, setSelectedParties] = useState<Set<number>>(
    new Set(),
  );
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleParty = (id: number) => {
    const newSelected = new Set(selectedParties);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParties(newSelected);
  };

  const handleDecrypt = async () => {
    if (selectedParties.size < threshold) return;
    setIsDecrypting(true);
    await decryptFile(Array.from(selectedParties));
    setIsDecrypting(false);
  };

  if (!hasGeneratedKeys) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Unlock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-mono font-semibold mb-2">
              No Keys Generated
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Please go to the <strong>Split Keys</strong> tab first to set up
              your threshold keys.
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
              <Unlock className="w-5 h-5 text-primary" />
              Decrypt File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!encryptedFile ? (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-accent/5 border border-accent/20 text-center">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an encrypted file (.rektSafe.encrypted) to decrypt
                    it. The file owner must share their key shares with you.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".rektSafe.encrypted,.encrypted,.json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await loadEncryptedFile(file);
                        setUploadedFileName(file.name);
                      }
                    }}
                    className="hidden"
                    id="encrypted-file-upload"
                  />
                  <label htmlFor="encrypted-file-upload">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Encrypted File
                      </span>
                    </Button>
                  </label>
                </div>

                {uploadedFileName && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm text-primary font-mono">
                      ✓ Loaded: {uploadedFileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select your key shares below to decrypt
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-3 mb-2">
                    <File className="w-5 h-5 text-accent" />
                    <span className="font-mono text-sm font-medium">
                      {originalFileName}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To decrypt this file, select{" "}
                    <strong>
                      any {threshold} of {shares.length} parties
                    </strong>{" "}
                    that hold your key shares:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {shares.map((party) => (
                    <button
                      key={party.id}
                      onClick={() => toggleParty(party.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedParties.has(party.id)
                          ? "bg-primary/20 border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selectedParties.has(party.id)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedParties.has(party.id) && (
                            <CheckCircle className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-mono">
                          Party {party.id}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <span className="text-sm text-muted-foreground">
                    Selected: {selectedParties.size} / {threshold} required
                  </span>
                  <Badge
                    variant={
                      selectedParties.size >= threshold ? "default" : "outline"
                    }
                    className={
                      selectedParties.size >= threshold ? "bg-primary" : ""
                    }
                  >
                    {selectedParties.size >= threshold
                      ? "Ready"
                      : "Insufficient"}
                  </Badge>
                </div>

                <Button
                  onClick={handleDecrypt}
                  disabled={selectedParties.size < threshold || isDecrypting}
                  className="w-full glow-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDecrypting ? "Decrypting..." : "Decrypt & Download"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
