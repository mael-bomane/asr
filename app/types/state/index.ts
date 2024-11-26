
import type { BN, IdlAccounts } from "@coral-xyz/anchor";
import type { IDL } from '@/constants';
import type { PublicKey } from "@solana/web3.js";

export type LockMap = { account: Lock } & { publicKey: PublicKey };
export type Lock = IdlAccounts<IDL>["lock"];
export type UserMap = { account: User } & { publicKey: PublicKey };
export type User = IdlAccounts<IDL>["user"];
export type Proposal = IdlAccounts<IDL>["proposal"];
export type ProposalMap = { account: Proposal } & { publicKey: PublicKey };
export type Analytics = IdlAccounts<IDL>["analytics"]

export type ProposalChoice = {
  id: number
  votingPower: BN
  title: string
};

