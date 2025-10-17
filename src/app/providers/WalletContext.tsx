"use client";
import "@solana/wallet-adapter-react-ui/styles.css";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

interface WalletContextType {
  publicKey: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useAppWallet = () => {
   
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useAppWallet must be used within WalletContextProvider");
  }
  return context;
};
export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const endpoint = "https://api.mainnet-beta.solana.com";
  const wallets = [new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextWrapper>{children}</WalletContextWrapper>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function WalletContextWrapper({ children }: { children: React.ReactNode }) {
      const [mounted, setMounted] = useState(false);
     useEffect(() => setMounted(true), []);
  const { publicKey, connected, connect, disconnect } = useWallet();
   const value: WalletContextType = {
    publicKey: publicKey ? publicKey.toBase58() : null,
    connected,
    connect,
    disconnect,
  };
   return (
    <WalletContext.Provider value={value}>
      <div className="flex justify-end p-4 bg-black">
        {mounted && <WalletMultiButton />}
      </div>
      {children}
    </WalletContext.Provider>
  );
}
