use anchor_lang::prelude::*;

/// Global program state account
/// 
/// Stores configuration and statistics for the entire program
#[account]
pub struct ProgramState {
    /// Program administrator public key
    pub admin: Pubkey,
    
    /// Fee percentage in basis points (100 = 1%)
    pub fee_percentage: u16,
    
    /// Total number of transfers created
    pub total_transfers: u64,
    
    /// Total volume of USDC transferred (in lamports)
    pub total_volume: u64,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl ProgramState {
    /// Size of the account in bytes
    /// 8 (discriminator) + 32 (admin) + 2 (fee) + 8 (transfers) + 8 (volume) + 1 (bump)
    pub const LEN: usize = 8 + 32 + 2 + 8 + 8 + 1;
}

/// Individual transfer account
/// 
/// Represents a single remittance transaction
#[account]
pub struct TransferAccount {
    /// Sender's public key
    pub sender: Pubkey,
    
    /// Recipient's public key
    pub recipient: Pubkey,
    
    /// Transfer amount in USDC lamports (1 USDC = 1,000,000 lamports)
    pub amount: u64,
    
    /// Current status of the transfer
    pub status: TransferStatus,
    
    /// Unix timestamp when transfer was created
    pub created_at: i64,
    
    /// Unix timestamp when transfer was completed (if applicable)
    pub completed_at: Option<i64>,
    
    /// Optional memo/note for the transfer (max 200 characters)
    pub memo: String,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl TransferAccount {
    /// Maximum size of the account in bytes
    /// 8 (discriminator) + 32 (sender) + 32 (recipient) + 8 (amount) + 
    /// 1 (status enum) + 8 (created_at) + 9 (Option<i64>) + 204 (String with 200 chars) + 1 (bump)
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + 8 + 9 + 204 + 1;
    
    /// Maximum memo length in characters
    pub const MAX_MEMO_LENGTH: usize = 200;
    
    /// Check if transfer is pending
    pub fn is_pending(&self) -> bool {
        self.status == TransferStatus::Pending
    }
    
    /// Check if transfer is completed
    pub fn is_completed(&self) -> bool {
        self.status == TransferStatus::Completed
    }
    
    /// Check if transfer is cancelled
    pub fn is_cancelled(&self) -> bool {
        self.status == TransferStatus::Cancelled
    }
    
    /// Get transfer duration in seconds (if completed)
    pub fn duration(&self) -> Option<i64> {
        self.completed_at.map(|completed| completed - self.created_at)
    }
}

/// Transfer status enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum TransferStatus {
    /// Transfer is pending, funds locked in escrow
    Pending,
    
    /// Transfer completed, funds released to recipient
    Completed,
    
    /// Transfer cancelled, funds returned to sender
    Cancelled,
}

impl Default for TransferStatus {
    fn default() -> Self {
        TransferStatus::Pending
    }
}