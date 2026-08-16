import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  parseEther,
  formatEther,
  type InterfaceAbi,
  type Contract as EthersContract,
} from "ethers";

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

export const REKTPROMISE_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_REKTPROMISE_CONTRACT_ADDRESS || "";

export const MONAD_RPC_URL =
  process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";

export type ConditionType = "date" | "approval";

export interface PromiseData {
  id: number;
  sender: string;
  recipient: string;
  approver: string;
  amount: bigint;
  amountFormatted: string;
  unlockTime: number;
  conditionType: ConditionType;
  approved: boolean;
  claimed: boolean;
}

const REKTPROMISE_ABI: InterfaceAbi = [
  "function createDatePromise(address recipient, uint256 unlockTime) payable",
  "function createApprovalPromise(address recipient, address approver) payable",
  "function approvePromise(uint256 promiseId)",
  "function claimPromise(uint256 promiseId)",
  "function getPromise(uint256 promiseId) view returns (address sender, address recipient, address approver, uint256 amount, uint256 unlockTime, uint8 conditionType, bool approved, bool claimed)",
  "function getPromiseCount() view returns (uint256)",
  "event PromiseCreated(uint256 indexed promiseId, address indexed sender, address indexed recipient, uint256 amount, uint8 conditionType)",
  "event PromiseApproved(uint256 indexed promiseId, address indexed approver)",
  "event PromiseClaimed(uint256 indexed promiseId, address indexed recipient, uint256 amount)",
];

export function parseConditionType(value: number): ConditionType {
  return value === 0 ? "date" : "approval";
}

export function formatPromise(
  id: number,
  data: [string, string, string, bigint, bigint, number, boolean, boolean]
): PromiseData {
  const [sender, recipient, approver, amount, unlockTime, conditionType, approved, claimed] = data;

  return {
    id,
    sender,
    recipient,
    approver,
    amount,
    amountFormatted: formatEther(amount),
    unlockTime: Number(unlockTime),
    conditionType: parseConditionType(conditionType),
    approved,
    claimed,
  };
}

export function getReadContract(): EthersContract {
  if (!REKTPROMISE_CONTRACT_ADDRESS) {
    throw new Error("RektPromise contract address is not configured");
  }
  const provider = new JsonRpcProvider(MONAD_RPC_URL);
  return new Contract(REKTPROMISE_CONTRACT_ADDRESS, REKTPROMISE_ABI, provider);
}

export async function getWriteContract(
  walletProvider: Eip1193Provider
): Promise<EthersContract> {
  if (!REKTPROMISE_CONTRACT_ADDRESS) {
    throw new Error("RektPromise contract address is not configured");
  }
  const provider = new BrowserProvider(walletProvider as any);
  const signer = await provider.getSigner();
  return new Contract(REKTPROMISE_CONTRACT_ADDRESS, REKTPROMISE_ABI, signer);
}

export async function createDatePromise(
  walletProvider: Eip1193Provider,
  recipient: string,
  amount: string,
  unlockTime: number
): Promise<`0x${string}`> {
  const contract = await getWriteContract(walletProvider);
  const tx = await contract.createDatePromise(recipient, BigInt(unlockTime), {
    value: parseEther(amount),
  });
  await tx.wait();
  return tx.hash as `0x${string}`;
}

export async function createApprovalPromise(
  walletProvider: Eip1193Provider,
  recipient: string,
  approver: string,
  amount: string
): Promise<`0x${string}`> {
  const contract = await getWriteContract(walletProvider);
  const tx = await contract.createApprovalPromise(recipient, approver, {
    value: parseEther(amount),
  });
  await tx.wait();
  return tx.hash as `0x${string}`;
}

export async function approvePromise(
  walletProvider: Eip1193Provider,
  promiseId: number
): Promise<`0x${string}`> {
  const contract = await getWriteContract(walletProvider);
  const tx = await contract.approvePromise(promiseId);
  await tx.wait();
  return tx.hash as `0x${string}`;
}

export async function claimPromise(
  walletProvider: Eip1193Provider,
  promiseId: number
): Promise<`0x${string}`> {
  const contract = await getWriteContract(walletProvider);
  const tx = await contract.claimPromise(promiseId);
  await tx.wait();
  return tx.hash as `0x${string}`;
}

export async function getPromise(id: number): Promise<PromiseData> {
  const contract = getReadContract();
  const data = await contract.getPromise(id);
  return formatPromise(id, data);
}

export async function getPromiseCount(): Promise<number> {
  const contract = getReadContract();
  const count = await contract.getPromiseCount();
  return Number(count);
}

export async function getAllPromises(): Promise<PromiseData[]> {
  const count = await getPromiseCount();
  return Promise.all(Array.from({ length: count }, (_, i) => getPromise(i)));
}

export async function getPromisesForUser(
  address: string
): Promise<{ sent: PromiseData[]; received: PromiseData[] }> {
  const all = await getAllPromises();
  const normalized = address.toLowerCase();

  return {
    sent: all.filter((p) => p.sender.toLowerCase() === normalized),
    received: all.filter((p) => p.recipient.toLowerCase() === normalized),
  };
}
