# ASR

Active Staking Rewards, inspired by [vote.jup.ag](https://vote.jup.ag/).

Fueling B2C Power-User Feedback

## Introduction

This program is a heavily-modified version of my previous hackathon winning [dao program](https://github.com/mael-bomane/dao).

Previously : 
- 10mb account size limit = max ~ 320k votes + deposits / project (max 32k users /w 10 votes per project)
- no voting rewards
- no token lock

Now :
- 10mb account size limit = max ~ 380k votes per user (unlimited users per project)
- voting rewards
- configurable token lock :

## Instructions

All instructions are heavily tested in [/tests]('/tests/asr.ts')

### Initialize

this instruction initialize global analytics.

### LockNew

create a new ASR lock (unique per mint per user), subject to changes.

configuration parameters :

- config (u8) : only 0 is valid for now
- permissionless : if `true`, anyone can create/execute proposals, deposit ASR tokens (potential spam), if `false` these actions are restricted to a team of managers. signer is the 1st manager, quorum isn't checked on manager/add remove but these proposals types does not contribute to voter rewards and non-managers can't vote on these neither.
- season_duration : min 1 week, max 3 months
- voting_period : min 24h, max 1 week
- lock_duration: no minimum, up to 3 months
- threshold: approval threshold for proposals considered approved
- quorum : % of total deposits required for proposals considered valid
- mint : mint selected to lock
- amount : `UI amount * 1 * 10 ** mint.decimals` staked deposits required to start a proposal
- name : lock name
- symbol : token symbol (todo: parse metadata from program for this)

### Register

Register a user to a lock

### Stake New 

Stake user tokens for voting power on a lock.

### Stake Deactivate 

Deactivate all user deposits, but user can still vote with decaying voting power.

Deposits are set to be claimed at `now + lock.config.lock_duration`.

### Stake Claim 

Claim deposits who are both deactivating, and `now > (deposit.deactivation_start + lock.config.lock_duration)`.

### Vote

Vote on a proposal

### Proposal Core
(restricted to managers if lock is not permissionless)

Proposal to change all lock configuration values except the mint.

All values are optional, the program clones the previous config and create a proposal with requested changes, changes are applied on proposal execution.

### Proposal Standard
(restricted to managers if lock is not permissionless)

Standard Proposal with 3 default Choices : "For", "Against" & "Abstain".

Best for Yes/No question/answer, and for B2C Power-User Feedback.

### Proposal Option
(restricted to managers if lock is not permissionless)

Proposal with choices between 0 and 255 defined by user.

### Proposal Manager Add/Remove
(restricted to managers if lock is not permissionless)

Add or remove a manager based on his registered user pda owner (still requires registration on lock & staked token).

Only managers can vote on these proposal types, quorum isn't checked but they don't contribute to voter season rewards.

### Proposal Execute
(restricted to managers if lock is not permissionless)

Execute a proposal

### ASR Deposit
(restricted to managers if lock is not permissionless)

Deposit a token to be claimed at current season_end for users who voted this season.

### ASR Claim 

Claim ASR Tokens for previous Season (impossible at Season 0), your share is relative to your share of the lock total deposits.
