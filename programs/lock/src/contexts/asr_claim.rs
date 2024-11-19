use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::{errors::ErrorCode, Analytics, Claim, Lock, User};
use crate::{Deposit, Vote};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ASRClaim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        seeds = [b"auth", analytics.key().as_ref()],
        bump = analytics.auth_bump
    )]
    /// CHECK: This is safe, account doesn't exists nor holds data
    pub auth: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.as_ref(), mint.key().as_ref()],
        bump = lock.lock_bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        has_one = owner,
        realloc = User::LEN + user.deposits.len() * Deposit::LEN +  user.votes.len() * Vote::LEN + ((user.claims.len() + 1) * Claim::LEN),
        realloc::zero = false,
        realloc::payer = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump = user.bump,
        constraint = !user.claims.iter().any(|i| i.mint == mint.key() && i.season == lock.seasons.len() as u8 - 2) @ ErrorCode::UserAlreadyClaimedThis
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        seeds = [b"vault", lock.key().as_ref(), owner.key().as_ref()],
        token::mint = mint,
        token::authority = auth,
        bump
    )]
    pub user_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub signer_ata: Box<Account<'info, TokenAccount>>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
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

impl<'info> ASRClaim<'info> {
    pub fn asr_claim(&mut self) -> Result<()> {
        let lock = &mut self.lock;

        let season = &lock.seasons.clone()[lock.seasons.len() as usize - 2];
        let asr = season
            .asr
            .clone()
            .into_iter()
            .find(|asr| asr.mint == self.mint.key())
            .unwrap();

        let total_tokens = asr.amount;
        let user = &mut self.user;

        let user_season_points = user.user_season_points(season.season);

        let user_ratio = user_season_points
            .checked_mul(100)
            .unwrap()
            .div_ceil(season.points);

        let amount = user_ratio.checked_mul(total_tokens).unwrap().div_ceil(100);

        // if asr claim is locker mint, we transfer tokens to user vault + create a deposit
        if self.mint.key() == lock.config.mint {
            let accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.user_vault.to_account_info(),
                authority: self.auth.to_account_info(),
            };

            let seeds = &[
                b"auth",
                self.analytics.to_account_info().key.as_ref(),
                &[self.analytics.auth_bump],
            ];

            let signer_seeds = &[&seeds[..]];

            let cpi = CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                accounts,
                signer_seeds,
            );

            transfer(cpi, amount)?;

            user.deposits.push(Deposit {
                amount,
                deactivating: false,
                deactivation_start: None,
                created_at: Clock::get()?.unix_timestamp,
                expires_at: Clock::get()?.unix_timestamp + lock.config.lock_duration,
            });

            lock.total_deposits += amount;
        } else {
            let accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.signer_ata.to_account_info(),
                authority: self.auth.to_account_info(),
            };

            let seeds = &[
                b"auth",
                self.analytics.to_account_info().key.as_ref(),
                &[self.analytics.auth_bump],
            ];

            let signer_seeds = &[&seeds[..]];

            let cpi = CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                accounts,
                signer_seeds,
            );
            transfer(cpi, amount)?;
        }

        user.claims.push(Claim {
            season: season.season,
            mint: self.mint.key(),
            amount,
            created_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}
