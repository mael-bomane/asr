use anchor_lang::prelude::*;

use crate::constants::*;

use crate::state::Lock;

#[account]
pub struct User {
    pub owner: Pubkey,
    pub lock: Pubkey,
    pub points: u64,
    pub created_at: i64,
    pub bump: u8,
    pub deposits: Vec<Deposit>,
    pub votes: Vec<Vote>,
    pub claims: Vec<Claim>,
}

impl User {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH * 2
        + 8
        + TIMESTAMP_LENGTH
        + BUMP_LENGTH
        + VECTOR_LENGTH_PREFIX * 3;

    pub fn total_user_deposit_amount(&self) -> u64 {
        self.deposits
            .iter()
            .map(|deposit| {
                if !deposit.deactivating {
                    deposit.amount
                } else {
                    0u64
                }
            })
            .sum()
    }

    pub fn user_season_points(&self, season: u8) -> u64 {
        self.votes
            .iter()
            .map(|vote| {
                if vote.season == season {
                    match vote.proposal_type {
                        0..=2 => vote.voting_power,
                        _ => 0u64
                    }
                } else {
                    0u64
                }
            })
            .sum()
    }

    pub fn voting_power(&self, lock: &Lock) -> u64 {
        let now = Clock::get().unwrap().unix_timestamp;
        // active staking rewards (asr) math
        if lock.config.config == 0 {
            self.deposits
                .iter()
                .map(|deposit| {
                    if !deposit.deactivating {
                        deposit.amount
                    } else {
                        let now = Clock::get().unwrap().unix_timestamp;
                        if now >= (deposit.deactivation_start.unwrap() + lock.config.lock_duration) {
                            0u64
                        } else {
                            let time_passed = now - deposit.deactivation_start.unwrap();
                            let decay_factor = time_passed as f64 / lock.config.lock_duration as f64;
                            let decayed_voting_power = (deposit.amount as f64 * (1.0 - decay_factor)).round() as u64;
                            decayed_voting_power
                        }
                    }
                })
                .sum()
        // voting escrow (ve) math
        } else if lock.config.config == 1 {
            self.deposits
                .iter()
                .map(|deposit| {
                    if !deposit.deactivating {
                        let time_left = deposit.expires_at - now;
                        let total_time = deposit.expires_at - deposit.created_at;
                        let voting_power = deposit.amount.checked_mul(time_left as u64).unwrap().div_ceil(total_time as u64);
                        voting_power
                    } else {
                        0u64
                    }
                })
                .sum()
        // unimplemented
        } else {
            0u64
        }
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Deposit {
    pub amount: u64,
    pub created_at: i64,
    pub expires_at: i64,
    pub deactivating: bool,
    pub deactivation_start: Option<i64>,
}

impl Deposit {
    pub const LEN: usize = 8 // amount
        + BOOL_LENGTH // bool
        + 1 // option
        + TIMESTAMP_LENGTH * 3;
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Vote {
    pub season: u8,
    pub proposal: u64,
    pub proposal_type: u8,
    pub voting_power: u64,
    pub choice: u8,
    pub created_at: i64,
}

impl Vote {
    pub const LEN: usize = 1 * 3 // season, choice
        + 8 * 2 // poll, voting_power 
        + TIMESTAMP_LENGTH;
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Claim {
    pub season: u8,
    pub mint: Pubkey,
    pub amount: u64,
    pub created_at: i64,
}

impl Claim {
    pub const LEN: usize = 1 // season
        + PUBLIC_KEY_LENGTH
        + 8 
        + TIMESTAMP_LENGTH;
}
