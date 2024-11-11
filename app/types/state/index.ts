import type { PublicKey } from "@solana/web3.js"
import type BN from "bn.js"

export type Analytics = {
  //  pub vault: Pubkey,
  //  pub daos: u64,
  //  pub polls: u64,
  //  pub approved: u64,
  //  pub rejected: u64,
  //  pub points: u64,
  //  pub created_at: i64,
  //  pub auth_bump: u8,
  //  pub state_bump: u8,  
  vault: PublicKey
  monoliths: PublicKey
  polls: PublicKey
  approved: BN
  rejected: BN
  points: BN
  created_at: number
  auth_bump: number
  state_bump: number
}

export type Monolith = {
  // pub creator: Pubkey,
  // pub mint: Pubkey,
  // pub time: i64,
  // pub threshold: u8,
  // pub min_poll_tokens: u64,
  // pub approved: u64,
  // pub rejected: u64,
  // pub created_at: i64,
  // pub dao_bump: u8,
  // pub vault_bump: u8,
  // pub name: String,
  // pub polls: Vec<Poll>,
  // pub users: Vec<User>,
  summoner: PublicKey
  mint: PublicKey
  time: number
  threashold: number
  minPollTokens: number
  approved: BN
  rejected: BN
  createdAt: number
  monolithBump: number
  vaultBump: number
  name: string
  polls: Poll[]
  users: User[]
}

export type Poll = {
  // pub creator: Pubkey,
  // pub created_at: i64,
  // pub executed: bool,
  // pub status: Status,
  // pub title: String,
  // pub content: String,
  // pub votes: Vec<Vote>,
  creator: PublicKey
  createdAt: number
  executed: boolean
  status: number
  title: string
  content: string
  votes: Vote[]
}

export type Vote = {
  // pub user: Pubkey,
  // pub voting_power: u64,
  // pub choice: Choice,
  // pub created_at: i64,
  user: PublicKey
  votingPower: number
  choice: boolean
  createdAt: number
}

export type User = {
  // pub user: Pubkey,
  // pub voting_power: u64,
  // pub points: u64,
  // pub created_at: i64,
  // pub deposits: Vec<Deposit>,
  user: PublicKey
  votingPower: number
  points: BN
  createdAt: number
  deposits: Deposit[]
}

export type Deposit = {
  // pub user: Pubkey,
  // pub mint: Pubkey,
  // pub amount: u64,
  // pub deactivating: bool,
  // pub deactivation_start: Option<i64>,
  // pub created_at: i64,
  user: PublicKey
  votingPower: number
  points: BN
  createdAt: number
  deposits: Deposit[]
}
