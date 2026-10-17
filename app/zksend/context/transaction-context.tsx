"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { TransferChain } from "../lib/explorer";

export type TransactionType = "shield" | "send" | "unshield";
export type TransactionStatus = "pending" | "confirmed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  assetIn?: string;
  amountIn: number;
  recipient?: string;
  status: TransactionStatus;
  timestamp: number;
  txSignature?: string;
  error?: string;
  chain?: TransferChain;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearHistory: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "zksend_transactions";

function loadTransactionsFromStorage(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTransactionsToStorage(transactions: Transaction[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // Ignore storage errors
  }
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadTransactionsFromStorage(),
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "timestamp">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction: Transaction = {
        ...tx,
        id,
        timestamp: Date.now(),
      };
      setTransactions((prev) => {
        const updated = [newTransaction, ...prev];
        saveTransactionsToStorage(updated);
        return updated;
      });
      return id;
    },
    [],
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      setTransactions((prev) => {
        const updated = prev.map((tx) =>
          tx.id === id ? { ...tx, ...updates } : tx,
        );
        saveTransactionsToStorage(updated);
        return updated;
      });
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setTransactions([]);
    saveTransactionsToStorage([]);
  }, []);

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, updateTransaction, clearHistory }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider",
    );
  }
  return context;
}
