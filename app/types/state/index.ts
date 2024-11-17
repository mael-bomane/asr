
import { BN, IdlAccounts } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import type { IDL } from '@/constants';

export type Lock = IdlAccounts<IDL>["Lock"] & { account: PublicKey };
export type User = IdlAccounts<IDL>["User"] & { account: PublicKey };
export type Proposal = IdlAccounts<IDL>["Proposal"];
export type Analytics = IdlAccounts<IDL>["Analytics"] & { account: PublicKey };

export type TokenInfo = {
  mint: PublicKey,
  decimals: number
};

export type ProposalChoice = {
  id: number
  votingPower: BN
  title: string
};

