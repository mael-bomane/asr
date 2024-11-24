use crate::{
    errors::ErrorCode,
    state::{Analytics, Lock, User},
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct StakeDeactivate<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.as_ref(), lock.config.mint.as_ref()],
        bump = lock.lock_bump,
        constraint = lock.config.config == 0 @ ErrorCode::InstructionUnavailableForThisLock
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        has_one = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump = user.bump
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        seeds = [b"analytics"],
        bump = analytics.state_bump
    )]
    pub analytics: Box<Account<'info, Analytics>>,
    pub system_program: Program<'info, System>,
}

impl<'info> StakeDeactivate<'info> {
    pub fn stake_deactivate(&mut self) -> Result<()> {
        let user = &mut self.user;

        for deposit in &mut user.deposits {
            deposit.deactivating = true;
            deposit.deactivation_start = Some(Clock::get()?.unix_timestamp);
        }

        Ok(())
    }
}
