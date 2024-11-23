import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { program } from "@/constants/program";

export const unstakeIx = async (
  owner: PublicKey,
  lock: PublicKey,
  mint: PublicKey,
  signerAta: PublicKey,
) => {

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const auth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), analytics.toBuffer()],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
    [Buffer.from("user"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  const vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", creator.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  return await program.methods.stakeClaim()
    .accountsStrict({
      owner,
      auth,
      lock,
      user,
      signerAta,
      mint,
      vault,
      analytics,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }).instruction()
}
