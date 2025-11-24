# RemitEasy Deployment Guide

Complete guide for deploying RemitEasy to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

- **Solana Mainnet Access** - RPC endpoint (recommended: Helius, QuickNode, or Alchemy)
- **PostgreSQL Database** - v15+ (Railway, Supabase, or AWS RDS)
- **Redis** - v7+ (Upstash, Redis Cloud, or AWS ElastiCache)
- **Domain** - For backend and frontend
- **SSL Certificates** - Let's Encrypt or Cloudflare

### Required Tools

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli

# Node.js 18+
# Vercel CLI (for frontend)
npm install -g vercel

# Railway CLI (for backend)
npm install -g railway
```

### Required Accounts

- GitHub account
- Vercel account (frontend hosting)
- Railway account (backend hosting)
- Solana wallet with sufficient SOL (~5 SOL for deployment)

---

## Smart Contract Deployment

### Step 1: Prepare Program

```bash
cd program

# Install dependencies
npm install

# Build program
anchor build
```

### Step 2: Get Program ID

```bash
# Get the program ID from the generated keypair
solana address -k target/deploy/remiteasy-keypair.json
```

Output example: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

### Step 3: Update Program ID

Update in these files:

**programs/remiteasy/src/lib.rs:**
```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

**Anchor.toml:**
```toml
[programs.mainnet]
remiteasy = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
```

### Step 4: Rebuild

```bash
anchor build
```

### Step 5: Deploy to Mainnet

```bash
# Configure to mainnet
solana config set --url mainnet-beta

# Check balance (need 2-5 SOL)
solana balance

# Deploy
anchor deploy --provider.cluster mainnet
```

**Expected output:**
```
Program Id: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
Deployment successful!
```

### Step 6: Verify Deployment

```bash
# Check program exists on mainnet
solana program show Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

### Step 7: Initialize Program

Create initialization script:

```typescript
// scripts/initialize-program.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Remiteasy } from "../target/types/remiteasy";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Remiteasy as Program<Remiteasy>;

const [programStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("program_state")],
  program.programId
);

