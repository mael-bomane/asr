import { PublicKey, SystemProgram } from "@solana/web3.js";

import { program } from "@/constants/program";

export const asrDepositIx = async (
  owner: PublicKey,
  lock: PublicKey,
  poll: PublicKey,
) => {
  console.log("owner : ", owner.toString());
  console.log("lock : ", lock.toString());
  console.log("proposal : ", poll.toString());

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  // @ts-ignore
  await program.methods.pollExecute()
    .accountsStrict({
      owner,
      lock,
      poll,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}

