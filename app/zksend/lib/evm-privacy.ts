"use client";

import { BrowserProvider } from "ethers";
import type { Eip1193Provider } from "@/lib/eip1193";
import { getPublicBasePath } from "@/lib/browser-polyfills/hasher-wasm-init";

// Must match the Privacy Cash EVM SDK exactly. A different message derives a
// different key and makes shielded funds undecryptable.
export const EVM_SIGN_MESSAGE = "Privacy Money account sign in";

export const ETH_USDT_ADDRESS =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// Left untouched when the user presses MAX on an ETH shield, so the deposit
// transaction still has gas.
export const ETH_GAS_RESERVE = 0.005;

export type EvmPrivacyToken = "eth" | "usdt";

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

export async function depositEthereum({
  amount,
  token,
  address,
  signature,
  walletProvider,
}: {
  amount: number;
  token: EvmPrivacyToken;
  address: string;
  signature: string;
  walletProvider: Eip1193Provider;
}): Promise<string> {
  const { deposit, ETH_NETWORK } = await import("privacycash-evm");
  const hash = await deposit({
    depositAmountInput: amount,
    keyBasePath: circuitBasePath(),
    signature,
    address,
    token,
    network: ETH_NETWORK,
    txSender: (unsignedTx: Record<string, unknown>) =>
      sendUnsignedTx(walletProvider, unsignedTx),
  });
  return typeof hash === "string" ? hash : String(hash);
}

export async function withdrawEthereum({
  amount,
  token,
  recipient,
  address,
  signature,
}: {
  amount: number;
  token: EvmPrivacyToken;
  recipient: string;
  address: string;
  signature: string;
}): Promise<string> {
  const { withdraw, ETH_NETWORK } = await import("privacycash-evm");
  const hash = await withdraw({
    withdrawAmountInput: amount,
    recipient,
    keyBasePath: circuitBasePath(),
    signature,
    address,
    token,
    network: ETH_NETWORK,
  });
  return typeof hash === "string" ? hash : String(hash);
}

export async function getEthereumPrivateBalance({
  address,
  signature,
  token,
}: {
  address: string;
  signature: string;
  token: EvmPrivacyToken;
}): Promise<number> {
  const { getBalance, ETH_NETWORK } = await import("privacycash-evm");
  const { balance } = await getBalance({
    signature,
    address,
    token,
    network: ETH_NETWORK,
  });
  const value = Number(balance);
  return Number.isFinite(value) ? value : 0;
}
