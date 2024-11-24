import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { IDL } from "@/constants";

export const stakeDeactivateIx = async (
  program: Program<IDL>,
  owner: PublicKey,
  lock: PublicKey,
) => {

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
    [Buffer.from("user"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  return await program.methods.stakeDeactivate()
    .accountsStrict({
      owner,
      user,
      lock,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}
