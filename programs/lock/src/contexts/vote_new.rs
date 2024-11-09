use {
    crate::{
        errors::ErrorCode,
        state::{Analytics, Poll, User, Vote, Lock, Choice, Deposit}
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
        realloc = User::LEN + ( user.deposits.len() + 1 * Deposit::LEN ) + (user.votes.len() + 1 * Vote::LEN),
        realloc::zero = false,
        realloc::payer = owner,
        seeds = [b"user", lock.key().as_ref(), owner.key().as_ref()],
        bump = user.bump, 
        constraint = !user.votes.clone().into_iter().any(|vote| vote.poll == index ) @ ErrorCode::UserAlreadyVotedThisPoll
    )]
    pub user: Box<Account<'info, User>>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.as_ref(), lock.mint.as_ref()],
        bump = lock.lock_bump, 
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        seeds = [b"poll", lock.key().as_ref(), poll.id.to_le_bytes().as_ref()],
        bump = poll.bump,
        constraint = poll.id == index,
    )]
    pub poll: Box<Account<'info, Poll>>,
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
        // pub creator: Pubkey,
        // pub mint: Pubkey,
        // pub time: Time,
        // pub threshold: u8,
        // pub approved: u64,
        // pub rejected: u64,
        // pub created_at: i64,
        // pub bump: u8,
        // pub name: String,
        // pub polls: Vec<Poll>,
        // pub users: Vec<User>,
        // pub deposits: Vec<Deposit>,
        
        let lock = &mut self.lock;
        let user = &mut self.user;

        require!(user.total_user_deposit_amount() > 0, ErrorCode::UserHaveNoVotingPowerInThisLock);

        let poll = &mut self.poll;
        
        require!(Clock::get()?.unix_timestamp < (poll.created_at + lock.voting_period), ErrorCode::VotingPeriodExpired);
        
        let choice = poll.choices[usize::from(id as usize)].clone();
        let title = choice.title.clone();
        let voting_power = user.voting_power(&lock);
        let mut choice_voting_power = choice.voting_power;
        choice_voting_power += voting_power;

        let season = lock.seasons.len() as u8 - 1;
        
        let vote = Vote {
            season,
            poll: index,
            voting_power,
            choice: id,
            created_at: Clock::get()?.unix_timestamp,
        };

        user.votes.push(vote);

        let index = poll 
            .choices
            .clone()
            .into_iter()
            .position(|c| &c.id == &id)
            .unwrap();

        let _ = std::mem::replace(
            &mut poll.choices[index],
            Choice {
                id,
                voting_power: choice_voting_power,
                title,
            },
        );

        
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
