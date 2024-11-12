import type { PublicKey } from "@solana/web3.js"

import { IDL } from '@/constants'
import { IdlAccounts } from "@coral-xyz/anchor";

export type Lock = IdlAccounts<IDL>["Lock"];
export type User = IdlAccounts<IDL>["User"];
export type Poll = IdlAccounts<IDL>["Poll"];
export type Analytics = IdlAccounts<IDL>["Analytics"];

export type TokenInfo = {
  mint: PublicKey,
  decimals: number
}

