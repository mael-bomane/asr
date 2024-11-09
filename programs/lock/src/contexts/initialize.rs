use crate::state::Analytics;

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"auth", analytics.key().as_ref()],
        bump
    )]
    /// CHECK: This is safe
    pub auth: UncheckedAccount<'info>,
    #[account(
        init,
        payer = signer,
        seeds = [b"analytics"],
        bump,
        space = Analytics::LEN
    )]
    pub analytics: Account<'info, Analytics>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()> {
        let analytics = &mut self.analytics;

        // pub token: u64,
        // pub members: u64,
        // pub polls: u64,
        // pub approved: u64,
        // pub rejected: u64,
        // pub created_at: i64,
        // pub auth_bump: u8,
        // pub state_bump: u8,
        // pub members_list: Vec<Member>,

        analytics.polls = 0;
        analytics.approved = 0;
        analytics.rejected = 0;
        analytics.created_at = Clock::get()?.unix_timestamp;
        analytics.auth_bump = bumps.auth;
        analytics.state_bump = bumps.analytics;
        Ok(())
    }
}
