# RemitEasy Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React Frontend (Port 3000)                  │  │
│  │                                                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │    Send      │  │   History    │  │  Recipients  │       │  │
│  │  │    Page      │  │     Page     │  │     Page     │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │        Solana Wallet Adapter (Phantom/Solflare)        │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │         @solana/web3.js + Anchor Client Library        │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓                ↑
                              ↓                ↑
                         HTTP/REST          WebSocket
                              ↓                ↑
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND API LAYER                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Express.js API Server (Port 5000)                │  │
│  │                                                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │   Auth       │  │ Transaction  │  │   Wallet     │       │  │
│  │  │  Controller  │  │  Controller  │  │  Controller  │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │              Business Logic Services                    │ │  │
│  │  │  • Solana Service (Transaction monitoring)             │ │  │
│  │  │  • Circle Service (USDC operations)                    │ │  │
│  │  │  • Exchange Rate Service (Pricing)                     │ │  │
│  │  │  • Notification Service (Email/SMS)                    │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │                   Middleware Layer                       │ │  │
│  │  │  • JWT Authentication                                    │ │  │
│  │  │  • Rate Limiting (100 req/min)                          │ │  │
│  │  │  • Request Validation                                    │ │  │
│  │  │  • Error Handling                                        │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
          ↓                           ↑                ↓
          ↓                           ↑                ↓
     PostgreSQL                    Redis          Solana RPC
          ↓                           ↑                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA & BLOCKCHAIN LAYER                        │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   PostgreSQL     │  │      Redis       │  │  Solana Network  │ │
│  │                  │  │                  │  │                  │ │
│  │  • Users         │  │  • Session Cache │  │  • Transactions  │ │
│  │  • Transactions  │  │  • Rate Limits   │  │  • Confirmations │ │
│  │  • Recipients    │  │  • Temp Data     │  │  • Account State │ │
│  │  • Wallets       │  │                  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                     ↓
                                     ↓
                          Smart Contract Calls
                                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      SOLANA SMART CONTRACT LAYER                     │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         RemitEasy Program (Anchor/Rust) - On-Chain           │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │                  Program Instructions                    │ │  │
│  │  │                                                           │ │  │
│  │  │  • initialize(fee_percentage)                           │ │  │
│  │  │    └─> Sets up program state                            │ │  │
│  │  │                                                           │ │  │
│  │  │  • send_transfer(amount, recipient, memo)               │ │  │
│  │  │    └─> Transfers USDC to escrow PDA                     │ │  │
│  │  │    └─> Creates transfer record                          │ │  │
│  │  │                                                           │ │  │
│  │  │  • receive_transfer(transfer_id)                        │ │  │
│  │  │    └─> Validates recipient                              │ │  │
│  │  │    └─> Releases USDC from escrow                        │ │  │
│  │  │                                                           │ │  │
│  │  │  • cancel_transfer(transfer_id)                         │ │  │
│  │  │    └─> Returns USDC to sender                           │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │                    Account State                         │ │  │
│  │  │                                                           │ │  │
│  │  │  • ProgramState (singleton)                             │ │  │
│  │  │    - admin: Pubkey                                      │ │  │
│  │  │    - fee_percentage: u16                                │ │  │
│  │  │    - total_transfers: u64                               │ │  │
│  │  │    - total_volume: u64                                  │ │  │
│  │  │                                                           │ │  │
│  │  │  • TransferAccount (per transfer)                       │ │  │
│  │  │    - sender: Pubkey                                     │ │  │
│  │  │    - recipient: Pubkey                                  │ │  │
│  │  │    - amount: u64                                        │ │  │
│  │  │    - status: TransferStatus                             │ │  │
│  │  │    - created_at: i64                                    │ │  │
│  │  │    - memo: String                                       │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │              Security & Validation                       │ │  │
│  │  │  • All funds in PDAs (non-custodial)                    │ │  │
│  │  │  • Sender signature required                            │ │  │
│  │  │  • Recipient validation                                 │ │  │
│  │  │  • Amount > 0 checks                                    │ │  │
│  │  │  • Status state machine enforcement                     │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    External Integrations                      │  │
│  │                                                                 │  │
│  │  ┌──────────────────┐           ┌──────────────────┐         │  │
│  │  │  SPL Token       │           │   Circle USDC    │         │  │
│  │  │  Program         │◄─────────►│   Mint Address   │         │  │
│  │  │                  │           │                  │         │  │
│  │  │  • Transfer      │           │  • Mint: EPjF... │         │  │
│  │  │  • Approve       │           │  • Decimals: 6   │         │  │
│  │  │  • Balance       │           │  • Authority     │         │  │
│  │  └──────────────────┘           └──────────────────┘         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Sending Money Flow

