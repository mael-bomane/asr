use crate::state::{Analytics, Lock, User};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Register<'info> {
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
        init,
        payer = owner,
        space = User::LEN,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump
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

impl<'info> Register<'info> {
    pub fn register(&mut self, bumps: &RegisterBumps) -> Result<()> {
        let user = &mut self.user;
        user.owner = self.owner.key();
        user.points = 0u64;
        user.bump = bumps.user;
        user.deposits = Vec::new();

        Ok(())
    }
}
