use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

pub mod instructions;
pub mod state;
pub mod errors;
pub mod utils;

use instructions::*;

#[program]
pub mod remiteasy {
    use super::*;

    /// Initialize the program state
    /// 
    /// # Arguments
    /// * `fee_percentage` - Fee percentage in basis points (100 = 1%)
    pub fn initialize(ctx: Context<Initialize>, fee_percentage: u16) -> Result<()> {
        instructions::initialize::handler(ctx, fee_percentage)
    }

    /// Create a new transfer and lock funds in escrow
    /// 
    /// # Arguments
    /// * `amount` - Amount in USDC lamports (1 USDC = 1,000,000 lamports)
    /// * `memo` - Optional memo (max 200 characters)
    pub fn send_transfer(
        ctx: Context<SendTransfer>,
        amount: u64,
        memo: String,
    ) -> Result<()> {
        instructions::send_transfer::handler(ctx, amount, memo)
    }

    /// Receive a transfer and release funds from escrow
    /// 
    /// Must be called by the recipient
    pub fn receive_transfer(ctx: Context<ReceiveTransfer>) -> Result<()> {
        instructions::receive_transfer::handler(ctx)
    }

    /// Cancel a pending transfer and return funds to sender
    /// 
    /// Must be called by the sender, only works for pending transfers
    pub fn cancel_transfer(ctx: Context<CancelTransfer>) -> Result<()> {
        instructions::cancel_transfer::handler(ctx)
    }
}