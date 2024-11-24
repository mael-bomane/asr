use crate::{
    constants::*, errors::ErrorCode, state::Analytics, Choice, Lock, Proposal, Status, User,
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(title: String, content: String)]
pub struct ProposalStandard<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.as_ref(), lock.config.mint.as_ref()],
        bump = lock.lock_bump,
        constraint = if !lock.config.permissionless { lock.config.managers.iter().any(|i| i == &owner.key())} else { true }
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        init,
        payer = owner,
        space = Proposal::LEN + 3 * Choice::LEN,
        seeds = [b"proposal", lock.key().as_ref(), (lock.polls + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Box<Account<'info, Proposal>>,
    #[account(
        mut,
        seeds = [b"analytics"],
        bump = analytics.state_bump
    )]
    pub analytics: Box<Account<'info, Analytics>>,
    pub system_program: Program<'info, System>,
}

impl<'info> ProposalStandard<'info> {
    pub fn proposal_standard(
        &mut self,
        bumps: &ProposalStandardBumps,
        title: String,
        content: String,
    ) -> Result<()> {
        if title.len() > MAX_TITLE_LENGTH {
            return err!(ErrorCode::ProposalTitleTooLong);
        } else if title.len() == 0 {
            return err!(ErrorCode::ProposalTitleEmpty);
        }

        if content.len() > MAX_CONTENT_LENGTH {
            return err!(ErrorCode::ProposalContentTooLong);
        } else if title.len() == 0 {
            return err!(ErrorCode::ProposalContentEmpty);
        }

        let user = &mut self.user;
        let lock = &mut self.lock;
        let proposal = &mut self.proposal;

        require!(
            user.total_user_deposit_amount() >= lock.config.amount,
            ErrorCode::NotEnoughDepositsToStartPoll
        );

        proposal.summoner = self.owner.key();
        proposal.lock = lock.key();
        proposal.id = lock.polls + 1;
        let now = Clock::get()?.unix_timestamp;
        proposal.created_at = now;
        proposal.ends_at = now + lock.config.voting_period;
        proposal.executed = false;
        proposal.status = Status::Voting;
        proposal.title = title;
        proposal.content = content;
        proposal.result = None;
        proposal.choices = vec![
            Choice {
                id: 0,
                title: "For".to_owned(),
                voting_power: 0,
            },
            Choice {
                id: 1,
                title: "Against".to_owned(),
                voting_power: 0,
            },
            Choice {
                id: 2,
                title: "Abstain".to_owned(),
                voting_power: 0,
            },
        ];
        proposal.proposal_type = 1;
        proposal.bump = bumps.proposal;

        Ok(())
    }

    pub fn update_analytics(&mut self) -> Result<()> {
        let analytics = &mut self.analytics;
        analytics.polls += 1;
        let lock = &mut self.lock;
        lock.polls += 1;
        Ok(())
    }
}
