
import { Address, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { program } from "@/constants/program";



export const registerIx = async (
  owner: PublicKey,
  lock: PublicKey,
  mint: PublicKey,
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

  return await program.methods.register()
    .accountsStrict({
      owner,
      user,
      auth,
      lock,
      analytics,
      //@ts-ignore
      systemProgram: SystemProgram.programId,
    }).instruction()
}
