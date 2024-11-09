use {
    anchor_lang::prelude::*,
    crate::{ constants::*, state::Lock }
};

#[account]
pub struct Poll {
    pub id: u64,
    pub summoner: Pubkey,
    pub created_at: i64,
    pub executed: bool,
    pub bump: u8,
    pub status: Status,
    pub result: Option<Choice>,
    pub title: String,
    pub choices: Vec<Choice>,
}

impl Poll {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + 8
        + PUBLIC_KEY_LENGTH // creator 
        + TIMESTAMP_LENGTH 
        + BOOL_LENGTH 
        + BUMP_LENGTH
        + 1
        + 1
        + Choice::LEN
        + STRING_LENGTH_PREFIX
        + MAX_TITLE_LENGTH
        + VECTOR_LENGTH_PREFIX;

    pub fn result(&self, lock: &Lock) -> (Option<Choice>, bool) {
        let mut highest = 0f64;
        let mut total_power = 0f64;

        for choice in &self.choices {
            if choice.voting_power > highest {
               highest = choice.voting_power;
            }
            total_power += choice.voting_power
        }

        // ensure we pass the quorum
        let min = lock.quorum as f64 * lock.total_deposits as f64 / 100.0;

        // get result choice with the most voting power
        let result = self.choices.iter().find(|r| r.voting_power == highest).unwrap().clone();

        // quorum pass
        if total_power >= min {
            (Some(result), true)
        // quorum doesn't pass
        } else {
            (None, false)
        }
    }
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub enum Status {
    Approved,
    Rejected,
    Voting
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, PartialEq)]
pub struct Choice {
    pub id: u8,
    pub voting_power: f64,
    pub title: String,
}

impl Choice {
    pub const LEN: usize = 1 
        + 8 
        + MAX_TITLE_LENGTH;
}

