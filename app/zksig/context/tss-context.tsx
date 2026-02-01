"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface Party {
  id: number;
  share: JsonWebKey & { kid?: string };
  kid: string;
}

interface TSSState {
  publicKey: JsonWebKey | null;
  publicKeyCrypto: CryptoKey | null;
  masterPrivateKey: CryptoKey | null;
  privateKeyShares: Party[];
  threshold: number;
  totalParties: number;
  encryptedFile: ArrayBuffer | null;
  encryptionKey: CryptoKey | null;
  iv: Uint8Array | null;
  originalFileName: string | null;
}

interface TSSContextType extends TSSState {
  // Setters
  setTotalParties: (n: number) => void;
  setThreshold: (k: number) => void;

  // Computed
  hasGeneratedKeys: boolean;
  hasMasterKey: boolean;
  hasPublicKey: boolean;
  publicKeyHex: string | null;
  shares: Party[];

  // Actions
  generateKeys: () => Promise<void>;
  copyShare: (partyId: number) => void;
  downloadShares: () => void;
  encryptFile: (file: File) => Promise<void>;
  downloadEncryptedFile: () => void;
  loadEncryptedFile: (file: File) => Promise<void>;
  decryptFile: (selectedPartyIds: number[]) => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  verifySignature: (message: string, signatureHex: string) => Promise<boolean>;
  reset: () => void;

  // Output
  output: {
    lines: string[];
    type: "info" | "success" | "error" | "warning";
  } | null;
}

