use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::Lock;
use crate::{constants::*, errors::ErrorCode, state::Analytics};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(config: u8, voting_period: i64, lock_duration: i64, threshold: u8, quorum: u8, min: u64, name: String)]
pub struct LockNew<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"auth", analytics.key().as_ref()],
        bump = analytics.auth_bump
    )]
    /// CHECK: This is safe, account doesn't exists nor holds data
    pub auth: UncheckedAccount<'info>,
    #[account(
        init,
        space = Lock::LEN,
        payer = signer,
        seeds = [b"lock", signer.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub signer_ata: Box<Account<'info, TokenAccount>>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        payer = signer,
        seeds = [b"vault", signer.key().as_ref(), mint.key().as_ref()],
        token::mint = mint,
        token::authority = auth,
        bump
    )]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        seeds = [b"analytics"],
        bump = analytics.state_bump
    )]
    pub analytics: Box<Account<'info, Analytics>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> LockNew<'info> {
    pub fn lock_new(
        &mut self,
        bumps: &LockNewBumps,
        config: u8,
        voting_period: i64,
        lock_duration: i64,
        threshold: u8,
        quorum: u8,
        min: u64,
        name: String,
    ) -> Result<()> {
        // pub creator: Pubkey,
        // pub mint: Pubkey,
        // pub voting_period: i64,
        // pub lock_duration: i64,
        // pub threshold: u8,
        // pub approved: u64,
        // pub rejected: u64,
        // pub created_at: i64,
        // pub bump: u8,
        // pub name: String,
        // pub polls: Vec<Poll>,
        // pub users: Vec<User>,
        // pub deposits: Vec<Deposit>,
        if name.len() > MAX_LOCKER_NAME_LENGTH {
            return err!(ErrorCode::LockerNameTooLong);
        } else if name.len() == 0 {
            return err!(ErrorCode::LockerNameEmpty);
        }

        require!(
            voting_period >= ONE_DAY_IN_SECONDS && voting_period <= ONE_WEEK_IN_SECONDS,
            ErrorCode::VotingPeriodOutOfBounds
        );

        if config == 0 {
            require!(lock_duration == 0, ErrorCode::InvalidLockDuration);
        } else if config == 1 {
            require!(
                lock_duration >= ONE_MONTH_IN_SECONDS && voting_period <= ONE_WEEK_IN_SECONDS,
                ErrorCode::LockDurationOutOfBounds
            );
        } else {
            return err!(ErrorCode::ConfigUnrecognized);
        }

        require!(
            threshold >= 50 && threshold <= 100,
            ErrorCode::ThresholdOutOfBounds
        );

        require!(quorum > 0 && quorum <= 100, ErrorCode::QuorumOutOfBounds);

        let lock = &mut self.lock;

        lock.creator = self.signer.key();
        lock.mint = self.mint.key();
        lock.config = config;
        lock.voting_period = voting_period;
        lock.lock_duration = lock_duration;
        lock.threshold = threshold;
        lock.min = min;
        lock.total_deposits = 0;
        lock.approved = 0;
        lock.rejected = 0;
        lock.created_at = Clock::get()?.unix_timestamp;
        lock.lock_bump = bumps.lock;
        lock.vault_bump = bumps.vault;
        lock.name = name;
        lock.polls = 0;

        Ok(())
    }

    pub fn update_analytics(&mut self) -> Result<()> {
        let analytics = &mut self.analytics;
        analytics.lockers += 1;
        Ok(())
    }
}