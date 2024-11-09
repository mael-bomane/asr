use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Lock {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub config: u8, // 0 = asr, 1 = ve
    pub voting_period: i64,
    pub lock_duration: i64, // only for ve
    pub threshold: u8,      // 51% to 100%
    pub quorum: u8,         // 0% to 100%
    pub min: u64,
    pub total_deposits: u64,
    pub polls: u64,
    pub votes: u64,
    pub approved: u64,
    pub rejected: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub lock_bump: u8,
    pub vault_bump: u8,
    pub name: String,
}

impl Lock {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH * 2 // creator, mint 
        + 1
        + 1 * 2 // threshold 51 => 100
        + 8 * 4 // approved, rejected, min 
        + TIMESTAMP_LENGTH * 4
        + BUMP_LENGTH * 2 // bumps
        + VECTOR_LENGTH_PREFIX * 2
        + STRING_LENGTH_PREFIX
        + MAX_LOCKER_NAME_LENGTH;
}
