use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Lock {
    pub creator: Pubkey,
    pub config: Config,
    pub total_deposits: u64,
    pub users: u64,
    pub proposals: u64,
    pub votes: u64,
    pub approved: u64,
    pub rejected: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub lock_bump: u8,
    pub vault_bump: u8,
    pub seasons: Vec<Season>,
}

impl Lock {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // creator 
        + Config::LEN
        + 8 * 6 // amount, approved, rejected, min 
        + TIMESTAMP_LENGTH * 2
        + BUMP_LENGTH * 2 // bumps
        + VECTOR_LENGTH_PREFIX;

    pub fn total_asr(&self) -> usize {
        self.seasons.iter().map(|season| season.asr.len()).sum()
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Config {
    pub mint: Pubkey,
    pub permissionless: bool,
    pub decimals: u8,
    pub config: u8, // 0 = asr, 1 = ve
    pub season_duration: i64,
    pub voting_period: i64,
    pub lock_duration: i64, // only for ve
    pub threshold: u8,      // 51% to 100%
    pub quorum: u8,         // 0% to 100%
    pub amount: u64,
    pub symbol: String,
    pub name: String,
    pub managers: Vec<Pubkey>,
}

impl Config {
    pub const LEN: usize = PUBLIC_KEY_LENGTH
        + BOOL_LENGTH
        + 1 * 2
        + TIMESTAMP_LENGTH * 2
        + 1 * 2
        + 8
        + STRING_LENGTH_PREFIX * 2
        + VECTOR_LENGTH_PREFIX
        + MAX_SYMBOL_LENGTH
        + MAX_LOCKER_NAME_LENGTH;
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Season {
    pub season: u8,
    pub points: u64,
    pub season_start: i64,
    pub season_end: i64,
    pub asr: Vec<ASR>,
}

impl Season {
    pub const LEN: usize = 1 + 8 + VECTOR_LENGTH_PREFIX + TIMESTAMP_LENGTH * 2;
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct ASR {
    pub mint: Pubkey,
    pub decimals: u8,
    pub symbol: String,
    pub amount: u64,
}

impl ASR {
    pub const LEN: usize = PUBLIC_KEY_LENGTH + 1 + STRING_LENGTH_PREFIX + 8 + MAX_SYMBOL_LENGTH;
}
