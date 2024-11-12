import { IDL } from "@/constants/idl";
import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export const PROGRAM_ID = 'asrMFZq2j6bA1RADnGM58txGVtSzMcDxxSVr57mQhLZ'
export const MONOLITH_ID = 'ExNQ2Pq7QEcnouqWRd7dnfKDJ8sc8cwbWpa3H2Jigga8'

export const program = new Program<IDL>(IDL, {
  connection: new Connection(clusterApiUrl('devnet'))
});