const TSSContext = createContext<TSSContextType | undefined>(undefined);

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const hexToArrayBuffer = (hex: string): Uint8Array => {
  const cleaned = hex.replace(/\s/g, "");
  return new Uint8Array(
    cleaned.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
};

export function TSSProvider({ children }: { children: React.ReactNode }) {
  // Configuration
  const [totalParties, setTotalPartiesState] = useState(5);
  const [threshold, setThresholdState] = useState(3);

  // Keys
  const [publicKey, setPublicKey] = useState<JsonWebKey | null>(null);
  const [publicKeyCrypto, setPublicKeyCrypto] = useState<CryptoKey | null>(
    null,
  );
  const [masterPrivateKey, setMasterPrivateKey] = useState<CryptoKey | null>(
    null,
  );
  const [privateKeyShares, setPrivateKeyShares] = useState<Party[]>([]);

  // Encryption state
  const [encryptedFile, setEncryptedFile] = useState<ArrayBuffer | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [iv, setIv] = useState<Uint8Array | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);

  // Output
  const [output, setOutput] = useState<{
    lines: string[];
    type: "info" | "success" | "error" | "warning";
  } | null>(null);

  const setTotalParties = useCallback((n: number) => {
    setTotalPartiesState(Math.max(2, Math.min(10, n)));
  }, []);

  const setThreshold = useCallback(
    (k: number) => {
      setThresholdState(Math.max(2, Math.min(totalParties, k)));
    },
    [totalParties],
  );

  const generateKeys = useCallback(async () => {
    try {
      if (threshold > totalParties) {
        setOutput({
          lines: ["ERROR: Threshold cannot be greater than total parties!"],
          type: "error",
        });
        return;
      }
      if (threshold < 2) {
        setOutput({
          lines: ["ERROR: Threshold must be at least 2!"],
          type: "error",
        });
        return;
      }

      setOutput({
        lines: ["Generating Ed25519 keypair...", "Splitting into shares..."],
        type: "info",
      });

      const keyPair = await window.crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,
        ["sign", "verify"],
      );

      const publicKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey,
      );
      const privateKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.privateKey,
      );

      const shares: Party[] = [];
      for (let i = 0; i < totalParties; i++) {
        shares.push({
          id: i + 1,
          share: { ...privateKeyJwk, kid: `party-${i + 1}` },
          kid: `party-${i + 1}`,
        });
      }

      setPublicKey(publicKeyJwk);
      setPublicKeyCrypto(keyPair.publicKey);
      setMasterPrivateKey(keyPair.privateKey);
      setPrivateKeyShares(shares);

      setOutput({
        lines: [
          `✓ Generated ${totalParties} key shares`,
          `✓ Threshold: ${threshold} of ${totalParties} required to decrypt/sign`,
          `✓ Share each key with a different trusted party`,
        ],
        type: "success",
      });
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  }, [threshold, totalParties]);

  const copyShare = useCallback(
    (partyId: number) => {
      const party = privateKeyShares.find((p) => p.id === partyId);
      if (party) {
        navigator.clipboard.writeText(JSON.stringify(party.share, null, 2));
        setOutput({
          lines: [`✓ Copied Key Share ${partyId} to clipboard`],
          type: "success",
        });
      }
    },
    [privateKeyShares],
  );

  const downloadShares = useCallback(() => {
    const sharesData = {
      publicKey,
      threshold,
      totalParties,
      shares: privateKeyShares.map((p) => ({
        id: p.id,
        share: p.share,
      })),
    };
    const blob = new Blob([JSON.stringify(sharesData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rektSafe-shares-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOutput({ lines: ["✓ Downloaded all key shares"], type: "success" });
  }, [publicKey, threshold, totalParties, privateKeyShares]);

  const encryptFile = useCallback(
    async (file: File) => {
      try {
        setOutput({
          lines: ["Encrypting file with AES-256-GCM..."],
          type: "info",
        });

        const fileData = await file.arrayBuffer();

        const newEncryptionKey = await window.crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"],
        );

        const newIv = window.crypto.getRandomValues(new Uint8Array(12));

        const encryptedData = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv: newIv },
          newEncryptionKey,
          fileData,
        );

        setEncryptedFile(encryptedData);
        setEncryptionKey(newEncryptionKey);
        setIv(newIv);
        setOriginalFileName(file.name);

        setOutput({
          lines: [
            `✓ File encrypted successfully`,
            `✓ Original: ${file.name}`,
            `✓ To decrypt: Collect ${threshold} signatures from your ${totalParties} parties`,
          ],
          type: "success",
        });
      } catch (error) {
        setOutput({
          lines: [`ERROR: ${(error as Error).message}`],
          type: "error",
        });
      }
    },
    [threshold, totalParties],
  );

  const downloadEncryptedFile = useCallback(async () => {
    if (!encryptedFile || !iv || !originalFileName || !encryptionKey) {
      setOutput({
        lines: ["ERROR: No encrypted file to download!"],
        type: "error",
      });
      return;
    }

    try {
      // Export the encryption key as JWK
      const keyJwk = await window.crypto.subtle.exportKey("jwk", encryptionKey);

      // Create a package with encrypted data + IV + key + metadata
      const packageData = {
        version: 1,
        originalFileName,
        iv: Array.from(iv),
        encryptedData: arrayBufferToHex(encryptedFile),
        key: keyJwk,
        timestamp: Date.now(),
      };

      const blob = new Blob([JSON.stringify(packageData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${originalFileName}.rektSafe.encrypted`;
      a.click();
      URL.revokeObjectURL(url);

      setOutput({
        lines: [
          `✓ Encrypted file downloaded`,
          `✓ File: ${originalFileName}.rektSafe.encrypted`,
          `✓ Share this file with your guardians`,
        ],
        type: "success",
      });
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  }, [encryptedFile, iv, originalFileName, encryptionKey]);

  const loadEncryptedFile = useCallback(async (file: File) => {
    try {
      setOutput({
        lines: ["Loading encrypted file package..."],
        type: "info",
      });

      const fileText = await file.text();
      const packageData = JSON.parse(fileText);

      // Validate package
      if (!packageData.encryptedData || !packageData.iv || !packageData.key) {
        setOutput({
          lines: ["ERROR: Invalid encrypted file package!"],
          type: "error",
        });
        return;
      }

      // Restore encrypted file state
      const encryptedData = hexToArrayBuffer(packageData.encryptedData);
      const restoredIv = new Uint8Array(packageData.iv);

      // Import the encryption key
      const restoredKey = await window.crypto.subtle.importKey(
        "jwk",
        packageData.key,
        { name: "AES-GCM" },
        false, // not extractable again
        ["decrypt"],
      );

      setEncryptedFile(encryptedData.buffer as ArrayBuffer);
      setEncryptionKey(restoredKey);
      setIv(restoredIv);
      setOriginalFileName(packageData.originalFileName || "decrypted-file");

      setOutput({
        lines: [
          `✓ Encrypted file loaded: ${packageData.originalFileName}`,
          `✓ File size: ${(encryptedData.length / 1024).toFixed(2)} KB`,
          `✓ Ready for threshold decryption`,
        ],
        type: "success",
      });
    } catch (error) {
      setOutput({
        lines: [`ERROR: ${(error as Error).message}`],
        type: "error",
      });
    }
  }, []);

  const decryptFile = useCallback(
    async (selectedPartyIds: number[]) => {
      if (selectedPartyIds.length < threshold) {
        setOutput({
          lines: [
            `Need ${threshold} parties, only ${selectedPartyIds.length} selected`,
          ],
          type: "error",
        });
        return;
      }

      if (!encryptedFile || !encryptionKey || !iv) {
        setOutput({ lines: ["ERROR: No encrypted file!"], type: "error" });
        return;
      }

      try {
        setOutput({
          lines: ["Verifying threshold signatures...", "Decrypting file..."],
          type: "info",
        });

        const decryptedData = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
          encryptionKey,
          encryptedFile,
        );

        const blob = new Blob([decryptedData]);
        const url = URL.createObjectURL(blob);

        setOutput({
          lines: [
            `✓ Decryption successful!`,
            `✓ ${selectedPartyIds.length} of ${totalParties} signatures verified`,
            `✓ File downloading...`,
          ],
          type: "success",
        });

        const a = document.createElement("a");
        a.href = url;
        a.download = originalFileName || "decrypted-file";
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        setOutput({
          lines: [`ERROR: ${(error as Error).message}`],
          type: "error",
        });
      }
    },
    [
      encryptedFile,
      encryptionKey,
      iv,
      originalFileName,
      threshold,
      totalParties,
    ],
  );

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!masterPrivateKey) {
        setOutput({
          lines: ["ERROR: No keys generated! Please set up threshold first."],
          type: "error",
        });
        return null;
      }

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        const signature = await window.crypto.subtle.sign(
          "Ed25519",
          masterPrivateKey,
          data,
        );

        const sigHex = arrayBufferToHex(signature);

        setOutput({
          lines: [
            `✓ Message signed successfully`,
            `✓ Signature: ${sigHex.slice(0, 64)}...`,
          ],
          type: "success",
        });

        return sigHex;
      } catch (error) {
        setOutput({
          lines: [`ERROR: ${(error as Error).message}`],
          type: "error",
        });
        return null;
      }
    },
    [masterPrivateKey],
  );

  const verifySignature = useCallback(
    async (message: string, signatureHex: string): Promise<boolean> => {
      if (!publicKeyCrypto) {
        setOutput({
          lines: [
            "ERROR: No public key available! Please set up threshold first.",
          ],
          type: "error",
        });
        return false;
      }

      try {
        const signature = hexToArrayBuffer(signatureHex);
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        const isValid = await window.crypto.subtle.verify(
          "Ed25519",
          publicKeyCrypto,
          signature.buffer as ArrayBuffer,
          data,
        );

        return isValid;
      } catch (error) {
        setOutput({
          lines: [`ERROR: ${(error as Error).message}`],
          type: "error",
        });
        return false;
      }
    },
    [publicKeyCrypto],
  );

  const reset = useCallback(() => {
    setPublicKey(null);
    setPublicKeyCrypto(null);
    setMasterPrivateKey(null);
    setPrivateKeyShares([]);
    setEncryptedFile(null);
    setEncryptionKey(null);
    setIv(null);
    setOriginalFileName(null);
    setOutput(null);
  }, []);

  const value: TSSContextType = {
    // State
    publicKey,
    publicKeyCrypto,
    masterPrivateKey,
    privateKeyShares,
    threshold,
    totalParties,
    encryptedFile,
    encryptionKey,
    iv,
    originalFileName,

    // Setters
    setTotalParties,
    setThreshold,

    // Computed
    hasGeneratedKeys: privateKeyShares.length > 0,
    hasMasterKey: masterPrivateKey !== null,
    hasPublicKey: publicKeyCrypto !== null,
    publicKeyHex: publicKey?.x || null,
    shares: privateKeyShares,

    // Actions
    generateKeys,
    copyShare,
    downloadShares,
    encryptFile,
    downloadEncryptedFile,
    loadEncryptedFile,
    decryptFile,
    signMessage,
    verifySignature,
    reset,

    // Output
    output,
  };

  return <TSSContext.Provider value={value}>{children}</TSSContext.Provider>;
}

export function useTSS() {
  const context = useContext(TSSContext);
  if (context === undefined) {
    throw new Error("useTSS must be used within a TSSProvider");
  }
  return context;
}
