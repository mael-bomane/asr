use {
    crate::{constants::*, state::Lock},
    anchor_lang::prelude::*,
};

#[account]
pub struct Proposal {
    pub id: u64,
    pub lock: Pubkey,
    pub summoner: Pubkey,
    pub season: u8,
    pub created_at: i64,
    pub ends_at: i64,
    pub executed: bool,
    pub bump: u8,
    pub status: Status,
    pub result: Option<Choice>,
    pub title: String,
    pub content: String,
    pub choices: Vec<Choice>,
}

impl Proposal {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + 8
        + PUBLIC_KEY_LENGTH * 2
        + 1
        + TIMESTAMP_LENGTH * 2
        + BOOL_LENGTH
        + BUMP_LENGTH
        + 1
        + 1
        + Choice::LEN
        + STRING_LENGTH_PREFIX * 2
        + MAX_TITLE_LENGTH
        + MAX_CONTENT_LENGTH
        + VECTOR_LENGTH_PREFIX;

    pub fn result(&self, lock: &Lock) -> (Option<Choice>, bool, u64) {
        let mut highest = 0u64;
        let mut total_power = 0u64;

        for choice in &self.choices {
            if choice.voting_power > highest {
                highest = choice.voting_power;
            }
            total_power += choice.voting_power
        }

        let quorum = lock.quorum as u64;
        // ensure we pass the quorum
        let min = quorum
            .checked_mul(lock.total_deposits)
            .unwrap()
            .div_ceil(100);
        // let min = lock.quorum.checked_mul(lock.total_deposits).unwrap().div_ceil(100);

        // get result choice with the most voting power
        let result = self
            .choices
            .iter()
            .find(|r| r.voting_power == highest)
            .unwrap()
            .clone();

        // quorum pass
        if total_power >= min {
            (Some(result), true, total_power)
        // quorum doesn't pass
        } else {
            (None, false, total_power)
        }
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum Status {
    Approved,
    Rejected,
    Voting,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Choice {
    pub id: u8,
    pub voting_power: u64,
    pub title: String,
}

impl Choice {
    pub const LEN: usize = 1 + 8 + MAX_TITLE_LENGTH;
}
