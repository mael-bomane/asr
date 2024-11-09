use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::constants::THREE_MONTH_IN_SECONDS;
use crate::{Analytics, Lock, Season, ASR};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct ASRDeposit<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        seeds = [b"auth", analytics.key().as_ref()],
        bump = analytics.auth_bump
    )]
    /// CHECK: This is safe, account doesn't exists nor holds data
    pub auth: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = creator,
        seeds = [b"lock", creator.key().as_ref(), mint.key().as_ref()],
        bump = lock.lock_bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = creator,
    )]
    pub signer_ata: Box<Account<'info, TokenAccount>>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = creator,
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

impl<'info> ASRDeposit<'info> {
    pub fn asr_deposit(&mut self, amount: u64) -> Result<()> {
        let lock = &mut self.lock;

        let now = Clock::get()?.unix_timestamp;

        let mut season = lock.seasons[lock.seasons.len()].clone();

        if now > season.season_end {
            lock.seasons.push(Season {
                season: season.season + 1,
                season_end: now + THREE_MONTH_IN_SECONDS,
                asr: vec![ASR {
                    mint: self.mint.key(),
                    amount,
                }],
            });
        } else {
            season.asr.push(ASR {
                mint: self.mint.key(),
                amount,
            });

            let _ = std::mem::replace(&mut lock.seasons[season.season as usize], season);
        }

        let accounts = Transfer {
            from: self.signer_ata.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.creator.to_account_info(),
        };

        let cpi = CpiContext::new(self.token_program.to_account_info(), accounts);

        transfer(cpi, amount)?;

        Ok(())
    }
}
