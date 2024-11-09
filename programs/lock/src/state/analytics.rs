use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Analytics {
    pub vault: Pubkey,
    pub lockers: u64,
    pub polls: u64,
    pub votes: u64,
    pub approved: u64,
    pub rejected: u64,
    pub points: u64,
    pub created_at: i64,
    pub auth_bump: u8,
    pub state_bump: u8,
}

impl Analytics {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH * 2 // token, vault
        + 8 * 5 // daos, polls, approved, rejected, points 
        + TIMESTAMP_LENGTH // created_at
        + BUMP_LENGTH * 2
        + VECTOR_LENGTH_PREFIX; // bump
}
