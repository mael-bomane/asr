use crate::{constants::*, errors::ErrorCode, state::Analytics, Choice, Lock, Poll, Status, User};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(title: String, choices: Vec<Choice>)]
pub struct PollNew<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.as_ref(), lock.mint.as_ref()],
        bump = lock.lock_bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        init,
        payer = owner,
        space = Poll::LEN,
        seeds = [b"poll", lock.key().as_ref(), (lock.polls + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Box<Account<'info, Poll>>,
    #[account(
        mut,
        seeds = [b"analytics"],
        bump = analytics.state_bump
    )]
    pub analytics: Box<Account<'info, Analytics>>,
    pub system_program: Program<'info, System>,
}

impl<'info> PollNew<'info> {
    pub fn poll_new(
        &mut self,
        bumps: &PollNewBumps,
        title: String,
        choices: Vec<Choice>,
    ) -> Result<()> {
        // pub creator: Pubkey,
        // pub mint: Pubkey,
        // pub time: Time,
        // pub threshold: u8,
        // pub approved: u64,
        // pub rejected: u64,
        // pub created_at: i64,
        // pub bump: u8,
        // pub name: String,
        // pub polls: Vec<Poll>,
        // pub users: Vec<User>,
        // pub deposits: Vec<Deposit>,
        if title.len() > MAX_TITLE_LENGTH {
            return err!(ErrorCode::PollTitleEmpty);
        } else if title.len() == 0 {
            return err!(ErrorCode::PollTitleTooLong);
        }

        let user = &mut self.user;
        let lock = &mut self.lock;
        let poll = &mut self.poll;

        require!(
            user.total_user_deposit_amount() >= lock.min,
            ErrorCode::NotEnoughDepositsToStartPoll
        );

        poll.summoner = self.owner.key();
        poll.id = lock.polls + 1;
        poll.created_at = Clock::get()?.unix_timestamp;
        poll.executed = false;
        poll.status = Status::Voting;
        poll.title = title;
        poll.result = None;
        poll.choices = choices;
        poll.bump = bumps.poll;

        Ok(())
    }

    pub fn update_analytics(&mut self) -> Result<()> {
        let analytics = &mut self.analytics;
        analytics.polls += 1;
        let lock = &mut self.lock;
        lock.polls += 1;
        Ok(())
    }
}
