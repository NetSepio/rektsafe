"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { performReverseLookup } from "@bonfida/spl-name-service";

const SOLANA_RPC =
  process.env.NEXT_PUBLIC_HELIUS_RPC ||
  process.env.NEXT_PUBLIC_SOLANA_RPC ||
  "https://api.mainnet-beta.solana.com";

const connection = new Connection(SOLANA_RPC);

// SNS Program ID
const SNS_PROGRAM_ID = new PublicKey(
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",
);

export function useSnsName(walletAddress: string | undefined) {
  const [snsName, setSnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setSnsName(null);
      return;
    }

    const resolveSns = async () => {
      setIsLoading(true);

      try {
        const publicKey = new PublicKey(walletAddress);

        // Method 1: Try to find favorite domain first
        try {
          const favoriteDomain = await findFavoriteDomain(publicKey);
          if (favoriteDomain) {
            const name = await performReverseLookup(connection, favoriteDomain);
            if (name) {
              setSnsName(`${name}.sol`);
              return;
            }
          }
        } catch {
          // Favorite domain not set, continue to fallback
        }

        // Method 2: Get all domains and use the first one
        const allDomains = await getAllUserDomains(publicKey);
        if (allDomains.length > 0) {
          const name = await performReverseLookup(connection, allDomains[0]);
          if (name) {
            setSnsName(`${name}.sol`);
            return;
          }
        }

        setSnsName(null);
      } catch (err) {
        console.log("SNS lookup failed:", err);
        setSnsName(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolveSns();
  }, [walletAddress]);

  return { snsName, isLoading };
}

// Find the favorite/primary domain for a user
async function findFavoriteDomain(owner: PublicKey): Promise<PublicKey | null> {
  try {
    const [favoriteDomainKey] = PublicKey.findProgramAddressSync(
      [Buffer.from("favorite_domain"), owner.toBuffer()],
      SNS_PROGRAM_ID,
    );

    const accountInfo = await connection.getAccountInfo(favoriteDomainKey);
    if (accountInfo?.data && accountInfo.data.length >= 40) {
      // Parse the domain key from the account data (skip 8 byte discriminator)
      const domainKey = new PublicKey(accountInfo.data.slice(8, 40));
      return domainKey;
    }
    return null;
  } catch {
    return null;
  }
}

// Get all domains for a user
async function getAllUserDomains(owner: PublicKey): Promise<PublicKey[]> {
  try {
    const accounts = await connection.getProgramAccounts(SNS_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 32, // Owner field offset in NameRegistryState
            bytes: owner.toBase58(),
          },
        },
      ],
    });

    return accounts.map((acc) => acc.pubkey);
  } catch (error) {
    console.log("Error fetching user domains:", error);
    return [];
  }
}
