import { PublicKey, SystemProgram } from "@solana/web3.js";

import { program } from "@/constants/program";

export const stakeDeactivateIx = async (
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

  //@ts-ignore
  return await program.methods.stakeDeactivate()
    .accountsStrict({
      owner,
      user,
      lock,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}