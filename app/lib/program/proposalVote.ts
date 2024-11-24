
import { IDL } from "@/constants";
import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const proposalVoteIx = async (
  program: Program<IDL>,
  owner: PublicKey,
  lock: PublicKey,
  proposal: PublicKey,
  index: BN,
  choice: number,
) => {
  console.log("owner : ", owner.toString());
  console.log("lock : ", lock.toString());
  console.log("index : ", index.toNumber());
  console.log("choice : ", choice);

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()]
    [Buffer.from("user"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  return await program.methods.voteNew(index, choice)
    .accountsStrict({
      owner,
      user,
      proposal,
      lock,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}