```
┌──────────┐
│  Sender  │
│  (Alice) │
└────┬─────┘
     │ 1. Connect wallet & enter details
     │    Amount: $100, Recipient: Bob's address
     ↓
┌────────────────┐
│   Frontend     │
│  Validation    │
└────┬───────────┘
     │ 2. Validate inputs (amount > 0, valid address)
     │    Calculate fees: $0.008
     ↓
┌────────────────┐
│  Call Backend  │
│   API (POST)   │
└────┬───────────┘
     │ 3. POST /api/transactions/send
     │    { recipient, amount, memo }
     ↓
┌─────────────────────┐
│  Backend API        │
│  (Node.js/Express)  │
└────┬────────────────┘
     │ 4. Authenticate user (JWT)
     │    Validate request
     │    Create transaction record in DB
     ↓
┌──────────────────────┐
│  Solana Transaction  │
│  Builder             │
└────┬─────────────────┘
     │ 5. Build transaction instruction
     │    Instruction: send_transfer
     │    Accounts: sender, recipient, escrow PDA
     ↓
┌────────────────────────┐
│  User Signs in Wallet  │
│  (Phantom)             │
└────┬───────────────────┘
     │ 6. User approves transaction
     │    Private key signature
     ↓
┌──────────────────────────────┐
│  Solana Network              │
│  (Blockchain)                │
└────┬─────────────────────────┘
     │ 7. Transaction processed
     │    • Validate signatures
     │    • Check balances
     ├─> 8a. Transfer USDC: Alice → Escrow PDA
     │    • 100 USDC moved to PDA
     ├─> 8b. Create TransferAccount
     │    • Store sender, recipient, amount
     │    • Set status = Pending
     └─> 8c. Emit event
          • Transaction signature
          • Confirmation in ~2 seconds
     ↓
┌──────────────────────┐
│  Backend Monitoring  │
│  (WebSocket)         │
└────┬─────────────────┘
     │ 9. Detect confirmation
     │    Update DB status = Confirmed
     │    Send notification to recipient
     ↓
┌──────────────────────┐
│  Frontend Update     │
│  (Real-time)         │
└────┬─────────────────┘
     │ 10. Show success message
     │     Display transaction details
     │     Update balance
     ↓
┌────────────┐
│  Complete  │
└────────────┘
```

### Receiving Money Flow

```
┌────────────┐
│ Recipient  │
│   (Bob)    │
└─────┬──────┘
      │ 1. Connects wallet
      ↓
┌──────────────────┐
│  Frontend Loads  │
│  Pending Txs     │
└─────┬────────────┘
      │ 2. Query backend API
      │    GET /api/transactions?recipient=Bob
      ↓
┌─────────────────────┐
│  Backend Returns    │
│  Pending Transfers  │
└─────┬───────────────┘
      │ 3. Return list of pending transfers
      │    [{ id, sender, amount, memo }]
      ↓
┌──────────────────────┐
│  Frontend Displays   │
│  "You have $100"     │
└─────┬────────────────┘
      │ 4. User clicks "Receive"
      ↓
┌───────────────────────┐
│  Build Transaction    │
│  receive_transfer()   │
└─────┬─────────────────┘
      │ 5. Instruction: receive_transfer
      │    Accounts: recipient, sender, escrow PDA
      │    Args: transfer_id
      ↓
┌──────────────────────┐
│  Bob Signs in Wallet │
└─────┬────────────────┘
      │ 6. Approve transaction
      ↓
┌──────────────────────────────┐
│  Smart Contract Execution    │
│  (On-Chain)                  │
└─────┬────────────────────────┘
      │ 7. Validate recipient matches
      ├─> 8a. Transfer USDC: Escrow PDA → Bob
      │    • 100 USDC released
      ├─> 8b. Update TransferAccount
      │    • status = Completed
      │    • completed_at = timestamp
      └─> 8c. Emit completion event
      ↓
┌───────────────────┐
│  Backend Updates  │
│  Database         │
└─────┬─────────────┘
      │ 9. Mark transaction complete
      │    Send notification to sender
      ↓
┌───────────────────┐
│  Frontend Shows   │
│  Success          │
└─────┬─────────────┘
      │ 10. Display success message
      │     Update balance (+$100)
      │     Show in history
      ↓
┌──────────┐
│ Complete │
└──────────┘
```

