use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::MetadataAccount;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, errors::ErrorCode, state::Analytics};
use crate::{Choice, Deposit, Lock, Proposal, Season, Status, User};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ManagerAdd<'info> {
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
        constraint = !lock.config.permissionless && lock.config.managers.iter().any(|i| i == &signer.key()) @ ErrorCode::UnauthorizedManagersOnly
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        init,
        payer = signer,
        space = Proposal::LEN + 3 * Choice::LEN,
        seeds = [b"proposal", lock.key().as_ref(), (lock.proposals + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
         mut,
         seeds = [b"user", lock.key().as_ref(), user.owner.key().as_ref()],
         bump = user.bump
     )]
    pub user: Box<Account<'info, User>>,
    //#[account(constraint = metadata.mint.key() == mint.key())]
    //pub metadata: Box<Account<'info, MetadataAccount>>,
    #[account(
        mut,
        seeds = [b"analytics"],
        bump = analytics.state_bump
    )]
    pub analytics: Box<Account<'info, Analytics>>,
    pub system_program: Program<'info, System>,
}

impl<'info> ManagerAdd<'info> {
    pub fn manager_add(&mut self, bumps: &ManagerAddBumps) -> Result<()> {
        let lock = &mut self.lock;
        let user = &mut self.user;

        let proposal = &mut self.proposal;
        proposal.summoner = self.signer.key();
        proposal.lock = lock.key();
        proposal.id = lock.proposals + 1;
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
        analytics.proposals += 1;
        let lock = &mut self.lock;
        lock.proposals += 1;
        Ok(())
    }
}
