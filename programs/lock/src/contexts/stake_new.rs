use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::{errors::ErrorCode, Analytics, Claim, Deposit, Lock, User, Vote};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct StakeNew<'info> {
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
        seeds = [b"lock", lock.creator.as_ref(), lock.mint.as_ref()],
        bump = lock.lock_bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        realloc = User::LEN + ( (user.deposits.len() + 1 )* Deposit::LEN ) +  user.votes.len() * Vote::LEN + user.claims.len() * Claim::LEN,
        realloc::zero = false,
        realloc::payer = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub signer_ata: Box<Account<'info, TokenAccount>>,
    #[account(
        address = lock.mint @ ErrorCode::WrongLockerMint
    )]
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = owner,
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

impl<'info> StakeNew<'info> {
    pub fn stake_new(&mut self, amount: u64) -> Result<()> {
        // pub creator: Pubkey,
        // pub mint: Pubkey,
        // pub time: Time,
        // pub approved: u64,
        // pub rejected: u64,
        // pub created_at: i64,
        // pub bump: u8,
        // pub name: String,
        // pub polls: Vec<Poll>,
        // pub users: Vec<User>,
        let lock = &mut self.lock;
        let user = &mut self.user;

        let accounts = Transfer {
            from: self.signer_ata.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.owner.to_account_info(),
        };

        let cpi = CpiContext::new(self.token_program.to_account_info(), accounts);

        transfer(cpi, amount)?;

        let deposit = Deposit {
            amount,
            deactivating: false,
            deactivation_start: None,
            created_at: Clock::get()?.unix_timestamp,
            expires_at: Clock::get()?.unix_timestamp + lock.lock_duration,
        };

        user.deposits.push(deposit);
        lock.total_deposits += amount;

        Ok(())
    }
}
