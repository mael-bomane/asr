
import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ProposalChoice } from "@/types";
import type { IDL } from "@/constants";

export const proposalNewIx = async (
  program: Program<IDL>,
  owner: PublicKey,
  lock: PublicKey,
  title: string,
  content: string,
  choices: ProposalChoice[],
  id: BN
) => {
  console.log("owner : ", owner.toString());
  console.log("lock : ", lock.toString());
  console.log("title : ", title);
  console.log("choices : ", choices);

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
    [Buffer.from("user"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  const proposal = PublicKey.findProgramAddressSync(
    // seeds = [b"proposal", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), id.toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  return await program.methods.proposalNew(title, content, choices)
    .accountsStrict({
      owner,
      proposal,
      lock,
      user,
      analytics,
      systemProgram: SystemProgram.programId,
    })
    .instruction()
}
