#!/usr/bin/env node

/**
 * RemitEasy Test Transaction Script
 * Tests end-to-end transaction flow
 */

const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, mintTo, transfer } = require('@solana/spl-token');
const axios = require('axios');

// Configuration
const config = {
  rpcUrl: process.env.SOLANA_RPC_URL || 'http://localhost:8899',
  apiUrl: process.env.API_URL || 'http://localhost:5000/api',
  programId: process.env.PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
  usdcMint: process.env.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
};

// Create connection
const connection = new Connection(config.rpcUrl, 'confirmed');

// Test credentials
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123'
};

let authToken = null;

// Helper function for colored console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'yellow');
}

// Test functions
async function testHealthCheck() {
  logStep('1', 'Testing API Health Check');
  
  try {
    const response = await axios.get(`${config.apiUrl.replace('/api', '')}/health`);
    logSuccess(`API is healthy: ${response.data.status}`);
    return true;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testRegistration() {
  logStep('2', 'Testing User Registration');
  
  // Generate test wallet
  const wallet = Keypair.generate();
  const walletAddress = wallet.publicKey.toBase58();
  
  logInfo(`Generated test wallet: ${walletAddress}`);
  
  try {
    const response = await axios.post(`${config.apiUrl}/auth/register`, {
      email: testUser.email,
      password: testUser.password,
      walletAddress: walletAddress
    });
    
    authToken = response.data.data.token;
    logSuccess(`User registered successfully`);
    logSuccess(`Auth token received`);
    return { success: true, wallet, walletAddress };
  } catch (error) {
    if (error.response?.status === 409) {
      logInfo('User already exists, attempting login...');
      return { success: true, skipToLogin: true };
    }
    logError(`Registration failed: ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

async function testLogin() {
  logStep('3', 'Testing User Login');
  
  try {
    const response = await axios.post(`${config.apiUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = response.data.data.token;
    logSuccess(`Login successful`);
    logSuccess(`Auth token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testProfile() {
  logStep('4', 'Testing Profile Fetch');
  
  try {
    const response = await axios.get(`${config.apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess(`Profile fetched successfully`);
    logInfo(`Email: ${response.data.data.user.email}`);
    logInfo(`Wallet: ${response.data.data.user.walletAddress}`);
    logInfo(`Total transactions: ${response.data.data.stats.total_transactions}`);
    return true;
  } catch (error) {
    logError(`Profile fetch failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testSolanaConnection() {
  logStep('5', 'Testing Solana Connection');
  
  try {
    const version = await connection.getVersion();
    logSuccess(`Connected to Solana: ${version['solana-core']}`);
    
    const slot = await connection.getSlot();
    logSuccess(`Current slot: ${slot}`);
    
    return true;
  } catch (error) {
    logError(`Solana connection failed: ${error.message}`);
    return false;
  }
}

async function testWalletBalance(walletAddress) {
  logStep('6', 'Testing Wallet Balance Check');
  
  try {
    const response = await axios.get(`${config.apiUrl}/wallets/balance`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess(`Balance fetched successfully`);
    logInfo(`SOL: ${response.data.data.solBalance}`);
    logInfo(`USDC: ${response.data.data.usdcBalance}`);
    return true;
  } catch (error) {
    logError(`Balance check failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testCreateTransaction() {
  logStep('7', 'Testing Transaction Creation');
  
  // Generate recipient
  const recipient = Keypair.generate();
  const recipientAddress = recipient.publicKey.toBase58();
  
  logInfo(`Recipient address: ${recipientAddress}`);
  
  try {
    const response = await axios.post(
      `${config.apiUrl}/transactions`,
      {
        recipientWallet: recipientAddress,
        amount: '10.50',
        memo: 'Test transaction from automated script'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const transaction = response.data.data;
    logSuccess(`Transaction created`);
    logInfo(`Transaction ID: ${transaction.id}`);
    logInfo(`Amount: ${transaction.amount} USDC`);
    logInfo(`Status: ${transaction.status}`);
    
    return { success: true, transactionId: transaction.id };
  } catch (error) {
    logError(`Transaction creation failed: ${error.response?.data?.error || error.message}`);
    return { success: false };
  }
}

async function testTransactionHistory() {
  logStep('8', 'Testing Transaction History');
  
  try {
    const response = await axios.get(`${config.apiUrl}/transactions?limit=5`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const transactions = response.data.data;
    logSuccess(`Fetched ${transactions.length} transactions`);
    
    if (transactions.length > 0) {
      logInfo(`Latest transaction: ${transactions[0].amount} USDC (${transactions[0].status})`);
    }
    
    return true;
  } catch (error) {
    logError(`Transaction history failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testRecipientManagement() {
  logStep('9', 'Testing Recipient Management');
  
  const recipient = Keypair.generate();
  const recipientAddress = recipient.publicKey.toBase58();
  
  try {
    // Create recipient
    const createResponse = await axios.post(
      `${config.apiUrl}/users/recipients`,
      {
        name: 'Test Recipient',
        walletAddress: recipientAddress
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const recipientId = createResponse.data.data.id;
    logSuccess(`Recipient created with ID: ${recipientId}`);
    
    // Get recipients
    const listResponse = await axios.get(`${config.apiUrl}/users/recipients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess(`Fetched ${listResponse.data.data.length} recipients`);
    
    // Delete recipient
    await axios.delete(`${config.apiUrl}/users/recipients/${recipientId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess(`Recipient deleted`);
    
    return true;
  } catch (error) {
    logError(`Recipient management failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testStatistics() {
  logStep('10', 'Testing Statistics Endpoints');
  
  try {
    const response = await axios.get(`${config.apiUrl}/transactions/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const stats = response.data.data;
    logSuccess(`Statistics fetched`);
    logInfo(`Total transactions: ${stats.total_transactions}`);
    logInfo(`Completed: ${stats.completed_transactions}`);
    logInfo(`Pending: ${stats.pending_transactions}`);
    logInfo(`Total volume: ${stats.total_volume} USDC`);
    
    return true;
  } catch (error) {
    logError(`Statistics fetch failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('RemitEasy End-to-End Test Suite', 'bright');
  console.log('='.repeat(60));
  
  logInfo(`API URL: ${config.apiUrl}`);
  logInfo(`Solana RPC: ${config.rpcUrl}`);
  logInfo(`Program ID: ${config.programId}`);
  console.log('');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 10
  };
  
  // Run tests
  const tests = [
    testHealthCheck,
    testRegistration,
    testLogin,
    testProfile,
    testSolanaConnection,
    testWalletBalance,
    testCreateTransaction,
    testTransactionHistory,
    testRecipientManagement,
    testStatistics
  ];
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result === true || result?.success === true) {
        results.passed++;
      } else if (result?.skipToLogin) {
        // Skip to login if registration fails because user exists
        await testLogin();
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logError(`Test crashed: ${error.message}`);
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  log('Test Results', 'bright');
  console.log('='.repeat(60));
  
  logSuccess(`Passed: ${results.passed}/${results.total}`);
  
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}/${results.total}`);
  }
  
  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${percentage}%`, percentage >= 80 ? 'green' : 'red');
  
  console.log('\n');
  
  if (results.failed === 0) {
    log('🎉 All tests passed! System is working correctly.', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
RemitEasy End-to-End Test Script

Usage:
  node test-transaction.js [options]

Options:
  --help, -h          Show this help message
  --api-url URL       Backend API URL (default: http://localhost:5000/api)
  --rpc-url URL       Solana RPC URL (default: http://localhost:8899)

Environment Variables:
  API_URL            Backend API URL
  SOLANA_RPC_URL     Solana RPC endpoint
  PROGRAM_ID         Deployed program ID
  USDC_MINT          USDC token mint address

Examples:
  node test-transaction.js
  node test-transaction.js --api-url https://api.remiteasy.com/api
  API_URL=https://api.remiteasy.com/api node test-transaction.js
  `);
  process.exit(0);
}

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api-url' && args[i + 1]) {
    config.apiUrl = args[i + 1];
  }
  if (args[i] === '--rpc-url' && args[i + 1]) {
    config.rpcUrl = args[i + 1];
  }
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});