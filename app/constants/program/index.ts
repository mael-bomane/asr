import { IDL } from "@/constants/idl";
import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export const PROGRAM_ID = '1ckXSJ2TDNizSpBWftmgCtxCZ22crs2ELsrdgeeAfi8'
export const MONOLITH_ID = 'HicMzdpMJxiHi7RbA9SNAhcvv46MMpNQR4iq13FihMXr'
export const UNSTAKING_TIME = 86400 * 3;

export const program = new Program<IDL>(IDL, {
  connection: new Connection(clusterApiUrl('devnet'))
});
