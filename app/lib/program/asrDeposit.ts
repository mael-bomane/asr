import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "@/constants";

export const asrDepositIx = async (
  program: Program<IDL>,
  creator: PublicKey,
  mint: PublicKey,
  symbol: string,
  signerAta: PublicKey,
  amount: BN,
) => {
  console.log("creator", creator.toString());
  console.log("mint", mint.toString());
  console.log("signerAta", signerAta.toString());
  console.log("amount", amount.toNumber());

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const auth = PublicKey.findProgramAddressSync(
    [Buffer.from("auth"), analytics.toBuffer()],
    program.programId
  )[0];

  const lock = PublicKey.findProgramAddressSync(
    // seeds = [b"lock", creator.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("lock"), creator.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  const vault = PublicKey.findProgramAddressSync(
    // seeds = [b"vault", lock.key().as_ref(), mint.key().as_ref()]
    [Buffer.from("vault"), lock.toBytes(), mint.toBytes()],
    program.programId
  )[0];

  return await program.methods.asrDeposit(amount, symbol)
    .accountsStrict({
      creator,
      signerAta,
      mint,
      lock,
      vault,
      auth,
      analytics,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    })
    .instruction()
}
