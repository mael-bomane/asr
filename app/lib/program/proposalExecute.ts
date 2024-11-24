import { IDL } from "@/constants";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const proposalExecuteIx = async (
  program: Program<IDL>,
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

  return await program.methods.proposalExecute()
    .accountsStrict({
      owner,
      lock,
      proposal,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}

