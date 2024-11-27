import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "@/constants";

export const lockNewIx = async (
  program: Program<IDL>,
  signer: PublicKey,
  mint: PublicKey,
  signerAta: PublicKey,
  config: number,
  permissionless: boolean,
  seasonDuration: BN,
  votingPeriod: BN,
  lockDuration: BN,
  threshold: number,
  quorum: number,
  amount: BN,
  name: string,
  symbol: string
) => {
  console.log("signer", signer.toString());
  console.log("mint", mint.toString());
  console.log("signerAta", signerAta.toString());
  console.log("config", config);
  console.log("permissionless", permissionless);
  console.log("votingPeriod", votingPeriod.toNumber());
  console.log("lockDuration", lockDuration.toNumber());
  console.log("threshold", threshold);
  console.log("quorum", quorum);
  console.log("amount", amount.toNumber());
  console.log("name", name);
  console.log("symbol", symbol);

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
  return await program.methods.lockNew(config, permissionless, seasonDuration, votingPeriod, lockDuration, threshold, quorum, amount, name, symbol)
    .accountsStrict({
      signer,
      auth,
      lock,
      signerAta,
      vault,
      mint,
      analytics,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }).instruction()
}
