use crate::{
    constants::THREE_MONTH_IN_SECONDS, errors::ErrorCode, state::{Analytics, Lock, Poll, Status}, Season, ASR
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PollExecute<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        realloc = Lock::LEN 
        + (if Clock::get()?.unix_timestamp > lock.seasons[lock.seasons.len() - 1].season_end {
            (lock.seasons.len() + 1) * Season::LEN
        } else {
            lock.seasons.len() * Season::LEN
        })
        + lock.total_asr() * ASR::LEN,
        realloc::zero = false,
        realloc::payer = owner,
        seeds = [b"lock", lock.creator.as_ref(), lock.mint.as_ref()],
        bump = lock.lock_bump, 
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        seeds = [b"poll", lock.key().as_ref(), poll.id.to_le_bytes().as_ref()],
        bump = poll.bump,
        constraint = !poll.executed @ ErrorCode::PollAlreadyExecuted,
        constraint = Clock::get()?.unix_timestamp > (poll.created_at  + lock.voting_period) @ ErrorCode::WaitForVotingPeriodToEnd 
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

impl<'info> PollExecute<'info> {
    pub fn poll_execute(&mut self) -> Result<()> {
        let lock = &mut self.lock;
        let poll = &mut self.poll;
        let analytics = &mut self.analytics;
        
        let (result, is_approved, total_power) = poll.result(&lock);

        match is_approved {
            true => {
                lock.approved += 1;
                analytics.approved += 1;
                poll.executed = true;
                poll.status = Status::Approved;
                poll.result = result;
            },
            false => {
                lock.rejected += 1;
                analytics.rejected += 1;
                poll.executed = true;
                poll.status = Status::Rejected;
                poll.result = None;
            }
        }

        let mut season = lock.seasons.clone().into_iter().find(|season| season.season == poll.season).unwrap();
        season.points += total_power;

        let now = Clock::get()?.unix_timestamp;
        if now > season.season_end {
            lock.seasons.push(Season {
                season: season.season + 1,
                points: 0,
                asr: Vec::new(),
                season_end: now + THREE_MONTH_IN_SECONDS
            })
        }

        let _ = std::mem::replace(&mut lock.seasons[season.season as usize], season);

        Ok(())
    }
}

