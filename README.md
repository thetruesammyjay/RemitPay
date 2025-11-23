# RemitEasy

A cross-border remittance platform leveraging Solana and USDC to provide instant, low-cost international money transfers with focus on high-fee corridors.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Technical Architecture](#technical-architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Team](#team)
- [Acknowledgments](#acknowledgments)

## Overview

RemitEasy is a decentralized remittance platform that enables users to send money across borders instantly and at minimal cost. Built on Solana's high-performance blockchain and utilizing Circle's USDC stablecoin, RemitEasy eliminates traditional banking intermediaries that charge 5-10% in fees and take 3-7 days for settlement.

**Track:** Solana Main Track + Circle/USDC Bounty

**Demo Video:** [Link to video]

**Live Demo:** [Link to deployed application]

**Deployed Program Address:** [Solana program address]

## Problem Statement

Traditional remittance services present significant barriers for cross-border money transfers:

- **High Fees:** Services like Western Union and MoneyGram charge 5-10% per transaction
- **Slow Settlement:** Traditional transfers take 3-7 business days
- **Limited Access:** Many corridors have poor service coverage, especially in emerging markets
- **Hidden Costs:** Exchange rate markups add 2-4% to advertised fees
- **Geographical Restrictions:** Recipients often must travel to physical locations for pickup

For remittance corridors like US-Nigeria, US-Philippines, and US-Mexico, these issues are particularly acute, affecting millions of families who depend on these transfers for essential expenses.

## Solution

RemitEasy provides a modern alternative using blockchain technology:

- **Low Cost:** Transactions cost less than $0.01 on Solana, compared to $5-50 with traditional services
- **Instant Settlement:** Transfers complete in under 5 seconds
- **Global Access:** Anyone with internet and a smartphone can send or receive
- **Transparent Pricing:** No hidden fees or exchange rate manipulation
- **Direct to Wallet:** Recipients get funds directly to their digital wallet
- **24/7 Availability:** No business hours or holiday restrictions

## Technical Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Frontend Web   │────────▶│   Backend API    │────────▶│  Solana Network │
│   (React.js)    │         │   (Node.js)      │         │   (Devnet/Main) │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                           │                             │
        │                           │                             │
        ▼                           ▼                             ▼
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Solana Wallet  │         │   Circle API     │         │  Smart Contract │
│   (Phantom)     │         │   (USDC)         │         │   (Rust/Anchor) │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Component Breakdown

**Frontend Layer:**
- React.js application with responsive design
- Solana Wallet Adapter for wallet connections
- Real-time transaction status updates
- Exchange rate calculator with live pricing

**Backend Layer:**
- Node.js/Express API server
- Transaction processing and validation
- Rate limiting and fraud detection
- Database for transaction history and user data

**Blockchain Layer:**
- Anchor program for escrow and settlement logic
- USDC token integration via SPL Token program
- Transaction finality monitoring
- Program derived addresses (PDAs) for secure fund custody

**External Integrations:**
- Circle APIs for USDC operations
- Exchange rate APIs for fiat conversion
- KYC/AML verification services (compliance layer)

## Features

### Core Features

- **Instant Transfers:** Send USDC across borders in under 5 seconds
- **Multi-Wallet Support:** Compatible with Phantom, Solflare, and other Solana wallets
- **Transaction History:** Complete record of all sent and received transfers
- **Exchange Rate Calculator:** Real-time conversion rates for major currencies
- **Recipient Management:** Save frequent recipients for quick transfers
- **Email Notifications:** Automated alerts for transaction status

### Security Features

- **Escrow Protection:** Funds held in program-controlled accounts until confirmation
- **Transaction Limits:** Configurable daily and per-transaction limits
- **Two-Factor Authentication:** Optional 2FA for added account security
- **Fraud Detection:** Monitoring for suspicious patterns
- **Non-Custodial:** Users maintain control of their private keys

### User Experience Features

- **Simple Onboarding:** Account creation in under 2 minutes
- **Mobile Responsive:** Works seamlessly on all device sizes
- **Multi-Language Support:** English, Spanish, Tagalog, and more
- **Tutorial Walkthroughs:** Interactive guides for first-time users
- **24/7 Support:** Automated chatbot with escalation to human support

## Technology Stack

### Frontend
- **Framework:** React.js 18.2
- **Styling:** Tailwind CSS 3.3
- **State Management:** Redux Toolkit
- **Wallet Integration:** @solana/wallet-adapter-react
- **Web3 Library:** @solana/web3.js

### Backend
- **Runtime:** Node.js 18.x
- **Framework:** Express.js 4.18
- **Database:** PostgreSQL 15
- **Caching:** Redis 7.0
- **API Documentation:** Swagger/OpenAPI 3.0

### Blockchain
- **Network:** Solana (Devnet for development, Mainnet for production)
- **Program Framework:** Anchor 0.29
- **Language:** Rust 1.70
- **Token Standard:** SPL Token (USDC)

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (frontend), Railway (backend)
- **Monitoring:** Datadog, Sentry

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js:** v18.x or higher
- **npm or yarn:** Latest stable version
- **Rust:** v1.70 or higher
- **Solana CLI:** v1.17 or higher
- **Anchor CLI:** v0.29 or higher
- **Docker:** v20.x or higher (optional, for containerized development)
- **PostgreSQL:** v15 or higher
- **Git:** Latest version

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/thetruesammyjay/remiteasy.git
cd remiteasy
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

### 4. Install Smart Contract Dependencies

```bash
cd ../program
anchor build
```

### 5. Database Setup

```bash
# Create PostgreSQL database
createdb remiteasy_dev

# Run migrations
cd ../backend
npm run migrate
```

## Local Development

### 1. Start Solana Local Validator

```bash
# In a new terminal
solana-test-validator
```

### 2. Deploy Smart Contract to Local Network

```bash
cd program
anchor deploy
# Copy the program ID and update in Anchor.toml and frontend config
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 4. Start Frontend Development Server

```bash
cd frontend
npm run dev
# Application runs on http://localhost:3000
```

### 5. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Frontend (.env)

```bash
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
REACT_APP_PROGRAM_ID=your_program_id_here
REACT_APP_API_URL=http://localhost:5000
REACT_APP_USDC_MINT=your_usdc_mint_address
```

### Backend (.env)

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/remiteasy_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
CIRCLE_API_KEY=your_circle_api_key
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_backend_wallet_private_key
PROGRAM_ID=your_program_id_here
```

## Project Structure

```
remiteasy/
├── frontend/                      # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   ├── Logo.svg
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Logo.jsx            
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── transfer/
│   │   │   │   ├── TransferForm.jsx
│   │   │   │   ├── RecipientSelector.jsx
│   │   │   │   ├── AmountInput.jsx
│   │   │   │   └── TransactionStatus.jsx
│   │   │   └── wallet/
│   │   │       ├── WalletConnect.jsx
│   │   │       └── WalletBalance.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Send.jsx
│   │   │   ├── Receive.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Recipients.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useWallet.js
│   │   │   ├── useTransaction.js
│   │   │   └── useExchangeRate.js
│   │   ├── services/             # API service layer
│   │   │   ├── api.js
│   │   │   ├── solana.js
│   │   │   └── wallet.js
│   │   ├── store/                # Redux store
│   │   │   ├── index.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── transactionSlice.js
│   │   │   │   └── walletSlice.js
│   │   │   └── middleware/
│   │   ├── utils/                # Utility functions
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── styles/               # Global styles
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                       # Node.js backend API
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   ├── userController.js
│   │   │   └── walletController.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimit.js
│   │   │   └── validation.js
│   │   ├── models/               # Database models
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   ├── Recipient.js
│   │   │   └── Wallet.js
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   ├── users.js
│   │   │   └── wallets.js
│   │   ├── services/             # Business logic
│   │   │   ├── circleService.js
│   │   │   ├── solanaService.js
│   │   │   ├── exchangeRateService.js
│   │   │   └── notificationService.js
│   │   ├── utils/                # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── config/               # Configuration files
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   └── solana.js
│   │   ├── db/                   # Database migrations
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── server.js             # Entry point
│   ├── tests/                    # Test files
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   └── .env.example
│
├── program/                       # Solana smart contract
│   ├── programs/
│   │   └── remiteasy/
│   │       ├── src/
│   │       │   ├── lib.rs        # Main program entry
│   │       │   ├── state.rs      # State structures
│   │       │   ├── instructions/ # Instruction handlers
│   │       │   │   ├── mod.rs
│   │       │   │   ├── initialize.rs
│   │       │   │   ├── send_transfer.rs
│   │       │   │   ├── receive_transfer.rs
│   │       │   │   └── cancel_transfer.rs
│   │       │   ├── errors.rs     # Custom error types
│   │       │   └── utils.rs      # Helper functions
│   │       └── Cargo.toml
│   ├── tests/
│   │   └── remiteasy.ts          # Integration tests
│   ├── migrations/
│   │   └── deploy.ts
│   ├── Anchor.toml
│   ├── Cargo.toml
│   └── package.json
│
├── docs/                          # Additional documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── scripts/                       # Utility scripts
│   ├── deploy.sh
│   ├── seed-data.js
│   └── test-transaction.js
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── Dockerfile
├── .gitignore
├── LICENSE
└── README.md
```

## Smart Contract

### Program Overview

The RemitEasy smart contract is built using the Anchor framework and handles the core remittance logic on Solana.

### Key Instructions

**initialize**
- Initializes the program state
- Sets up escrow accounts for holding funds
- Parameters: admin public key, fee percentage

**send_transfer**
- Transfers USDC from sender to escrow
- Creates transfer record with recipient details
- Parameters: amount, recipient address, memo

**receive_transfer**
- Releases funds from escrow to recipient
- Updates transfer status to completed
- Parameters: transfer ID

**cancel_transfer**
- Returns funds to sender if not yet received
- Only callable by original sender
- Parameters: transfer ID

### State Accounts

**TransferAccount**
```rust
pub struct TransferAccount {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub status: TransferStatus,
    pub created_at: i64,
    pub completed_at: Option<i64>,
    pub memo: String,
}
```

**ProgramState**
```rust
pub struct ProgramState {
    pub admin: Pubkey,
    pub fee_percentage: u16,
    pub total_transfers: u64,
    pub total_volume: u64,
}
```

### Deployed Program

**Devnet:** [Your devnet program ID]
**Mainnet:** [Your mainnet program ID when deployed]

## API Endpoints

### Authentication

```
POST   /api/auth/register          # Create new user account
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/verify            # Verify JWT token
POST   /api/auth/refresh           # Refresh access token
```

### Transactions

```
POST   /api/transactions/send      # Initiate new transfer
GET    /api/transactions           # Get user transaction history
GET    /api/transactions/:id       # Get specific transaction
POST   /api/transactions/:id/cancel # Cancel pending transaction
GET    /api/transactions/stats     # Get transaction statistics
```

### Wallets

```
GET    /api/wallets/balance        # Get wallet USDC balance
POST   /api/wallets/connect        # Connect wallet to account
GET    /api/wallets/transactions   # Get wallet transaction history
```

### Recipients

```
GET    /api/recipients             # Get saved recipients
POST   /api/recipients             # Add new recipient
PUT    /api/recipients/:id         # Update recipient
DELETE /api/recipients/:id         # Delete recipient
```

### Rates

```
GET    /api/rates/exchange         # Get current exchange rates
GET    /api/rates/fees             # Get platform fee structure
```

For detailed API documentation, see [docs/API.md](docs/API.md)

## Testing

### Running Frontend Tests

```bash
cd frontend
npm test                  # Run all tests
npm test -- --coverage    # Run with coverage report
```

### Running Backend Tests

```bash
cd backend
npm test                  # Run all tests
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:coverage     # Generate coverage report
```

### Running Smart Contract Tests

```bash
cd program
anchor test              # Run all program tests
anchor test --skip-local-validator  # Test against devnet
```

### End-to-End Testing

```bash
# From project root
npm run test:e2e
```

## Deployment

### Deploying Smart Contract

**To Devnet:**
```bash
cd program
anchor build
solana config set --url devnet
anchor deploy
```

**To Mainnet:**
```bash
cd program
anchor build
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
```

### Deploying Backend

**Using Railway:**
```bash
cd backend
railway login
railway init
railway up
```

### Deploying Frontend

**Using Vercel:**
```bash
cd frontend
vercel login
vercel --prod
```

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Usage Guide

### For Senders

1. **Connect Wallet:** Click "Connect Wallet" and select your Solana wallet
2. **Enter Amount:** Specify the amount in USD you want to send
3. **Select Recipient:** Choose from saved recipients or enter new wallet address
4. **Review & Send:** Confirm exchange rate and fees, then approve transaction
5. **Track Status:** Monitor real-time status in transaction history

### For Recipients

1. **Receive Notification:** Get email/SMS when funds are sent to your wallet
2. **Connect Wallet:** Open RemitEasy and connect your wallet
3. **View Balance:** See incoming transfer in your dashboard
4. **Withdraw (Optional):** Convert USDC to local currency via partner exchanges

### For Developers

Integrate RemitEasy into your application:

```javascript
import { RemitEasySDK } from '@remiteasy/sdk';

const remitEasy = new RemitEasySDK({
  network: 'mainnet-beta',
  apiKey: 'your_api_key'
});

// Send transfer
const transfer = await remitEasy.sendTransfer({
  recipient: 'recipient_wallet_address',
  amount: 100.00,
  currency: 'USD'
});
```

## Security Considerations

### Smart Contract Security

- All funds held in program-derived addresses (PDAs)
- Transfer instructions validate sender authority
- Reentrancy protection on all state-modifying instructions
- Comprehensive input validation and sanitization

### Backend Security

- JWT-based authentication with short-lived tokens
- Rate limiting on all endpoints (100 requests/minute)
- SQL injection prevention via parameterized queries
- XSS protection with content security policy
- HTTPS enforced in production

### Frontend Security

- No private keys stored in browser
- All sensitive operations require wallet signature
- Input sanitization on all user inputs
- CORS properly configured

### Audit Status

Smart contract audit: [Pending/Link to audit report]

## Future Roadmap

### Phase 1 (Post-Hackathon)
- Add support for more currency corridors
- Integrate additional DEX aggregators for better rates
- Implement mobile native apps (iOS/Android)
- Add fiat on/off ramp partnerships

### Phase 2 (Q1 2026)
- Multi-chain support (Base, Polygon)
- Batch transfer capabilities
- Business/merchant accounts
- API for third-party integrations

### Phase 3 (Q2 2026)
- Recurring transfers/subscriptions
- Smart contracts for scheduled payments
- Advanced analytics dashboard
- White-label solution for partners

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

- **Samuel Justin Ifiezibe ** - Full-Stack Developer
  - GitHub: [@thetruesammyjay]
  - Email: sammyjayisthename@gmail.com



## Acknowledgments

- Solana Foundation for providing the blockchain infrastructure
- Circle for USDC stablecoin and API support
- Anchor framework team for excellent developer tools
- University Blockchain Conference for organizing this hackathon
- All open-source contributors whose libraries made this possible

---

**Built for MBC 25 Hackathon** | December 2025


For questions or support, please open an issue or contact the team directly.
