import { IDL } from "@/constants/idl";
import idl from "@/constants/idl/lock.json";
import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export const PROGRAM_ID = 'ASRB7cGR7e3RQEWPg3PqgCBTFgCmZvjmXsgfzsxo4zTr'
export const MONOLITH_ID = 'ASUsodUSAzzwNvCtRquTtS3ZAVU8NUaxUhEYRWNPjH27'
export const UNSTAKING_TIME = 86400 * 3;

export const program = new Program(idl as IDL, {
  connection: new Connection(clusterApiUrl('devnet'))
});
