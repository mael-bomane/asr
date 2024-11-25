use crate::{
    errors::ErrorCode, state::{Analytics, Lock, Proposal, Status, Season, ASR}
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ProposalExecute<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        realloc = Lock::LEN 
        + (if Clock::get()?.unix_timestamp > lock.seasons[lock.seasons.len() - 1].season_end {
            (lock.seasons.len() + 1) * Season::LEN
        } else {
            lock.seasons.len() * Season::LEN
        })
        + lock.total_asr() * ASR::LEN,
        realloc::zero = false,
        realloc::payer = owner,
        seeds = [b"lock", lock.creator.as_ref(), lock.config.mint.as_ref()],
        bump = lock.lock_bump, 
        constraint = if !lock.config.permissionless { 
            lock.config.managers.iter().any(|i| i == &owner.key())
        } else { true } @ ErrorCode::UnauthorizedManagersOnly
    )]
    pub lock: Box<Account<'info, Lock>>,
    #[account(
        mut,
        seeds = [b"proposal", lock.key().as_ref(), proposal.id.to_le_bytes().as_ref()],
        bump = proposal.bump,
        constraint = !proposal.executed @ ErrorCode::PollAlreadyExecuted,
        constraint = Clock::get()?.unix_timestamp > proposal.ends_at @ ErrorCode::WaitForVotingPeriodToEnd 
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

impl<'info> ProposalExecute<'info> {
    pub fn proposal_execute(&mut self) -> Result<()> {
        let lock = &mut self.lock;

        let proposal = &mut self.proposal;
        let analytics = &mut self.analytics;
        
        let (result, is_approved, total_power, status) = proposal.result(&lock);
        
        match proposal.proposal_type {
            // lock settings proposal
            0 => {
                match is_approved {
                    true => {
                        lock.approved += 1;
                        analytics.approved += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        match result {
                            Some(r) => {
                                proposal.result = Some(r.clone());
                                if r.id == 0 {
                                    lock.config = proposal.config.clone().unwrap()
                                }
                            },
                            None => proposal.result = None,
                        }
                    },
                    false => {
                        lock.rejected += 1;
                        analytics.rejected += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        proposal.result = None;
                    }
                }
            },
            // standard proposal
            1 => {
                match is_approved {
                    true => {
                        lock.approved += 1;
                        analytics.approved += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        proposal.result = result;
                    },
                    false => {
                        lock.rejected += 1;
                        analytics.rejected += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        proposal.result = None;
                    }
                }
            },
            // add manager proposal
            2 => {
                match is_approved {
                    true => {
                        lock.approved += 1;
                        analytics.approved += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        match result {
                            Some(r) => {
                                proposal.result = Some(r.clone());
                                if r.id == 0 {
                            lock.config.managers.push(proposal.manager.clone().unwrap())
                                }
                            },
                            None => proposal.result = None,
                        }
                    },
                    false => {
                        lock.rejected += 1;
                        analytics.rejected += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        proposal.result = None;
                    }
                }
            },
            // remove manager proposal
            3 => {
                match is_approved {
                    true => {
                        lock.approved += 1;
                        analytics.approved += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        match result {
                            Some(r) => {
                                proposal.result = Some(r.clone());
                                if r.id == 0 {
                                    let index = lock.config.managers.iter().position(|x| *x == proposal.manager.clone().unwrap()).unwrap();
                                    lock.config.managers.remove(index);
                                }
                            },
                            None => proposal.result = None,
                        }
                    },
                    false => {
                        lock.rejected += 1;
                        analytics.rejected += 1;
                        proposal.executed = true;
                        proposal.status = status;
                        proposal.result = None;
                    }
                }
            },
            _ => {
                ()
            }
        }
        
        let mut season = lock.seasons.clone().into_iter().find(|season| season.season == proposal.season).unwrap();
        season.points += total_power;

        let now = Clock::get()?.unix_timestamp;
        if now > season.season_end {
            let season_duration = lock.config.season_duration;
            lock.seasons.push(Season {
                season: season.season + 1,
                points: 0,
                asr: Vec::new(),
                season_start: now,
                season_end: now + season_duration 
            })
        }

        let _ = std::mem::replace(&mut lock.seasons[season.season as usize], season);

        Ok(())
    }
}