---

## Component Interaction Diagram

```
Frontend (React)                Backend (Node.js)              Blockchain (Solana)
─────────────────              ──────────────────             ────────────────────

┌─────────────┐
│   Wallet    │
│  Adapter    │───┐
└─────────────┘   │
                  │
┌─────────────┐   │
│  Transfer   │   │
│    Form     │───┤
└─────────────┘   │
                  │
┌─────────────┐   │                                          ┌──────────────┐
│ Transaction │   │                                          │   RemitEasy  │
│   History   │───┼─────────HTTP REST API─────────────────►│   Program    │
└─────────────┘   │          (Port 5000)                    │   (On-Chain) │
                  │                                          └──────────────┘
┌─────────────┐   │         ┌──────────────┐                       ▲
│ Recipient   │   │         │ Controllers  │                       │
│  Manager    │───┘         └──────┬───────┘                       │
└─────────────┘                    │                               │
                                   │                               │
     ▲                             ↓                               │
     │                    ┌──────────────┐                         │
     │                    │  Services    │                         │
     │                    │  • Solana    │────────RPC─────────────┘
     │                    │  • Circle    │    (@solana/web3.js)
     │                    │  • Exchange  │
     │                    └──────┬───────┘
     │                           │
     │                           ↓
     │                    ┌──────────────┐
     │                    │  Database    │
     └────────JSON────────│  (Postgres)  │
        (WebSocket)       └──────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Frontend Security                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  • No private keys stored in browser               │     │
│  │  • All transactions require wallet signature       │     │
│  │  • Input validation (XSS prevention)               │     │
│  │  • HTTPS only in production                        │     │
│  │  • Content Security Policy headers                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Layer 2: Backend Security                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  • JWT authentication with expiry                  │     │
│  │  • Rate limiting (100 req/min per user)            │     │
│  │  • SQL injection prevention (parameterized)        │     │
│  │  • Password hashing (bcrypt)                       │     │
│  │  • Environment variable secrets                    │     │
│  │  • CORS properly configured                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Layer 3: Smart Contract Security                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  • All funds in PDAs (Program Derived Addresses)   │     │
│  │  • Authority checks on all instructions            │     │
│  │  • No reentrancy vulnerabilities                   │     │
│  │  • Input validation (amount > 0, etc.)             │     │
│  │  • State machine enforcement (Pending→Completed)   │     │
│  │  • Overflow/underflow protection                   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS TABLE                          │
├───────────────┬──────────────┬────────────┬─────────────────┤
│ id (PK)       │ SERIAL       │ NOT NULL   │ Auto increment  │
│ email         │ VARCHAR(255) │ NOT NULL   │ Unique          │
│ password_hash │ VARCHAR(255) │ NOT NULL   │ bcrypt hashed   │
│ wallet_address│ VARCHAR(44)  │ NOT NULL   │ Unique          │
│ created_at    │ TIMESTAMP    │ DEFAULT    │ Current time    │
└───────────────┴──────────────┴────────────┴─────────────────┘
                               │
                               │ 1:N
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                     TRANSACTIONS TABLE                       │
├───────────────────┬──────────────┬─────────┬────────────────┤
│ id (PK)           │ SERIAL       │ NOT NULL│ Auto increment │
│ sender_id (FK)    │ INTEGER      │         │ → users.id     │
│ recipient_wallet  │ VARCHAR(44)  │ NOT NULL│                │
│ amount            │ DECIMAL(18,6)│ NOT NULL│ USDC amount    │
│ status            │ VARCHAR(20)  │ NOT NULL│ Pending/...    │
│ signature         │ VARCHAR(88)  │         │ Solana tx sig  │
│ memo              │ TEXT         │         │ Optional note  │
│ created_at        │ TIMESTAMP    │ DEFAULT │ Current time   │
│ completed_at      │ TIMESTAMP    │         │ NULL until done│
└───────────────────┴──────────────┴─────────┴────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     RECIPIENTS TABLE                         │
├──────────────┬──────────────┬─────────┬────────────────────┤
│ id (PK)      │ SERIAL       │ NOT NULL│ Auto increment     │
│ user_id (FK) │ INTEGER      │ NOT NULL│ → users.id         │
│ name         │ VARCHAR(255) │ NOT NULL│ Display name       │
│ wallet_addr  │ VARCHAR(44)  │ NOT NULL│ Recipient address  │
│ created_at   │ TIMESTAMP    │ DEFAULT │ Current time       │
└──────────────┴──────────────┴─────────┴────────────────────┘

Indexes:
- transactions: (sender_id), (status), (created_at)
- recipients: (user_id)
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       PRODUCTION DEPLOYMENT                     │
└────────────────────────────────────────────────────────────────┘

Frontend                  Backend                  Database
(Vercel)                 (Railway)               (Railway)
─────────                ─────────               ─────────

┌──────────┐            ┌──────────┐           ┌──────────┐
│  CDN     │            │  API     │           │ Postgres │
│  Edge    │◄──HTTPS───┤  Server  │◄──────────┤  Primary │
│  Nodes   │            │          │  TCP 5432 │          │
└────┬─────┘            └────┬─────┘           └──────────┘
     │                       │
     │                       │                  ┌──────────┐
     │                       └──────────────────┤  Redis   │
     │                              TCP 6379    │  Cache   │
     │                                          └──────────┘
     │
     │                  Solana Network
     │                  (Mainnet-Beta)
     │                  ────────────────
     │                       ↓
     └───────────────────────┼─────────────────────────┐
                             ↓                         │
                    ┌─────────────────┐               │
                    │  RemitEasy      │               │
                    │  Smart Contract │               │
                    │  (Program)      │               │
                    └─────────────────┘               │
                             ↓                         │
                    ┌─────────────────┐               │
                    │  SPL Token      │               │
                    │  Program        │               │
                    │  (USDC)         │               │
                    └─────────────────┘               │
                                                       │
                    Monitoring & Logging               │
                    ────────────────────               │
                    ┌─────────────────┐               │
                    │   Datadog       │◄──────────────┘
                    │   (Metrics)     │
                    └─────────────────┘

                    ┌─────────────────┐
                    │   Sentry        │◄──Error tracking
                    │   (Errors)      │   from all layers
                    └─────────────────┘
```

