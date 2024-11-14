use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Lock {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub decimals: u8,
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
    pub symbol: String,
    pub name: String,
    pub seasons: Vec<Season>,
}

impl Lock {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH * 2 // creator, mint 
        + 1 * 2 // config, decimals
        + 1 * 2 // threshold 51 => 100, quorum 0 => 100
        + 8 * 4 // approved, rejected, min 
        + TIMESTAMP_LENGTH * 5
        + BUMP_LENGTH * 2 // bumps
        + VECTOR_LENGTH_PREFIX 
        + STRING_LENGTH_PREFIX * 2
        + MAX_LOCKER_NAME_LENGTH;

    pub fn total_asr(&self) -> usize {
        self.seasons.iter().map(|season| season.asr.len()).sum()
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Season {
    pub season: u8,
    pub points: u64,
    pub asr: Vec<ASR>,
    pub season_end: i64, // 0 = asr, 1 = ve
}

impl Season {
    pub const LEN: usize = 1 + 8 + VECTOR_LENGTH_PREFIX + TIMESTAMP_LENGTH;
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct ASR {
    pub mint: Pubkey,
    pub decimals: u8,
    pub amount: u64,
}

impl ASR {
    pub const LEN: usize = PUBLIC_KEY_LENGTH + 1 + 8;
}
