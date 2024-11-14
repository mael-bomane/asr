
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { program } from "@/constants/program";

export const asrDepositIx = async (
  owner: PublicKey,
  lock: PublicKey,
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
    [Buffer.from("lock"), lock.toBytes(), owner.toBytes()],
    program.programId
  )[0];

  const poll = PublicKey.findProgramAddressSync(
    //seeds = [b"poll", lock.key().as_ref(), poll.id.to_le_bytes().as_ref()],
    [Buffer.from("poll"), lock.toBytes(), index.toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];

  // @ts-ignore
  return await program.methods.voteNew(index, choice)
    .accountsStrict({
      owner,
      user,
      poll,
      lock,
      analytics,
      systemProgram: SystemProgram.programId,
    }).instruction()
}

