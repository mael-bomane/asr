
import { BN, IdlAccounts } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import type { IDL } from '@/constants';

export type Lock = IdlAccounts<IDL>["Lock"];
export type User = IdlAccounts<IDL>["User"];
export type Poll = IdlAccounts<IDL>["Poll"];
export type Analytics = IdlAccounts<IDL>["Analytics"];

export type TokenInfo = {
  mint: PublicKey,
  decimals: number
};

export type ProposalChoice = {
  id: number
  votingPower: BN
  title: string
};

