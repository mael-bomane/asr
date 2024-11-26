
import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { IDL } from "@/constants";

export type ProposalCore = {
  program: Program<IDL>,
  signer: PublicKey,
  lock: PublicKey,
  id: BN
  config: number
  permissionless?: boolean
  seasonDuration?: BN
  votingPeriod?: BN
  lockDuration?: BN
  threshold?: number
  quorum?: number
  amount?: BN
  name?: string
  symbol?: string
}

export const proposalCoreIx = async (
  props: ProposalCore
) => {
  const { signer, lock, program, id } = props;
  console.log("signer : ", signer.toString());
  console.log("lock : ", lock.toString());

  const analytics = PublicKey.findProgramAddressSync(
    [Buffer.from("analytics")],
    program.programId
  )[0];

  const user = PublicKey.findProgramAddressSync(
    // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
    [Buffer.from("user"), lock.toBytes(), signer.toBytes()],
    program.programId
  )[0];

  const proposal = PublicKey.findProgramAddressSync(
    // seeds = [b"proposal", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
    [Buffer.from("proposal"), lock.toBytes(), id.toArrayLike(Buffer, 'le', 8)],
    program.programId
  )[0];


  type ProposalCore = {
    config: number
    permissionless?: boolean
    seasonDuration?: BN
    votingPeriod?: BN
    lockDuration?: BN
    threshold?: number
    quorum?: number
    amount?: BN
    name?: string
    symbol?: string
  }
  return await program.methods.proposalCore(
    props.config,
    props.permissionless ?? null, // permissionless
    props.seasonDuration ?? null, // season_duration
    props.votingPeriod ?? null, // voting_period
    props.lockDuration ?? null, // lock_duration
    props.threshold ?? null, // threshold
    props.quorum ?? null, // quorum
    props.amount ?? null, // amount
    props.name ?? null, // name
    props.symbol ?? null, // symbol
  )
    .accountsStrict({
      signer,
      proposal,
      lock,
      user,
      analytics,
      systemProgram: SystemProgram.programId,
    })
    .instruction()
}
