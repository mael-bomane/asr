import { PublicKey, SystemProgram } from "@solana/web3.js";

import { program } from "@/constants/program";

export const proposalExecuteIx = async (
  owner: PublicKey,
  lock: PublicKey,
  proposal: PublicKey,
) => {
  console.log("owner : ", owner.toString());
  console.log("lock : ", lock.toString());
  console.log("proposal : ", proposal.toString());

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  // @ts-ignore
  return await program.methods.proposalExecute()
    .accountsStrict({
      owner,
      lock,
      proposal,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}

