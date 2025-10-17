"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAppWallet } from "./providers/WalletContext"
import { motion, AnimatePresence } from "framer-motion";
import AddFriendForm from "../components/AddFriendForm";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

type KeyShare = {
  id: number;
  share: JsonWebKey & { kid?: string } // exported JWK share object (for display)
  key: CryptoKey; // private key (same master private used for each "share" in this demo)
};

export default function Page() {
  // tssSystem state (mirrors your original `tssSystem` object)
  const [publicKeyJwk, setPublicKeyJwk] = useState<JsonWebKey | null>(null);
  const [publicKeyCrypto, setPublicKeyCrypto] = useState<CryptoKey | null>(null);
  const [privateKeyShares, setPrivateKeyShares] = useState<KeyShare[]>([]);
  const [threshold, setThreshold] = useState<number>(3);
  const [totalParties, setTotalParties] = useState<number>(5);
  const [currentSignature, setCurrentSignature] = useState<ArrayBuffer | null>(null);
  const [encryptedFile, setEncryptedFile] = useState<ArrayBuffer | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [iv, setIv] = useState<Uint8Array | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [fileHashBytes, setFileHashBytes] = useState<ArrayBuffer | null>(null);
  const [masterPrivateKey, setMasterPrivateKey] = useState<CryptoKey | null>(null);

  // UI state
  const [setupInfo, setSetupInfo] = useState<string | null>(null);
  const [verifyKeysOutput, setVerifyKeysOutput] = useState<string | null>(null);
  const [encryptOutput, setEncryptOutput] = useState<string | null>(null);
  const [signatureOutput, setSignatureOutput] = useState<string | null>(null);
  const [decryptOutput, setDecryptOutput] = useState<string | null>(null);
  const [messageSignOutput, setMessageSignOutput] = useState<string | null>(null);
  const [messageVerifyOutput, setMessageVerifyOutput] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected parties sets (for signing & message sign)
  const [selectedPartiesForSign, setSelectedPartiesForSign] = useState<Set<number>>(new Set());
  const [selectedPartiesForMessageSign, setSelectedPartiesForMessageSign] = useState<Set<number>>(new Set());

  // Message fields
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [verifyMessageText, setVerifyMessageText] = useState<string>("");
  const [verifySignatureHex, setVerifySignatureHex] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1); // ✅ Track current step for animation
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [friends, setFriends] = useState<string>('' as any);
  // Download URL for decrypted file
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const isErrorMessage = (msg: string | null) => {
    if (!msg) return false;
    return !msg.startsWith("✓"); // Messages not starting with ✓ are errors
  };


  const handleAddFriend = async (friendData: any) => {
    console.log("Friend added:", friendData);
    setFriends((prev) => [...prev, friendData]);
  };
  console.log("Friends List:", friends);
  useEffect(() => {
    return () => {
      if (decryptedUrl) URL.revokeObjectURL(decryptedUrl);
    };
  }, [decryptedUrl]);

  const toHex = (buffer: ArrayBuffer | Uint8Array | null) => {
    if (!buffer) return "";
    const arr = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // Step 1: generate keys
  async function generateKeys() {
    setSetupInfo(null);
    try {
      const n = Number(totalParties);
      const t = Number(threshold);

      if (t > n) {
        setSetupInfo("✗ Threshold cannot be greater than total parties!");
        return;
      }
      if (t < 2) {
        setSetupInfo("✗ Threshold must be at least 2!");
        return;
      }

      // generate a single Ed25519 keypair (master)
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "Ed25519",
        },
        true,
        ["sign", "verify"]
      );

      const exportedPublic = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const exportedPrivate = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

      // create n "shares" — in this demo we reuse the same private key for each share
      const shares: KeyShare[] = [];
      for (let i = 0; i < n; i++) {
        shares.push({
          id: i + 1,
          share: { ...exportedPrivate, kid: `party-${i + 1}` }, // JWK with kid set for display
          key: keyPair.privateKey,
        });
      }

      setPublicKeyJwk(exportedPublic);
      setPublicKeyCrypto(keyPair.publicKey);
      setMasterPrivateKey(keyPair.privateKey);
      setPrivateKeyShares(shares);
      setSetupInfo("✓ Key shares generated successfully!");
      // clear other outputs
      setVerifyKeysOutput(null);
      setEncryptOutput(null);
      setSignatureOutput(null);
      setDecryptOutput(null);
      setMessageSignOutput(null);
      setMessageVerifyOutput(null);
      setEncryptedFile(null);
      setEncryptionKey(null);
      setIv(null);
      setOriginalFileName(null);
      setFileHash(null);
      setFileHashBytes(null);
      setCurrentSignature(null);
      setDecryptedUrl(null);
    } catch (err) {
      if (err instanceof Error) {
        setSetupInfo(`✗ Decryption error: ${err.message}`);
      } else {
        setSetupInfo(`✗ Decryption error: ${String(err)}`);
      }
    }
  }

  // Step 2: verify keys — sign test message with each share and verify with public key
  async function verifyKeys() {
    setVerifyKeysOutput(null);
    try {
      const testMessage = "KeyVerificationTest";
      const encoder = new TextEncoder();
      const data = encoder.encode(testMessage);
      let allValid = true;
      for (const party of privateKeyShares) {
        const signature = await window.crypto.subtle.sign("Ed25519", party.key, data);
        const isValid = await window.crypto.subtle.verify("Ed25519", publicKeyCrypto!, signature, data);
        if (!isValid) {
          allValid = false;
          break;
        }
      }
      if (allValid) {
        setVerifyKeysOutput("✓ All key shares are valid and correspond to the public key!");
      } else {
        setVerifyKeysOutput("✗ Some key shares are invalid!");
      }
    } catch (err) {
      if (err instanceof Error) {
        setVerifyKeysOutput(`✗ Decryption error: ${err.message}`);
      } else {
        setVerifyKeysOutput(`✗ Decryption error: ${String(err)}`);
      }
    }
  }

  // helper to toggle party selection for signing (file decryption)
  function togglePartyForSign(id: number) {
    setSelectedPartiesForSign((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // helper to toggle party selection for message signing
  function togglePartyForMessageSign(id: number) {
    setSelectedPartiesForMessageSign((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Step 3: display file info — handled by input change
  function displayFileInfo() {
    const input = fileInputRef.current;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    setOriginalFileName(file.name);
    setEncryptOutput(null);
    // no further action here; encryptFile will do encryption
  }

  // Step 3: encrypt file
  async function encryptFile() {
    setEncryptOutput(null);
    try {
      const input = fileInputRef.current;
      if (!input || !input.files || input.files.length === 0) {
        setEncryptOutput("✗ Please select a file!");
        return;
      }
      const file = input.files[0];
      setOriginalFileName(file.name);

      const fileData = await file.arrayBuffer();

      // Generate AES-GCM key
      const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // IV
      const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivBytes },
        aesKey,
        fileData
      );

      // Hash encrypted file
      const hashBytes = await window.crypto.subtle.digest("SHA-256", encrypted);
      const hashHex = toHex(hashBytes);

      setEncryptionKey(aesKey);
      setIv(ivBytes);
      setEncryptedFile(encrypted);
      setFileHashBytes(hashBytes);
      setFileHash(hashHex);
      setEncryptOutput(
        `✓ File encrypted successfully! Encrypted Size: ${(encrypted.byteLength / 1024).toFixed(2)} KB`
      );

      // clear signature/decrypt outputs
      setSignatureOutput(null);
      setDecryptOutput(null);
      setCurrentSignature(null);
      setDecryptedUrl(null);
    } catch (err) {
      if (err instanceof Error) {
        setEncryptOutput(`✗ Decryption error: ${err.message}`);
      } else {
        setEncryptOutput(`✗ Decryption error: ${String(err)}`);
      }
    }
  }

  // Step 4: create signature (threshold signing simulation)
  async function createSignature() {
    setSignatureOutput(null);
    try {
      // gather selected parties
      const selectedIds = Array.from(selectedPartiesForSign).sort((a, b) => a - b);
      if (selectedIds.length < threshold) {
        setSignatureOutput(
          `✗ Not enough parties selected! Need at least ${threshold}, but only ${selectedIds.length} selected.`
        );
        return;
      }
      if (!fileHashBytes) {
        setSignatureOutput("✗ No encrypted file to sign!");
        return;
      }

      // In original demo, first selected party does signing (shares are identical)
      const firstId = selectedIds[0];
      const party = privateKeyShares.find((p) => p.id === firstId);
      if (!party) {
        setSignatureOutput("✗ Selected party not found.");
        return;
      }

      // Sign file hash bytes
      const signature = await window.crypto.subtle.sign("Ed25519", party.key, fileHashBytes);
      setCurrentSignature(signature);

      const sigHex = toHex(signature);
      setSignatureOutput(
        `✓ Threshold signatures obtained! Signed by ${selectedIds.length} parties (threshold: ${threshold}). Signature (first 100 chars): ${sigHex.substring(
          0,
          100
        )}...`
      );

      // enable decrypt section by clearing previous decrypt output
      setDecryptOutput(null);
      setDecryptedUrl(null);
    } catch (err) {
      if (err instanceof Error) {
        setSignatureOutput(`✗ Decryption error: ${err.message}`);
      } else {
        setSignatureOutput(`✗ Decryption error: ${String(err)}`);
      }
    }
  }

  // Step 5: verify signature & decrypt
  async function verifyAndDecrypt() {
    setDecryptOutput(null);
    setDecryptedUrl(null);
    try {
      if (!currentSignature) {
        setDecryptOutput("✗ No signature available! Please get signatures first.");
        return;
      }
      if (!fileHashBytes) {
        setDecryptOutput("✗ No file hash to verify with.");
        return;
      }
      if (!publicKeyCrypto) {
        setDecryptOutput("✗ Public key not available.");
        return;
      }

      const isValid = await window.crypto.subtle.verify("Ed25519", publicKeyCrypto, currentSignature, fileHashBytes);
      if (!isValid) {
        setDecryptOutput("✗ Signature verification failed! Cannot decrypt file without valid threshold signatures.");
        return;
      }

      if (!encryptionKey || !iv || !encryptedFile) {
        setDecryptOutput("✗ Encryption parameters missing; cannot decrypt.");
        return;
      }

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        encryptionKey,
        encryptedFile
      );

      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);
      setDecryptedUrl(url);

      setDecryptOutput(
        `✓ Signature verified & file decrypted successfully! Original File: ${originalFileName}. Decrypted Size: ${(decryptedData.byteLength / 1024).toFixed(
          2
        )} KB`
      );
    } catch (err) {
      if (err instanceof Error) {
        setDecryptOutput(`✗ Decryption error: ${err.message}`);
      } else {
        setDecryptOutput(`✗ Decryption error: ${String(err)}`);
      }
    }
  }

  // Step 6: sign a message (using selected message parties)
  async function signMessage() {
    setMessageSignOutput(null);
    try {
      const message = messageToSign.trim();
      if (!message) {
        setMessageSignOutput("✗ Please enter a message to sign!");
        return;
      }
      const selectedIds = Array.from(selectedPartiesForMessageSign).sort((a, b) => a - b);
      if (selectedIds.length < threshold) {
        setMessageSignOutput(
          `✗ Not enough parties selected! Need at least ${threshold}, but only ${selectedIds.length} selected.`
        );
        return;
      }

      // Use first selected party to sign (same behaviour as original)
      const firstId = selectedIds[0];
      const party = privateKeyShares.find((p) => p.id === firstId);
      if (!party) {
        setMessageSignOutput("✗ Selected party not found.");
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const signature = await window.crypto.subtle.sign("Ed25519", party.key, data);
      const sigHex = toHex(signature);

      setMessageSignOutput(
        `✓ Message signed successfully! Signed by ${selectedIds.length} parties (threshold: ${threshold}).\nSignature: ${sigHex}`
      );
    } catch (err) {
      if (err instanceof Error) {
        setMessageSignOutput(`✗ Decryption error: ${err.message}`);
      } else {
        setMessageSignOutput(`✗ Decryption error: ${String(err)}`);
      }
    }
  }

  // Step 7: verify message signature
  async function verifyMessage() {
    setMessageVerifyOutput(null);
    try {
      const message = verifyMessageText.trim();
      const sigHex = verifySignatureHex.trim();
      if (!message || !sigHex) {
        setMessageVerifyOutput("✗ Please enter both message and signature!");
        return;
      }

      const signatureBytes = new Uint8Array(sigHex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      if (!publicKeyCrypto) {
        setMessageVerifyOutput("✗ Public key not available.");
        return;
      }

      const isValid = await window.crypto.subtle.verify("Ed25519", publicKeyCrypto, signatureBytes, data);
      if (isValid) {
        setMessageVerifyOutput("✓ Signature is valid!");
      } else {
        setMessageVerifyOutput("✗ Signature is invalid!");
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessageVerifyOutput(`✗ Decryption error: ${err.message}`);
      } else {
        setMessageVerifyOutput(`✗ Decryption error: ${String(err)}`);
      }
    }
  }


  // utility for downloading decrypted blob directly
  function handleDownloadDecrypted() {
    if (decryptedUrl && originalFileName) {
      const a = document.createElement("a");
      a.href = decryptedUrl;
      a.download = originalFileName;
      a.click();
    }
  }
  const { publicKey } = useAppWallet();
  return (
    <div>
      <div className="flex justify-end items-center mb-6 mr-4">
        <Button className="text-white bg-blue-700 font-bold" onClick={() => setShowAddFriendForm(true)}>
          Add Friend
        </Button>
        <AddFriendForm
          onAddFriend={handleAddFriend}
          showAddFriendForm={showAddFriendForm}
          setShowAddFriendForm={setShowAddFriendForm}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative space-y-6"
        >


          <div className="p-6 bg-black flex">
            <div className="max-w-5xl mx-auto rounded-2xl p-8 shadow-2xl bg-black text-white shadow-lg border border-gray-700">
              <h1 className="text-3xl font-bold  mb-2">🔐 TSS File Encryption/Decryption & Message Signing</h1>
              <p className="mb-6">Encrypt files and require threshold signatures to decrypt them; also sign and verify messages</p>

              {/* Step 1: Setup */}
              {currentStep === 1 && (
                <section className="mb-6 p-5 bg-black text-white rounded-lg border-l-4 border-indigo-500 border">
                  <h2 className="text-xl font-semibold mb-3">Step 1: Setup TSS Parameters</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold">Number of Parties (n):</label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={totalParties}
                        onChange={(e) => setTotalParties(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-200 p-2 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold">Threshold (t) - minimum parties needed:</label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-200 p-2 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  {setupInfo && (
                    <div className={`mt-4 ${setupInfo.startsWith("✓") ? "border-l-4 border-green-500" : "border-l-4 border-red-500"} p-3 rounded border`}>
                      <div className="text-sm">{setupInfo}</div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-between">


                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                      onClick={generateKeys}
                    >
                      Generate Key Shares
                    </button>
                    <div>
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(2)}
                      >
                        Next →
                      </button>
                    </div>

                  </div>
                </section>
              )}

              {/* Step 2: Parties & Key Shares */}
              {currentStep === 2 && (
                <section className="mb-6 p-5  rounded-lg border-l-4 border-indigo-500 border border-gray-700">
                  <h2 className="text-xl font-semibold  mb-3">Step 2: Key Shares Generated</h2>

                  <div className="mb-4 ">
                    <div className="border-l-4 border-blue-400 p-3 rounded border border-gray-700">
                      <strong>Public Key (JWK):</strong>
                      <pre className="mt-2 text-green-200 p-3 rounded text-sm overflow-auto whitespace-pre-wrap">{publicKeyJwk ? JSON.stringify(publicKeyJwk, null, 2) : "—"}</pre>
                    </div>
                  </div>

                  <div>
                    <div className="border-l-4 border-blue-400 p-3 rounded border border-gray-700">
                      <strong>Private Key Shares:</strong>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {privateKeyShares.length === 0 && <div className="text-sm text-gray-600">No key shares yet — generate keys above.</div>}
                        {privateKeyShares.map((p) => (
                          <div key={p.id} className="p-3  rounded border-2 border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold">Party {p.id}</div>
                            </div>
                            <div className="text-xs font-mono  break-words  p-2 rounded">{JSON.stringify(p.share, null, 2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                      onClick={verifyKeys}
                    >
                      🔍 Verify Keys
                    </button>

                    {verifyKeysOutput && (
                      <div className={`mt-3 ${verifyKeysOutput.startsWith("✓") ? " border-l-4 shadow-lg border-green-500 border border-gray-700" : "bg-red-50 border-l-4 border-red-500 border border-gray-700 "} p-3 rounded`}>
                        <div className="text-sm">{verifyKeysOutput}</div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-between">
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(1)}
                      >
                        ← Back
                      </button>
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                        onClick={() => setCurrentStep(3)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 3: Encrypt File */}

              {currentStep === 3 && (
                <section className="mb-6 p-5  rounded-lg border-l-4 border-indigo-500 border border-gray-700">
                  <h2 className="text-xl font-semibold  mb-3">Step 3: Encrypt File</h2>

                  <div>
                    <label className="block font-semibold">Select File to Encrypt:</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={() => {
                        displayFileInfo();
                      }}
                      className="mt-2"
                    />
                  </div>

                  {originalFileName && (
                    <div className="file-info mt-3 p-3  rounded border-2 border-gray-200 ">
                      <strong className="text-indigo-600">📄 File:</strong> {originalFileName}
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                      onClick={encryptFile}
                    >
                      🔒 Encrypt File
                    </button>

                    {encryptOutput && (
                      <div className={`mt-3 p-3 rounded ${isErrorMessage(encryptOutput)
                        ? "border-l-4 border-red-500 text-red-700 shadow-lg border"
                        : "border-l-4 border-green-500 text-green-700 shadow-lg border"
                        }`}>
                        <div className="text-sm">{encryptOutput}</div>
                        {fileHash && (
                          <div className="mt-2   p-3 rounded text-sm font-mono break-words">
                            <strong>File Hash (SHA-256):</strong>
                            <div className="mt-2">{fileHash}</div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4 flex justify-between">
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(2)}
                      >
                        ← Back
                      </button>
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                        onClick={() => setCurrentStep(4)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 4: Get Threshold Signatures */}
              {currentStep === 4 && (
                <section className="mb-6 p-5  rounded-lg border-l-4  border border-gray-700">
                  <h2 className="text-xl font-semibold  mb-3">Step 4: Get Threshold Signatures</h2>
                  <p className="text-sm mb-3"><strong>Select parties to approve decryption (minimum {threshold}):</strong></p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {privateKeyShares.map((p) => {
                      const selected = selectedPartiesForSign.has(p.id);
                      return (
                        <div key={p.id} className={`p-3 rounded border-2 ${selected ? "border-indigo-500" : "border-gray-200"}`}>
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">Party {p.id}</div>
                            <input
                              type="checkbox"
                              className="w-5 h-5"
                              checked={selected}
                              onChange={() => togglePartyForSign(p.id)}
                            />
                          </div>
                          <div className="mt-2 text-xs font-mono break-words  p-2 rounded">Share ID: {p.share.kid}</div>
                        </div>
                      );
                    })}
                    {/* {friends && friends.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Added Friends</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {friends.map((friend, index) => {
            const isSelected = selectedPartiesForSign.has(friend.id);
            return (
              <div
                key={friend.id || index}
                className={`p-3 rounded border-2 ${
                  isSelected ? "border-green-500" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{friend.name}</p>
                    <p className="text-xs text-gray-500">{friend.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={isSelected}
                    onChange={() => togglePartyForSign(friend.id)}
                  />
                </div>
                <p className="text-xs mt-2 break-all">{friend.walletAddress}</p>
              </div>
            );
          })}
        </div>
      </div>
    )} */}
                  </div>

                  <div className="mt-4">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                      onClick={createSignature}
                    >
                      ✍️ Sign for Decryption
                    </button>




                    {signatureOutput && (
                      <div className={`mt-3 p-3 rounded ${isErrorMessage(signatureOutput)
                        ? " border-l-4 border-red-500 text-red-700 shadow-lg border"
                        : " border-l-4 border-green-500 text-green-700 shadow-lg border"
                        }`}>
                        <div className="text-sm">{signatureOutput}</div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-between">
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(3)}
                      >
                        ← Back
                      </button>
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                        onClick={() => setCurrentStep(5)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 5: Verify & Decrypt File */}
              {currentStep === 5 && (
                <section className="mb-6 p-5  rounded-lg border-l-4 border border-gray-700">
                  <h2 className="text-xl font-semibold  mb-3">Step 5: Verify & Decrypt File</h2>
                  <div className=" border-l-4 border-yellow-400 p-3 rounded border border-gray-700">
                    <strong>⚠️ Decryption requires valid threshold signatures</strong>
                  </div>

                  <div className="mt-4">
                    <button
                      className=" text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500 border border-gray-700"
                      onClick={verifyAndDecrypt}
                    >
                      🔓 Verify & Decrypt File
                    </button>


                    {decryptOutput && (
                      <div className="mt-3  border-l-4 border-green-500 p-3 rounded border border-gray-700 shadow-lg">
                        <div className="text-sm whitespace-pre-wrap">{decryptOutput}</div>
                        {decryptedUrl && (
                          <div className="mt-3">
                            <button onClick={handleDownloadDecrypted} className="bg-green-600 text-white px-4 py-2 rounded-md mr-2">⬇️ Download Decrypted File</button>
                            <a href={decryptedUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-700 underline">Open in new tab</a>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4 flex justify-between">
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(4)}
                      >
                        ← Back
                      </button>
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                        onClick={() => setCurrentStep(6)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 6: Sign a Message */}
              {currentStep === 6 && (
                <section className="mb-6 p-5  rounded-lg border-l-4 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-3">Step 6: Sign a Message</h2>

                  <div>
                    <label className="block font-semibold">Message to Sign:</label>
                    <textarea
                      rows={4}
                      value={messageToSign}
                      onChange={(e) => setMessageToSign(e.target.value)}
                      className="mt-2 block w-full rounded-md border-2 border-gray-200 p-2 focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>

                  <p className="mt-3"><strong>Select parties to sign (minimum {threshold}):</strong></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {privateKeyShares.map((p) => {
                      const selected = selectedPartiesForMessageSign.has(p.id);
                      return (
                        <div key={`msg-${p.id}`} className={`p-3 rounded border-2 ${selected ? "border-indigo-500 " : "border-gray-200 "}`}>
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">Party {p.id}</div>
                            <input
                              type="checkbox"
                              className="w-5 h-5"
                              checked={selected}
                              onChange={() => togglePartyForMessageSign(p.id)}
                            />
                          </div>
                          <div className="mt-2 text-xs font-mono break-words   p-2 rounded">Share ID: {p.share.kid}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-4">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                      onClick={signMessage}
                    >
                      ✍️ Sign Message
                    </button>

                    {messageSignOutput && (
                      <div className={`p-3 rounded ${isErrorMessage(messageSignOutput)
                        ? "border-l-4 border-red-500 text-red-700 border"
                        : "border-l-4 border-green-500 text-green-700 shadow-lg border"
                        }`}>
                        <div className="text-sm font-mono break-words whitespace-pre-wrap">
                          {messageSignOutput}
                        </div>
                      </div>
                    )}

                    {/* Back / Next buttons */}
                    <div className="flex justify-between mt-2">
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(5)}
                      >
                        ← Back
                      </button>
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                        onClick={() => setCurrentStep(7)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </section>

              )}

              {/* Step 7: Verify Message Signature */}
              {currentStep === 7 && (
                <section className="mb-6 p-5  rounded-lg border-l-4 border-indigo-500 border">
                  <h2 className="text-xl font-semibold  mb-3">Step 7: Verify Message Signature</h2>
                  <div>
                    <label className="block font-semibold">Message:</label>
                    <textarea
                      rows={4}
                      value={verifyMessageText}
                      onChange={(e) => setVerifyMessageText(e.target.value)}
                      className="mt-2 block w-full rounded-md border-2 border-gray-200 p-2 focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block font-semibold">Signature (hex):</label>
                    <input
                      type="text"
                      value={verifySignatureHex}
                      onChange={(e) => setVerifySignatureHex(e.target.value)}
                      className="mt-2 block w-full rounded-md border-2 border-gray-200 p-2 focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                  {messageVerifyOutput && (
                    <div className={`mt-3 ${messageVerifyOutput.startsWith("✓") ? "shadow-lg  border-l-4 border-green-500" : "border-l-4 border-red-500"} p-3 rounded border`}>
                      <div className="text-sm">{messageVerifyOutput}</div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                      onClick={verifyMessage}
                    >
                      ✅ Verify
                    </button>
                    <div>
                      <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
                        onClick={() => setCurrentStep(6)}
                      >
                        ← Back
                      </button>
                    </div>


                  </div>
                </section>
              )}
            </div>

            {friends && friends.length > 0 && (
              <div className="space-y-3">
                {friends.map((friend, index) => (
                  <div
                    key={friend.id || index}
                    className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 space-y-2 animate-fadeIn"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 h-5 w-5" />
                      <span className="font-medium">Friend Added Successfully!</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Name:</strong> {friend.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {friend.email}
                      </p>
                      <p className="break-all">
                        <strong>Wallet:</strong> {friend.walletAddress}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}


          </div>
        </motion.div>

      </AnimatePresence>
    </div>
  );
}
