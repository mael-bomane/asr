use crate::{
    constants::*, errors::ErrorCode, state::Analytics, Choice, Lock, Proposal, Status, User,
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(title: String, choices: Vec<Choice>)]
pub struct ProposalNew<'info> {
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
        seeds = [b"lock", lock.creator.as_ref(), lock.mint.as_ref()],
        bump = lock.lock_bump
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        init,
        payer = owner,
        space = Proposal::LEN + choices.len() * Choice::LEN,
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

impl<'info> ProposalNew<'info> {
    pub fn proposal_new(
        &mut self,
        bumps: &ProposalNewBumps,
        title: String,
        choices: Vec<Choice>,
    ) -> Result<()> {
        if title.len() > MAX_TITLE_LENGTH {
            return err!(ErrorCode::PollTitleTooLong);
        } else if title.len() == 0 {
            return err!(ErrorCode::PollTitleEmpty);
        }

        let user = &mut self.user;
        let lock = &mut self.lock;
        let proposal = &mut self.proposal;

        require!(
            user.total_user_deposit_amount() >= lock.amount,
            ErrorCode::NotEnoughDepositsToStartPoll
        );

        proposal.summoner = self.owner.key();
        proposal.lock = lock.key();
        proposal.id = lock.polls + 1;
        let now = Clock::get()?.unix_timestamp;
        proposal.created_at = now;
        proposal.ends_at = now + lock.voting_period;
        proposal.executed = false;
        proposal.status = Status::Voting;
        proposal.title = title;
        proposal.result = None;
        proposal.choices = choices;
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