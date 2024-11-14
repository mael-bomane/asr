import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { program } from "@/constants/program";

export const asrClaimIx = async (
  owner: PublicKey,
  lock: PublicKey,
  mint: PublicKey,
  signerAta: PublicKey,
  amount: BN,
) => {
  console.log("owner", owner.toString());
  console.log("lock", lock.toString());
  console.log("mint", mint.toString());
  console.log("signerAta", signerAta.toString());
  console.log("amount", amount.toNumber());

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const auth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), analytics.toBuffer()],
    program.programId
  )[0];

  const vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", lock.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
    [Buffer.from("user"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  // @ts-ignore
  return await program.methods.asrClaim()
    .accountsStrict({
      owner,
      user,
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
