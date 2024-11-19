use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::MetadataAccount;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, errors::ErrorCode, state::Analytics};
use crate::{Choice, Deposit, Lock, Proposal, Season, Status, User};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ManagerRemove<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"auth", analytics.key().as_ref()],
        bump = analytics.auth_bump
    )]
    /// CHECK: This is safe, account doesn't exists nor holds data
    pub auth: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.key().as_ref(), lock.config.mint.key().as_ref()],
        bump = lock.lock_bump,
        constraint = !lock.config.permissionless && lock.config.managers.iter().any(|i| i == &signer.key())
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        init,
        payer = signer,
        space = Proposal::LEN + 3 * Choice::LEN,
        seeds = [b"proposal", lock.key().as_ref(), (lock.polls + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
         mut,
         seeds = [b"user", lock.key().as_ref(), user.owner.key().as_ref()],
         bump = user.bump
     )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub signer_ata: Box<Account<'info, TokenAccount>>,
    pub mint: Box<Account<'info, Mint>>,
    //#[account(constraint = metadata.mint.key() == mint.key())]
    //pub metadata: Box<Account<'info, MetadataAccount>>,
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

impl<'info> ManagerRemove<'info> {
    pub fn manager_add(&mut self, bumps: &ManagerRemoveBumps) -> Result<()> {
        let lock = &mut self.lock;
        let user = &mut self.user;

        require!(
            user.voting_power(&lock) >= lock.config.amount,
            ErrorCode::NotEnoughDepositsToStartPoll
        );

        let proposal = &mut self.proposal;
        proposal.summoner = self.signer.key();
        proposal.lock = lock.key();
        proposal.id = lock.polls + 1;
        let now = Clock::get()?.unix_timestamp;
        proposal.created_at = now;
        proposal.ends_at = now + lock.config.voting_period;
        proposal.executed = false;
        proposal.status = Status::Voting;
        proposal.title = format!("Proposal : Add Manager {}", user.owner);
        proposal.result = None;
        proposal.choices = vec![
            Choice {
                id: 0,
                voting_power: 0,
                title: "For".to_string(),
            },
            Choice {
                id: 1,
                voting_power: 0,
                title: "Against".to_string(),
            },
            Choice {
                id: 2,
                voting_power: 0,
                title: "Abstain".to_string(),
            },
        ];
        proposal.proposal_type = 3;
        proposal.manager = Some(user.owner);
        proposal.bump = bumps.proposal;

        Ok(())
    }

    pub fn update_analytics(&mut self) -> Result<()> {
        let analytics = &mut self.analytics;
        analytics.locks += 1;
        Ok(())
    }
}
