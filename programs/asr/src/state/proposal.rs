use {
    crate::{
        constants::*,
        state::{Config, Lock},
    },
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
    pub proposal_type: u8, // 0 = lock settings, 2 = standard
    pub status: Status,
    pub result: Option<Choice>,
    pub config: Option<Config>,
    pub manager: Option<Pubkey>,
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
        + 1
        + Config::LEN
        + 1
        + PUBLIC_KEY_LENGTH
        + STRING_LENGTH_PREFIX * 2
        + MAX_TITLE_LENGTH
        + MAX_CONTENT_LENGTH
        + VECTOR_LENGTH_PREFIX;

    pub fn result(&self, lock: &Lock) -> (Option<Choice>, bool, Status) {
        let mut highest = 0u64;
        let total_power: u64 = self.choices.clone().iter().map(|c| c.voting_power).sum();

        for choice in &self.choices {
            if choice.voting_power > highest {
                highest = choice.voting_power;
            }
        }

        let quorum = lock.config.quorum as u64;

        let min = if self.proposal_type >= 0 && self.proposal_type <= 2 {
            quorum
                .checked_mul(lock.total_deposits)
                .unwrap()
                .div_ceil(100)
        } else {
            quorum
                .checked_mul(lock.total_deposits)
                .unwrap()
                .div_ceil(100)
        };

        // Find all choices with the highest voting power
        let highest_voting_choices: Vec<&Choice> = self
            .choices
            .iter()
            .filter(|r| r.voting_power == highest)
            .collect();

        // Get result choice with the most voting power
        let result = highest_voting_choices[0].clone();

        // Check if quorum is met
        if total_power >= min {
            // If there is more than one choice with the highest voting power, it's a tie
            if highest_voting_choices.len() > 1 {
                (None, true, Status::Tie)
            } else {
                (Some(result), true, Status::Approved)
            }
        } else {
            (None, false, Status::Rejected)
        }
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum Status {
    Approved,
    Rejected,
    Tie,
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