async function initialize() {
  const feePercentage = 50; // 0.5% fee
  
  const tx = await program.methods
    .initialize(feePercentage)
    .accounts({
      programState: programStatePda,
      admin: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("Program initialized:", tx);
}

initialize();
```

Run initialization:
```bash
ts-node scripts/initialize-program.ts
```

---

## Database Setup

### Option 1: Railway

1. **Create PostgreSQL Database:**
   ```bash
   railway login
   railway init
   railway add postgresql
   ```

2. **Get Connection String:**
   ```bash
   railway variables
   ```

3. **Run Migrations:**
   ```bash
   # Create database locally first
   createdb remiteasy_prod

   # Run migrations
   psql $DATABASE_URL < backend/migrations/001_initial_schema.sql
   ```

### Option 2: Supabase

1. Create project at https://supabase.com
2. Get connection string from settings
3. Run migrations in SQL editor

### Option 3: AWS RDS

1. Create PostgreSQL instance in AWS Console
2. Configure security groups for access
3. Run migrations using psql

### Migration SQL

```sql
-- Create tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(44) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  recipient_wallet VARCHAR(44) NOT NULL,
  amount DECIMAL(18, 6) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  signature VARCHAR(88),
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE recipients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(44) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_recipient ON transactions(recipient_wallet);
CREATE INDEX idx_recipients_user ON recipients(user_id);
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Initialize Railway Project:**
   ```bash
   cd backend
   railway login
   railway init
   ```

2. **Add Services:**
   ```bash
   railway add postgresql
   railway add redis
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set SOLANA_NETWORK=mainnet-beta
   railway variables set SOLANA_RPC_URL=your_rpc_url
   railway variables set PROGRAM_ID=your_program_id
   railway variables set USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Get Deployment URL:**
   ```bash
   railway domain
   ```

### Option 2: Heroku

1. **Create App:**
   ```bash
   heroku create remiteasy-backend
   ```

2. **Add Add-ons:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   heroku addons:create heroku-redis:mini
   ```

3. **Set Config Vars:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   heroku config:set SOLANA_NETWORK=mainnet-beta
   heroku config:set SOLANA_RPC_URL=your_rpc_url
   heroku config:set PROGRAM_ID=your_program_id
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 3: Docker + AWS ECS

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

**Deploy to ECS:**
1. Build and push Docker image to ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer

### Backend Environment Variables Checklist

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/remiteasy

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=generated_secret_32_bytes
JWT_EXPIRES_IN=24h

# Solana
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://your-rpc-provider.com
SOLANA_PRIVATE_KEY=[your,backend,wallet,array]
PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# USDC
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Circle (optional)
CIRCLE_API_KEY=your_circle_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment:**
   
   Create `.env.production`:
   ```bash
   REACT_APP_SOLANA_NETWORK=mainnet-beta
   REACT_APP_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   REACT_APP_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   REACT_APP_API_URL=https://api.remiteasy.com
   REACT_APP_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   ```

3. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set Environment Variables in Dashboard:**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.production`

5. **Configure Custom Domain:**
   - Add domain in Vercel dashboard
   - Update DNS records

### Option 2: Netlify

1. **Build Command:**
   ```
   npm run build
   ```

2. **Publish Directory:**
   ```
   dist
   ```

3. **Environment Variables:**
   Add in Netlify dashboard under Site Settings → Environment Variables

### Option 3: AWS S3 + CloudFront

1. **Build:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://remiteasy-frontend
   ```

3. **Configure CloudFront:**
   - Create distribution
   - Point to S3 bucket
   - Configure SSL certificate

---

## Post-Deployment

### 1. Health Checks

**Backend:**
```bash
curl https://api.remiteasy.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-21T15:30:00.000Z"
}
```

**Frontend:**
```bash
curl https://remiteasy.com
```

### 2. Test Transactions

1. Create test account
2. Connect wallet
3. Send small test transaction (0.01 USDC)
4. Verify on Solana Explorer
5. Check database record

### 3. DNS Configuration

**Backend (api.remiteasy.com):**
```
Type: A or CNAME
Name: api
Value: [Railway/Heroku URL or IP]
TTL: 300
```

**Frontend (remiteasy.com):**
```
Type: A
Name: @
Value: [Vercel IP]

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

### 4. SSL/TLS Setup

Most hosting providers (Vercel, Railway, Heroku) provide automatic SSL.

For custom setup:
```bash
# Using Let's Encrypt
certbot certonly --standalone -d api.remiteasy.com
```

### 5. CORS Configuration

Update backend to allow production frontend:

```javascript
// backend/src/server.js
app.use(cors({
  origin: [
    'https://remiteasy.com',
    'https://www.remiteasy.com'
  ],
  credentials: true
}));
```

---

## Monitoring & Maintenance

### Application Monitoring

**Recommended Tools:**
- **Backend:** Datadog, New Relic, or Sentry
- **Frontend:** Vercel Analytics, Google Analytics
- **Blockchain:** Helius webhooks, Solscan API

### Set Up Alerts

**Backend Alerts:**
```javascript
// Integrate Sentry
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Monitor These Metrics:**
- API response times
- Error rates
- Database connection pool
- Transaction success rate
- Solana RPC health

### Backup Strategy

**Database Backups:**
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://remiteasy-backups/
```

**Automated Backups:**
- Railway: Automatic daily backups
- Heroku: Use Heroku Postgres backup addon
- AWS: Enable automated RDS snapshots

### Log Management

**Centralized Logging:**
```javascript
// Use Winston with cloud transport
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

logger.add(new WinstonCloudWatch({
  logGroupName: 'remiteasy-backend',
  logStreamName: 'production',
  awsRegion: 'us-east-1'
}));
```

### Update Strategy

**Backend Updates:**
```bash
# Test in staging first
git checkout staging
git pull origin main
railway up --environment staging

# After testing, deploy to production
railway up --environment production
```

**Smart Contract Updates:**
```bash
# Upgrade with new version
anchor build
anchor upgrade target/deploy/remiteasy.so \
  --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS \
  --upgrade-authority ~/.config/solana/id.json
```

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
railway logs
# or
heroku logs --tail
```

**Common issues:**
- Missing environment variables
- Database connection failed
- Port already in use

### Database Connection Errors

**Test connection:**
```bash
psql $DATABASE_URL
```

**Fix SSL issues:**
```javascript
// In database.js
ssl: process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false
```

### Frontend Build Failures

**Clear cache:**
```bash
rm -rf node_modules dist .cache
npm install
npm run build
```

**Check environment variables:**
```bash
vercel env ls
```

### Solana RPC Issues

**Test RPC:**
```bash
curl https://your-rpc-url.com -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

**Fallback RPC:**
```javascript
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
);
```

### High Error Rates

1. Check Solana network status
2. Verify RPC rate limits
3. Check database performance
4. Review error logs in Sentry

---

## Security Checklist

- [ ] All environment variables secured
- [ ] Database uses SSL/TLS
- [ ] API has rate limiting enabled
- [ ] CORS properly configured
- [ ] JWT secrets are strong and unique
- [ ] Solana wallet private keys secured
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured (Helmet.js)
- [ ] SQL injection protection enabled
- [ ] XSS protection enabled
- [ ] Regular dependency updates
- [ ] Automated security scanning (Snyk, Dependabot)

---

## Rollback Procedure

If deployment fails:

**Backend:**
```bash
railway rollback
# or
heroku rollback
```

**Frontend:**
```bash
vercel rollback
```

**Smart Contract:**
```bash
# Use backup of previous .so file
anchor upgrade backup/remiteasy-v1.so \
  --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

---

## Production Checklist

### Before Go-Live

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Smart contract deployed and initialized
- [ ] Database migrated and seeded
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and accessible
- [ ] DNS configured correctly
- [ ] SSL certificates active
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Error tracking enabled
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on monitoring tools

### After Go-Live

- [ ] Monitor error rates first 24h
- [ ] Check transaction success rate
- [ ] Verify emails/notifications working
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Verify Solana transaction confirmations
- [ ] Monitor user signups
- [ ] Check payment flow end-to-end

---

## Support

For deployment issues:
- GitHub Issues: [Issues](https://github.com/thetruesammyjay/RemitPay/issues)
- Discord: [Coming Soon]
- Email: devops@remiteasy.com

---

**Document Version:** 1.0  
**Last Updated:** November 2025
