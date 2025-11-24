use anchor_lang::prelude::*;

/// Custom error codes for RemitEasy program
#[error_code]
pub enum RemitEasyError {
    #[msg("Transfer amount must be greater than zero")]
    InvalidAmount,
    
    #[msg("Transfer has already been completed")]
    TransferAlreadyCompleted,
    
    #[msg("Transfer has been cancelled")]
    TransferCancelled,
    
    #[msg("Only the sender can cancel this transfer")]
    UnauthorizedCancellation,
    
    #[msg("Only the recipient can receive this transfer")]
    UnauthorizedReceipt,
    
    #[msg("Memo is too long (max 200 characters)")]
    MemoTooLong,
    
    #[msg("Invalid fee percentage (max 100 basis points = 1%)")]
    InvalidFeePercentage,
    
    #[msg("Insufficient balance in escrow account")]
    InsufficientEscrowBalance,
    
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,
    
    #[msg("Transfer is not in pending status")]
    TransferNotPending,
}