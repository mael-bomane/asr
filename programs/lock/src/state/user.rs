use anchor_lang::prelude::*;

use crate::constants::*;

use crate::state::Lock;

#[account]
pub struct User {
    pub owner: Pubkey,
    pub points: f64,
    pub created_at: i64,
    pub bump: u8,
    pub deposits: Vec<Deposit>,
    pub votes: Vec<Vote>,
}

impl User {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH * 2
        + 8
        + TIMESTAMP_LENGTH
        + BUMP_LENGTH
        + VECTOR_LENGTH_PREFIX * 2;

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

    pub fn voting_power(&self, lock: &Lock) -> f64 {
        // active staking rewards (asr) math
        if lock.config == 0 {
            self.deposits
                .iter()
                .map(|deposit| {
                    if !deposit.deactivating {
                        deposit.amount as f64
                    } else {
                        // y = 100%
                        // x = x*100/y
                        deposit.amount as f64 * 100.0 / deposit.expires_at as f64
                    }
                })
                .sum()
        // voting escrow (ve) math
        } else if lock.config == 1 {
            self.deposits
                .iter()
                .map(|deposit| {
                    if !deposit.deactivating {
                        // y = 100%
                        // x = z
                        // z = x*100/y
                        deposit.amount as f64 * 100.0 / deposit.expires_at as f64
                    } else {
                        0f64
                    }
                })
                .sum()
        // unimplemented
        } else {
            0f64
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
    pub poll: u64,
    pub voting_power: f64,
    pub choice: u8,
    pub created_at: i64,
}

impl Vote {
    pub const LEN: usize = 8 * 2 // poll, voting_power 
        + 1 // enum
        + TIMESTAMP_LENGTH;
}