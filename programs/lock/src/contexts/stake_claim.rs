use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    constants::*,
    errors::ErrorCode,
    state::{Analytics, Deposit, Lock, User},
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct StakeClaim<'info> {
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
        seeds = [b"lock", lock.creator.as_ref(), lock.config.mint.as_ref()],
        bump = lock.lock_bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
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
    #[account(
        address = lock.config.mint @ ErrorCode::WrongLockerMint
    )]
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [b"vault", lock.key().as_ref(), owner.key().as_ref()],
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

impl<'info> StakeClaim<'info> {
    pub fn stake_claim(&mut self) -> Result<()> {
        let lock = &mut self.lock;
        let user = &mut self.user;

        let time = Clock::get()?.unix_timestamp;

        let mut amount_to_claim = 0u64;

        let deposits_to_claim: Vec<Deposit> = user
            .deposits
            .clone()
            .into_iter()
            .filter(|deposit| {
                time > (if lock.config.config == 0 {
                    Some(deposit.deactivation_start).unwrap().unwrap() + ONE_MONTH_IN_SECONDS
                } else {
                    deposit.expires_at
                })
            })
            .collect();

        if deposits_to_claim.len() == 0 {
            return err!(ErrorCode::NoDepositsReadyToClaimForThisUserInThisLocker);
        }

        for i in 0..deposits_to_claim.len() {
            amount_to_claim += user.deposits[i].amount;
        }

        let mut deposits_remaining: Vec<Deposit> = user
            .deposits
            .clone()
            .into_iter()
            .filter(|deposit| {
                time < (if lock.config.config == 0 {
                    Some(deposit.deactivation_start).unwrap().unwrap() + ONE_MONTH_IN_SECONDS
                } else {
                    deposit.expires_at
                })
            })
            .collect();

        if deposits_remaining.len() == 0 {
            deposits_remaining = Vec::new()
        }

        user.deposits = deposits_remaining;

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

        transfer(cpi, amount_to_claim)?;

        lock.total_deposits -= amount_to_claim;

        Ok(())
    }
}
