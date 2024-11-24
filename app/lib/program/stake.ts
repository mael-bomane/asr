import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "@/constants";

export const stakeIx = async (
  program: Program<IDL>,
  amount: number,
  decimals: number,
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

  const vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", lock.key().as_ref(), owner.key().as_ref()],
    [Buffer.from("vault"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
    [Buffer.from("user"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  return await program.methods.stakeNew(new BN(amount * 1 * 10 ** decimals))
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
