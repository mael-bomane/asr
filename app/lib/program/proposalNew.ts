
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import { program } from "@/constants/program";
import { ProposalChoice } from "@/types";

export const proposalNewIx = async (
  owner: PublicKey,
  lock: PublicKey,
  title: string,
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

  const poll = PublicKey.findProgramAddressSync(
    // seeds = [b"poll", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("poll"), lock.toBytes(), id.toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];


  // @ts-ignore
  return await program.methods.pollNew(amount)
    .accountsStrict({
      owner,
      poll,
      lock,
      user,
      analytics,
      systemProgram: SystemProgram.programId,
    })
    .instruction()
}
