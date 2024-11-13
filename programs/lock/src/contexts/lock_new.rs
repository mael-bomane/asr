use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, errors::ErrorCode, state::Analytics};
use crate::{Lock, Season};

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
        space = Lock::LEN + Season::LEN,
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
        seeds = [b"vault", lock.key().as_ref(), mint.key().as_ref()],
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
        lock.seasons.push(Season {
            season: 0,
            points: 0,
            season_end: Clock::get()?.unix_timestamp + THREE_MONTH_IN_SECONDS,
            asr: Vec::new(),
        });
        lock.voting_period = voting_period;
        lock.lock_duration = lock_duration;
        lock.threshold = threshold;
        lock.quorum = quorum;
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
        analytics.locks += 1;
        Ok(())
    }
}
