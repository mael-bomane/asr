use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Locker Name Empty.")]
    LockerNameEmpty,
    #[msg("Locker Name Too Long, 50 Characters Max.")]
    LockerNameTooLong,
    #[msg("Poll Title Empty.")]
    PollTitleEmpty,
    #[msg("Poll Title Too Long, 50 Characters Max.")]
    PollTitleTooLong,
    #[msg("Poll Content Empty.")]
    PollContentEmpty,
    #[msg("Poll Content Too Long, 280 Characters Max.")]
    PollContentTooLong,
    #[msg("Voting Period Out Of Bounds : Min 1 Day, Max 1 Week")]
    VotingPeriodOutOfBounds,
    #[msg("Lock Duration Out Of Bounds : Min 1 Month, Max 5 Years")]
    LockDurationOutOfBounds,
    #[msg("Invalid Lock Duration")]
    InvalidLockDuration,
    #[msg("Threshold Out Of Bounds : Min 50%, Max 100%")]
    ThresholdOutOfBounds,
    #[msg("Quorum Out Of Bounds : Min 0%, Max 100%")]
    QuorumOutOfBounds,
    #[msg("Wrong Locker Mint")]
    WrongLockerMint,
    #[msg("Not Enough Deposits To Start Poll.")]
    NotEnoughDepositsToStartPoll,
    #[msg("No Deposits For This User In This Locker")]
    NoDepositsForThisUserInThisLocker,
    #[msg("No Voting Power For This User Found In This Lock")]
    UserHaveNoVotingPowerInThisLock,
    #[msg("Voting Period Expired.")]
    VotingPeriodExpired,
    #[msg("User Already Voted This Poll.")]
    UserAlreadyVotedThisPoll,
    #[msg("Wait For Voting Period To End.")]
    WaitForVotingPeriodToEnd,
    #[msg("Poll Already Executed.")]
    PollAlreadyExecuted,
    #[msg("No Deposits Ready To Claim For This User In This Locker")]
    NoDepositsReadyToClaimForThisUserInThisLocker,
    #[msg("Config Unrecognized")]
    ConfigUnrecognized,
    #[msg("Instruction Unavailable For This Lock")]
    InstructionUnavailableForThisLock,
}