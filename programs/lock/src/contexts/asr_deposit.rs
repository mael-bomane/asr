use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use anchor_spl::metadata::MetadataAccount;
use crate::constants::THREE_MONTH_IN_SECONDS;
use crate::{Analytics, Lock, Season, ASR};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(amount: u64, symbol: String)]
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
        realloc = Lock::LEN 
        + (if Clock::get()?.unix_timestamp > lock.seasons[lock.seasons.len() - 1].season_end {
            (lock.seasons.len() + 1) * Season::LEN
        } else {
            lock.seasons.len() * Season::LEN
        })
        + (if lock.seasons[lock.seasons.len() - 1].asr.iter().any(|i| i.mint == mint.key()) {
            lock.total_asr() * ASR::LEN
        } else {
            (lock.total_asr() + 1 ) * ASR::LEN
        }),
        realloc::zero = false,
        realloc::payer = creator,
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
    //#[account(constraint = metadata.mint.key() == mint.key())]
    //pub metadata: Box<Account<'info, MetadataAccount>>,
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
    pub fn asr_deposit(&mut self, amount: u64, symbol: String) -> Result<()> {
        let lock = &mut self.lock;

        let now = Clock::get()?.unix_timestamp;

        let mut season = lock.seasons[lock.seasons.len() - 1].clone();

        // create new season if current season ended
        if now > season.season_end {
            lock.seasons.push(Season {
                season: season.season + 1,
                points: 0,
                season_start: now,
                season_end: now + THREE_MONTH_IN_SECONDS,
                asr: vec![ASR {
                    mint: self.mint.key(),
                    decimals: self.mint.decimals,
                    symbol,
                    amount,
                }],
            });
        } else {
            if season.asr.iter().any(|i| i.mint == self.mint.key()) {
                let mut asr: ASR = season.asr.iter().find(|i| i.mint == self.mint.key()).unwrap().clone();
                let index = season.asr.iter().position(|i| i.mint == self.mint.key()).unwrap().clone();
                asr.amount += amount;
                let _ = std::mem::replace(&mut season.asr[index], asr);
            } else {
                season.asr.push(ASR {
                    mint: self.mint.key(),
                    decimals: self.mint.decimals,
                    symbol,
                    amount,
                });
            }
            let _ = std::mem::replace(&mut lock.seasons[season.season as usize], season);
        }

        let accounts = Transfer {
            from: self.signer_ata.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.creator.to_account_info(),
        };

        let cpi = CpiContext::new(self.token_program.to_account_info(), accounts);

        transfer(cpi, amount)
    }
}
