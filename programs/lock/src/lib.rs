use anchor_lang::prelude::*;

mod constants;
mod contexts;
mod errors;
mod state;

use contexts::*;
use state::*;

declare_id!("4vqVPmSjNpfPhHpJi9FgMBnabKgK5oFyNJwgFnKtN4yp");

#[program]
pub mod lock {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
    }

    pub fn lock_new(
        ctx: Context<LockNew>,
        config: u8,
        voting_period: i64,
        lock_duration: i64,
        threshold: u8,
        quorum: u8,
        min: u64,
        name: String,
    ) -> Result<()> {
        ctx.accounts.lock_new(
            &ctx.bumps,
            config,
            voting_period,
            lock_duration,
            threshold,
            quorum,
            min,
            name,
        )?;
        ctx.accounts.update_analytics()
    }

    pub fn register(ctx: Context<Register>) -> Result<()> {
        ctx.accounts.register(&ctx.bumps)
    }

    pub fn stake_new(ctx: Context<StakeNew>, amount: u64) -> Result<()> {
        ctx.accounts.stake_new(amount)
    }

    pub fn stake_deactivate(ctx: Context<StakeDeactivate>) -> Result<()> {
        ctx.accounts.stake_deactivate()
    }

    pub fn stake_claim(ctx: Context<StakeClaim>) -> Result<()> {
        ctx.accounts.stake_claim()
    }

    pub fn poll_new(ctx: Context<PollNew>, title: String, choices: Vec<Choice>) -> Result<()> {
        ctx.accounts.poll_new(&ctx.bumps, title, choices)?;
        ctx.accounts.update_analytics()
    }

    pub fn poll_execute(ctx: Context<PollExecute>) -> Result<()> {
        ctx.accounts.poll_execute()
    }

    pub fn vote_new(ctx: Context<VoteNew>, index: u64, id: u8) -> Result<()> {
        ctx.accounts.vote_new(index, id)?;
        ctx.accounts.update_analytics()
    }
}