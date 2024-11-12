import { Address, BN, IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL } from "@/constants/idl";
import { PROGRAM_ID } from "@/constants/program";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const program = new Program<IDL>(IDL, {
  connection: new Connection(clusterApiUrl('devnet'))
});

export type Lock = IdlAccounts<IDL>["Lock"];

export const LockNew = async (
  signer: PublicKey,
  mint: PublicKey,
  signerAta: Address,
  config: number,
  votingPeriod: BN,
  lockDuration: BN,
  threshold: number,
  quorum: number,
  min: BN,
  name: string
) => {

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const auth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), analytics.toBuffer()],
    program.programId
  )[0];

  const lock = PublicKey.findProgramAddressSync(
    // seeds = [b"locker", creator.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("lock"), signer.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  const vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", lock.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  //  config: u8,
  //  voting_period: i64,
  //  lock_duration: i64,
  //  threshold: u8,
  //  quorum: u8,
  //  min: u64,
  //  name: String,
  //@ts-ignore
  return program.methods.lockNew(config, votingPeriod, lockDuration, threshold, quorum, min, name)
    .accountsStrict({
      signer,
      auth,
      lock,
      //@ts-ignore
      signerAta,
      vault,
      mint,
      analytics,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }).instruction()
}
