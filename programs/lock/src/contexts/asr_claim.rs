use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::{Analytics, Lock, User};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(amount: u64)]
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
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump = user.bump
    )]
    pub user: Box<Account<'info, User>>,
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
    pub fn asr_claim(&mut self, amount: u64) -> Result<()> {
        let lock = &mut self.lock;

        let user = &mut self.user;

        let voting_power = user.user_season_points(&lock);

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

        transfer(cpi, amount_to_claim)
    }
}
