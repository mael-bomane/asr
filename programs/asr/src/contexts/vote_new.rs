use {
    crate::{
        errors::ErrorCode,
        state::{Analytics, Choice, Deposit, Lock, Proposal, User, Vote, Claim},
    },
    anchor_lang::prelude::*
};


#[derive(Accounts)]
#[instruction(index: u64, id: u8)]
pub struct VoteNew<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        realloc = User::LEN + user.deposits.len() * Deposit::LEN  +  (user.votes.len() +1 ) * Vote::LEN + user.claims.len() * Claim::LEN,
        realloc::zero = false,
        realloc::payer = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump = user.bump, 
        constraint = !user.votes.clone().into_iter().any(|vote| vote.proposal == index ) @ ErrorCode::UserAlreadyVotedThisPoll
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.as_ref(), lock.config.mint.as_ref()],
        bump = lock.lock_bump, 
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        seeds = [b"proposal", lock.key().as_ref(), proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = proposal.id == index,
        constraint = if proposal.proposal_type == (3 | 4) {
            lock.config.managers.iter().any(|i| i == &owner.key())
        } else { true } @ ErrorCode::UnauthorizedManagersOnly,
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

impl<'info> VoteNew<'info> {
    pub fn vote_new(&mut self, index: u64, id: u8) -> Result<()> {
        let lock = &mut self.lock;
        let user = &mut self.user;

        require!(user.voting_power(&lock) > 0, ErrorCode::UserHaveNoVotingPowerInThisLock);

        let proposal = &mut self.proposal;
        
        require!(Clock::get()?.unix_timestamp < (proposal.created_at + lock.config.voting_period), ErrorCode::VotingPeriodExpired);
        
        let choice = proposal.choices[usize::from(id as usize)].clone();
        let title = choice.title.clone();
        let voting_power = user.voting_power(&lock);
        let mut choice_voting_power = choice.voting_power;
        choice_voting_power += voting_power;

        let season = lock.seasons.len() as u8 - 1;
        
        let vote = Vote {
            season,
            proposal: index,
            voting_power,
            choice: id,
            created_at: Clock::get()?.unix_timestamp,
        };

        user.votes.push(vote);

        let index = proposal 
            .choices
            .clone()
            .into_iter()
            .position(|c| &c.id == &id)
            .unwrap();

        let _ = std::mem::replace(
            &mut proposal.choices[index],
            Choice {
                id,
                voting_power: choice_voting_power,
                title,
            },
        );
        
        let mut season = lock.seasons.clone().into_iter().find(|season| season.season == proposal.season).unwrap();
        match proposal.proposal_type {
            // add points for proposal core, standard & option
            0..=2 => {
                season.points += voting_power;
            },
            // don't add points for managers add/remove or unimplemented proposal type
            _ => {
                ()
            }
        }

        let _ = std::mem::replace(&mut lock.seasons[season.season as usize], season);
        
        Ok(())
    }

    pub fn update_analytics(&mut self) -> Result<()> {
        let analytics = &mut self.analytics;
        analytics.votes += 1;
        let lock = &mut self.lock;
        lock.votes += 1;
        Ok(())
    }
}