---

## Technology Stack Summary

```
┌───────────────────────────────────────────────────────────┐
│                    TECHNOLOGY CHOICES                      │
├───────────────┬───────────────────────────────────────────┤
│ Frontend      │ React 18.2, Tailwind CSS 3.3              │
│               │ @solana/wallet-adapter-react              │
│               │ @solana/web3.js, Redux Toolkit            │
├───────────────┼───────────────────────────────────────────┤
│ Backend       │ Node.js 18, Express 4.18                  │
│               │ PostgreSQL 15, Redis 7                    │
│               │ JWT, bcrypt, Winston                      │
├───────────────┼───────────────────────────────────────────┤
│ Blockchain    │ Solana (Devnet/Mainnet)                   │
│               │ Anchor 0.29, Rust 1.70                    │
│               │ SPL Token (USDC)                          │
├───────────────┼───────────────────────────────────────────┤
│ DevOps        │ Docker, GitHub Actions                    │
│               │ Vercel (Frontend), Railway (Backend)      │
├───────────────┼───────────────────────────────────────────┤
│ Monitoring    │ Datadog (metrics), Sentry (errors)        │
│               │ Solana Explorer (on-chain activity)       │
└───────────────┴───────────────────────────────────────────┘
```

This architecture ensures:
- **Scalability:** Stateless design allows horizontal scaling
- **Security:** Multiple layers of protection
- **Performance:** Fast blockchain + efficient caching
- **Reliability:** Database backups + error monitoring
- **Maintainability:** Clear separation of concerns