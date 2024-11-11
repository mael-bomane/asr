import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL } from "@/constants/idl";
import { PROGRAM_ID } from "@/constants/program";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const programId = new PublicKey(PROGRAM_ID);
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const program = new Program<IDL>(IDL);

export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  program.programId,
);

// This is just a TypeScript type for the Counter data structure based on the IDL
// We need this so TypeScript doesn't yell at us
export type Monolith = IdlAccounts<IDL>["Monolith"];
