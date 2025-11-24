use anchor_lang::prelude::*;

/// Calculate fee based on amount and fee percentage
pub fn calculate_fee(amount: u64, fee_percentage: u16) -> u64 {
    ((amount as u128)
        .checked_mul(fee_percentage as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap()) as u64
}

/// Validate that an amount is not zero
pub fn validate_amount(amount: u64) -> Result<()> {
    require!(amount > 0, crate::errors::RemitEasyError::InvalidAmount);
    Ok(())
}

/// Validate memo length
pub fn validate_memo(memo: &str) -> Result<()> {
    require!(memo.len() <= 200, crate::errors::RemitEasyError::MemoTooLong);
    Ok(())
}

/// Convert USDC lamports to human-readable amount
pub fn lamports_to_usdc(lamports: u64) -> f64 {
    lamports as f64 / 1_000_000.0
}

/// Convert human-readable USDC to lamports
pub fn usdc_to_lamports(usdc: f64) -> u64 {
    (usdc * 1_000_000.0) as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_fee() {
        // Test 1% fee (100 basis points)
        assert_eq!(calculate_fee(1_000_000, 100), 10_000); // 1 USDC -> 0.01 USDC
        
        // Test 0.5% fee (50 basis points)
        assert_eq!(calculate_fee(1_000_000, 50), 5_000); // 1 USDC -> 0.005 USDC
        
        // Test 0% fee
        assert_eq!(calculate_fee(1_000_000, 0), 0);
    }

    #[test]
    fn test_lamports_conversion() {
        assert_eq!(lamports_to_usdc(1_000_000), 1.0);
        assert_eq!(lamports_to_usdc(500_000), 0.5);
        assert_eq!(usdc_to_lamports(1.0), 1_000_000);
        assert_eq!(usdc_to_lamports(0.5), 500_000);
    }
}
