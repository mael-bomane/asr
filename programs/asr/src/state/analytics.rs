use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Analytics {
    pub vault: Pubkey,
    pub locks: u64,
    pub users: u64,
    pub proposals: u64,
    pub votes: u64,
    pub approved: u64,
    pub rejected: u64,
    pub points: u64,
    pub created_at: i64,
    pub auth_bump: u8,
    pub state_bump: u8,
}

impl Analytics {
    pub const LEN: usize =
        DISCRIMINATOR_LENGTH + PUBLIC_KEY_LENGTH + 8 * 7 + TIMESTAMP_LENGTH + BUMP_LENGTH * 2;
}
