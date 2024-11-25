use crate::{constants::*, errors::ErrorCode, state::{Analytics, Lock, Proposal, Status, User, Choice}};

use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(
    config: u8,
    permissionless: Option<bool>,
    season_duration: Option<i64>,
    voting_period: Option<i64>,
    lock_duration: Option<i64>,
    threshold: Option<u8>, 
    quorum: Option<u8>, 
    amount: Option<u64>, 
    name: Option<String>, 
    symbol: Option<String>
)]
pub struct ProposalCore<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lock", lock.creator.key().as_ref(), lock.config.mint.key().as_ref()],
        bump = lock.lock_bump,
        constraint = if !lock.config.permissionless {
            lock.config.managers.iter().any(|i| i == &signer.key())
        } else { true } @ ErrorCode::UnauthorizedManagersOnly
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
         seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()],
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

impl<'info> ProposalCore<'info> {
    pub fn proposal_core(
        &mut self,
        bumps: &ProposalCoreBumps,
        config: u8,
        permissionless: Option<bool>,
        season_duration: Option<i64>,
        voting_period: Option<i64>,
        lock_duration: Option<i64>,
        threshold: Option<u8>, 
        quorum: Option<u8>, 
        amount: Option<u64>, 
        name: Option<String>, 
        symbol: Option<String>
    ) -> Result<()> {
        let lock = &mut self.lock;
        let user = &mut self.user;

        require!(
            user.voting_power(&lock) >= lock.config.amount,
            ErrorCode::NotEnoughDepositsToStartPoll
        );

        let mut new = lock.config.clone();

        match permissionless {
            Some(value) => {
                new.permissionless = value;
            },
            None => ()
        }
        match season_duration {
            Some(value) => {
                // require!(
                //     value >= ONE_DAY_IN_SECONDS && value <= ONE_WEEK_IN_SECONDS,
                //     ErrorCode::VotingPeriodOutOfBounds
                // );
                new.season_duration = value;
            },
            None => ()
        }
        match voting_period {
            Some(value) => {
                require!(
                    value >= HALF_DAY_IN_SECONDS && value <= ONE_WEEK_IN_SECONDS,
                    ErrorCode::VotingPeriodOutOfBounds
                );
                new.voting_period = value;
            },
            None => ()
        }

        match lock_duration {
            Some(value) => {
                if lock.config.config == 0 {
                    require!(value >= 0 && value <= THREE_MONTH_IN_SECONDS, ErrorCode::InvalidLockDuration);
                } else if lock.config.config == 1 {
                    require!(
                        value >= ONE_MONTH_IN_SECONDS && value <= ONE_YEAR_IN_SECONDS,
                        ErrorCode::LockDurationOutOfBounds
                    );
                } else {
                    return err!(ErrorCode::ConfigUnrecognized);
                }
                new.lock_duration = value;
            },
            None => ()
        }

        match threshold {
            Some(value) => {
                require!(value >= 50 && value <= 100, ErrorCode::ThresholdOutOfBounds);        
                new.threshold = value;
            },
            None => ()
        }

        match amount {
            Some(value) => {
                require!(value > 0, ErrorCode::QuorumOutOfBounds);
                new.amount = value;
            },
            None => ()
        }

        match quorum {
            Some(value) => {
                require!(value > 0 && value <= 100, ErrorCode::QuorumOutOfBounds);
                new.quorum = value;
            },
            None => ()
        }

        match name {
            Some(value) => {
                if value.len() > MAX_LOCKER_NAME_LENGTH {
                    return err!(ErrorCode::LockerNameTooLong);
                } else if value.len() == 0 {
                    return err!(ErrorCode::LockerNameEmpty);
                }
                new.name = value;
            },
            None => ()
        }

        match symbol {
            Some(value) => {
                if value.len() > MAX_SYMBOL_LENGTH {
                    return err!(ErrorCode::SymbolTooLong);
                } else if value.len() == 0 {
                    return err!(ErrorCode::SymbolEmpty);
                }       
                new.symbol = value;
            },
            None => ()
        }
        
        let proposal = &mut self.proposal;
        proposal.summoner = self.signer.key();
        proposal.lock = lock.key();
        proposal.id = lock.proposals + 1;
        let now = Clock::get()?.unix_timestamp;
        proposal.created_at = now;
        proposal.ends_at = now + lock.config.voting_period;
        proposal.executed = false;
        proposal.status = Status::Voting;
        proposal.title = "Proposal : Lock Config Update".to_string();
        proposal.result = None;
        proposal.choices = vec![
            Choice{
                id: 0,
                voting_power: 0,
                title: "For".to_string()
            },
            Choice{
                id: 1,
                voting_power: 0,
                title: "Against".to_string()
            },
            Choice{
                id: 2,
                voting_power: 0,
                title: "Abstain".to_string()
            },
        ];
        proposal.proposal_type = 0;
        proposal.config = Some(new);
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
