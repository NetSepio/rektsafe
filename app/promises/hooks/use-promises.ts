"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { Eip1193Provider } from "@/lib/promises/contract";
import {
  getPromisesForUser,
  createDatePromise,
  createApprovalPromise,
  approvePromise,
  claimPromise,
  type PromiseData,
} from "@/lib/promises/contract";

interface UsePromisesReturn {
  sent: PromiseData[];
  received: PromiseData[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDate: (recipient: string, amount: string, unlockTime: number) => Promise<string>;
  createApproval: (recipient: string, approver: string, amount: string) => Promise<string>;
  approve: (promiseId: number) => Promise<string>;
  claim: (promiseId: number) => Promise<string>;
}

export function usePromises(): UsePromisesReturn {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");

  const [sent, setSent] = useState<PromiseData[]>([]);
  const [received, setReceived] = useState<PromiseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromises = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const { sent: s, received: r } = await getPromisesForUser(address);
      setSent(s);
      setReceived(r);
    } catch (err: any) {
      console.error("Failed to fetch promises:", err);
      setError(err.message || "Failed to fetch promises");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPromises();
  }, [fetchPromises]);

  const createDate = useCallback(
    async (recipient: string, amount: string, unlockTime: number): Promise<string> => {
      if (!walletProvider) throw new Error("Wallet not connected");
      const hash = await createDatePromise(walletProvider, recipient, amount, unlockTime);
      await fetchPromises();
      return hash;
    },
    [walletProvider, fetchPromises]
  );

  const createApproval = useCallback(
    async (recipient: string, approver: string, amount: string): Promise<string> => {
      if (!walletProvider) throw new Error("Wallet not connected");
      const hash = await createApprovalPromise(walletProvider, recipient, approver, amount);
      await fetchPromises();
      return hash;
    },
    [walletProvider, fetchPromises]
  );

  const approve = useCallback(
    async (promiseId: number): Promise<string> => {
      if (!walletProvider) throw new Error("Wallet not connected");
      const hash = await approvePromise(walletProvider, promiseId);
      await fetchPromises();
      return hash;
    },
    [walletProvider, fetchPromises]
  );

  const claim = useCallback(
    async (promiseId: number): Promise<string> => {
      if (!walletProvider) throw new Error("Wallet not connected");
      const hash = await claimPromise(walletProvider, promiseId);
      await fetchPromises();
      return hash;
    },
    [walletProvider, fetchPromises]
  );

  return {
    sent,
    received,
    isLoading,
    error,
    refresh: fetchPromises,
    createDate,
    createApproval,
    approve,
    claim,
  };
}
