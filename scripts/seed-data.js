#!/usr/bin/env node

/**
 * RemitEasy Database Seeding Script
 * Seeds the database with test data for development
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/remiteasy_dev'
});

// Test data
const testUsers = [
  {
    email: 'alice@example.com',
    password: 'Password123',
    walletAddress: '7EqQdEUPxCLC42BqvgePu1KqVYmKRN3hbfYTpvFhZ9vw'
  },
  {
    email: 'bob@example.com',
    password: 'Password123',
    walletAddress: 'G7j8kFqx9Y3wKm2p5NrHt8uDvL6cB1sA4eR3jT9qW5xZ'
  },
  {
    email: 'charlie@example.com',
    password: 'Password123',
    walletAddress: 'FnXY4mR8vK6wL9pT3uH2bD7cE1gJ5sN8oQ6aZ4rW3xM'
  }
];

const testRecipients = [
  {
    userEmail: 'alice@example.com',
    name: 'Mom',
    walletAddress: 'A9mKnL7pR3tY6wH4vB8cD2eF5gJ1sN9oQ3xZ6uT4rW8'
  },
  {
    userEmail: 'alice@example.com',
    name: 'Brother',
    walletAddress: 'B2dF5gH8jK1mN4pQ7rT9vX3yZ6bC9eG2hJ5kL8nM1oP'
  },
  {
    userEmail: 'bob@example.com',
    name: 'Sister',
    walletAddress: 'C3eG6hJ9kM2nP5qR8sU1vY4zA7cE0fH3iK6lN9oQ2rS'
  }
];

const testTransactions = [
  {
    senderEmail: 'alice@example.com',
    recipientWallet: 'A9mKnL7pR3tY6wH4vB8cD2eF5gJ1sN9oQ3xZ6uT4rW8',
    amount: '100.50',
    status: 'completed',
    memo: 'Monthly support',
    signature: '5J2gyARvRqxZqQf2LFfWZj7qKz9XmY8TcP4NbH3DxGkV6rS1wE9uL8mQ4pT7vR2nK'
  },
  {
    senderEmail: 'alice@example.com',
    recipientWallet: 'B2dF5gH8jK1mN4pQ7rT9vX3yZ6bC9eG2hJ5kL8nM1oP',
    amount: '50.00',
    status: 'completed',
    memo: 'Birthday gift',
    signature: '2G4jxBQwSpyAqRf3MGgYZk8rL0YnN9UdQe5OcI4EyHlW7sT2xF0vM9nR5qU8wS3oL'
  },
  {
    senderEmail: 'bob@example.com',
    recipientWallet: 'C3eG6hJ9kM2nP5qR8sU1vY4zA7cE0fH3iK6lN9oQ2rS',
    amount: '200.00',
    status: 'pending',
    memo: 'Rent payment',
    signature: null
  }
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await client.query('TRUNCATE TABLE recipients CASCADE');
    await client.query('TRUNCATE TABLE transactions CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE recipients_id_seq RESTART WITH 1');
    console.log('✅ Data cleared');

    // Seed users
    console.log('\n👥 Seeding users...');
    const userIds = {};
    
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const result = await client.query(
        'INSERT INTO users (email, password_hash, wallet_address) VALUES ($1, $2, $3) RETURNING id',
        [user.email, hashedPassword, user.walletAddress]
      );
      
      userIds[user.email] = result.rows[0].id;
      console.log(`  ✓ Created user: ${user.email} (ID: ${userIds[user.email]})`);
    }

    // Seed recipients
    console.log('\n📋 Seeding recipients...');
    
    for (const recipient of testRecipients) {
      const userId = userIds[recipient.userEmail];
      
      await client.query(
        'INSERT INTO recipients (user_id, name, wallet_address) VALUES ($1, $2, $3)',
        [userId, recipient.name, recipient.walletAddress]
      );
      
      console.log(`  ✓ Created recipient: ${recipient.name} for ${recipient.userEmail}`);
    }

    // Seed transactions
    console.log('\n💸 Seeding transactions...');
    
    for (const transaction of testTransactions) {
      const senderId = userIds[transaction.senderEmail];
      
      const completedAt = transaction.status === 'completed' ? new Date() : null;
      
      await client.query(
        'INSERT INTO transactions (sender_id, recipient_wallet, amount, status, memo, signature, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [senderId, transaction.recipientWallet, transaction.amount, transaction.status, transaction.memo, transaction.signature, completedAt]
      );
      
      console.log(`  ✓ Created transaction: ${transaction.senderEmail} -> ${transaction.amount} USDC (${transaction.status})`);
    }

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('Database Seeding Complete! 🎉');
    console.log('='.repeat(50));
    
    console.log('\nTest Accounts:');
    testUsers.forEach(user => {
      console.log(`  📧 ${user.email}`);
      console.log(`  🔑 ${user.password}`);
      console.log(`  💼 ${user.walletAddress}`);
      console.log('');
    });

    console.log('Summary:');
    console.log(`  👥 Users: ${testUsers.length}`);
    console.log(`  📋 Recipients: ${testRecipients.length}`);
    console.log(`  💸 Transactions: ${testTransactions.length}`);
    
    console.log('\n✅ You can now log in with any test account!');
    console.log('💡 All test accounts use password: Password123');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
RemitEasy Database Seeding Script

Usage:
  node seed-data.js [options]

Options:
  --help, -h     Show this help message
  --clear        Clear database without seeding

Environment Variables:
  DATABASE_URL   PostgreSQL connection string
                 Default: postgresql://localhost:5432/remiteasy_dev

Examples:
  node seed-data.js
  DATABASE_URL=postgresql://user:pass@host:5432/db node seed-data.js
  node seed-data.js --clear
  `);
  process.exit(0);
}

if (args.includes('--clear')) {
  (async () => {
    try {
      await client.connect();
      console.log('Clearing database...');
      await client.query('TRUNCATE TABLE recipients CASCADE');
      await client.query('TRUNCATE TABLE transactions CASCADE');
      await client.query('TRUNCATE TABLE users CASCADE');
      console.log('✅ Database cleared');
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      await client.end();
    }
  })();
} else {
  seedDatabase();
}