use anchor_lang::prelude::*;

mod constants;
mod contexts;
mod errors;
mod state;

use contexts::*;
use state::*;

declare_id!("ASRfYyksXtyLrLsXtEwCAjMXb7jUDcd7YPRSE1a1ECH2");

#[program]
pub mod asr {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
    }

    pub fn lock_new(
        ctx: Context<LockNew>,
        config: u8,
        permissionless: bool,
        season_duration: i64,
        voting_period: i64,
        lock_duration: i64,
        threshold: u8,
        quorum: u8,
        amount: u64,
        name: String,
        symbol: String,
    ) -> Result<()> {
        ctx.accounts.lock_new(
            &ctx.bumps,
            config,
            permissionless,
            season_duration,
            voting_period,
            lock_duration,
            threshold,
            quorum,
            amount,
            name,
            symbol,
        )
    }

    pub fn proposal_core(
        ctx: Context<ProposalCore>,
        config: u8,
        permissionless: Option<bool>,
        season_duration: Option<i64>,
        voting_period: Option<i64>,
        lock_duration: Option<i64>,
        threshold: Option<u8>,
        quorum: Option<u8>,
        amount: Option<u64>,
        name: Option<String>,
        symbol: Option<String>,
    ) -> Result<()> {
        ctx.accounts.proposal_core(
            &ctx.bumps,
            config,
            permissionless,
            season_duration,
            voting_period,
            lock_duration,
            threshold,
            quorum,
            amount,
            name,
            symbol,
        )?;
        ctx.accounts.update_analytics()
    }

    pub fn register(ctx: Context<Register>) -> Result<()> {
        ctx.accounts.register(&ctx.bumps)
    }

    pub fn manager_add(ctx: Context<ManagerAdd>) -> Result<()> {
        ctx.accounts.manager_add(&ctx.bumps)
    }

    pub fn manager_remove(ctx: Context<ManagerRemove>) -> Result<()> {
        ctx.accounts.manager_remove(&ctx.bumps)
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

    pub fn proposal_standard(
        ctx: Context<ProposalStandard>,
        title: String,
        content: String,
    ) -> Result<()> {
        ctx.accounts.proposal_standard(&ctx.bumps, title, content)?;
        ctx.accounts.update_analytics()
    }

    pub fn proposal_option(
        ctx: Context<ProposalOption>,
        title: String,
        content: String,
        choices: Vec<Choice>,
    ) -> Result<()> {
        ctx.accounts
            .proposal_option(&ctx.bumps, title, content, choices)?;
        ctx.accounts.update_analytics()
    }

    pub fn proposal_execute(ctx: Context<ProposalExecute>) -> Result<()> {
        ctx.accounts.proposal_execute()
    }

    pub fn vote_new(ctx: Context<VoteNew>, index: u64, id: u8) -> Result<()> {
        ctx.accounts.vote_new(index, id)?;
        ctx.accounts.update_analytics()
    }

    pub fn asr_deposit(ctx: Context<ASRDeposit>, amount: u64, symbol: String) -> Result<()> {
        ctx.accounts.asr_deposit(amount, symbol)
    }

    pub fn asr_claim(ctx: Context<ASRClaim>) -> Result<()> {
        ctx.accounts.asr_claim()
    }
}
