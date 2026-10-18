"use client";

import { BrowserProvider } from "ethers";
import type { Eip1193Provider } from "@/lib/eip1193";
import { privacyNetworkById } from "@/lib/chains";
import type { EvmPrivacyToken } from "@/lib/evm-tokens";
import { getPublicBasePath } from "@/lib/browser-polyfills/hasher-wasm-init";

// Must match the Privacy Cash EVM SDK exactly. A different message derives a
// different key and makes shielded funds undecryptable.
export const EVM_SIGN_MESSAGE = "Privacy Money account sign in";

// Left untouched when the user presses MAX on a native-token shield, so the
// deposit transaction still has gas. Same reserve on every supported mainnet.
export const NATIVE_GAS_RESERVE = 0.005;

export type { EvmPrivacyToken };

export function evmSignStorageKey(address: string) {
  return `evm_sign_${address}`;
}

export function readEvmSignature(address: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(evmSignStorageKey(address));
}

export function storeEvmSignature(address: string, signature: string) {
  window.localStorage.setItem(evmSignStorageKey(address), signature);
}

export function isEthAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function circuitBasePath() {
  // SDK appends the input count, so "/circuit" loads /circuit2.wasm and /circuit2.zkey.
  return `${getPublicBasePath()}/circuit`;
}

function asDecimal(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "toString" in value) {
    return (value as { toString(): string }).toString();
  }
  return undefined;
}

function toTxRequest(unsignedTx: Record<string, unknown>) {
  const request: Record<string, unknown> = {
    to: unsignedTx.to,
    data: unsignedTx.data,
  };

  const value = asDecimal(unsignedTx.value);
  if (value !== undefined && value !== "0") request.value = value;

  const gasLimit = asDecimal(unsignedTx.gasLimit ?? unsignedTx.gas);
  if (gasLimit !== undefined) request.gasLimit = gasLimit;

  const maxFeePerGas = asDecimal(unsignedTx.maxFeePerGas);
  const maxPriorityFeePerGas = asDecimal(unsignedTx.maxPriorityFeePerGas);
  if (maxFeePerGas !== undefined) request.maxFeePerGas = maxFeePerGas;
  if (maxPriorityFeePerGas !== undefined) {
    request.maxPriorityFeePerGas = maxPriorityFeePerGas;
  }
  if (maxFeePerGas === undefined) {
    const gasPrice = asDecimal(unsignedTx.gasPrice);
    if (gasPrice !== undefined) request.gasPrice = gasPrice;
  }

  const nonce = asDecimal(unsignedTx.nonce);
  if (nonce !== undefined) request.nonce = Number(nonce);

  const chainId = asDecimal(unsignedTx.chainId);
  if (chainId !== undefined) request.chainId = Number(chainId);

  return request;
}

async function sendUnsignedTx(
  walletProvider: Eip1193Provider,
  unsignedTx: Record<string, unknown>,
) {
  const provider = new BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  const tx = await signer.sendTransaction(toTxRequest(unsignedTx));
  // Approvals must be mined before the SDK builds the shield proof.
  await tx.wait();
  return tx.hash;
}

function assertSupportedChain(chainId: number) {
  if (!privacyNetworkById(chainId)) {
    throw new Error(
      "This network is not a Privacy Cash mainnet. Switch to Ethereum, Base, BNB Smart Chain, or Robinhood Chain.",
    );
  }
}

export async function depositEvm({
  amount,
  token,
  address,
  signature,
  walletProvider,
  chainId,
}: {
  amount: number;
  token: EvmPrivacyToken;
  address: string;
  signature: string;
  walletProvider: Eip1193Provider;
  chainId: number;
}): Promise<string> {
  assertSupportedChain(chainId);
  const { deposit } = await import("privacycash-evm");
  const hash = await deposit({
    depositAmountInput: amount,
    keyBasePath: circuitBasePath(),
    signature,
    address,
    token,
    network: chainId,
    txSender: (unsignedTx: Record<string, unknown>) =>
      sendUnsignedTx(walletProvider, unsignedTx),
  });
  return typeof hash === "string" ? hash : String(hash);
}

export async function withdrawEvm({
  amount,
  token,
  recipient,
  address,
  signature,
  chainId,
}: {
  amount: number;
  token: EvmPrivacyToken;
  recipient: string;
  address: string;
  signature: string;
  chainId: number;
}): Promise<string> {
  assertSupportedChain(chainId);
  const { withdraw } = await import("privacycash-evm");
  const hash = await withdraw({
    withdrawAmountInput: amount,
    recipient,
    keyBasePath: circuitBasePath(),
    signature,
    address,
    token,
    network: chainId,
  });
  return typeof hash === "string" ? hash : String(hash);
}

export async function getEvmPrivateBalance({
  address,
  signature,
  token,
  chainId,
}: {
  address: string;
  signature: string;
  token: EvmPrivacyToken;
  chainId: number;
}): Promise<number> {
  assertSupportedChain(chainId);
  const { getBalance } = await import("privacycash-evm");
  const { balance } = await getBalance({
    signature,
    address,
    token,
    network: chainId,
  });
  const value = Number(balance);
  return Number.isFinite(value) ? value : 0;
}
