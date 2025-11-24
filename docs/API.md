# RemitEasy API Documentation

Complete API reference for RemitEasy backend services.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.remiteasy.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN` environment variable).

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "walletAddress": "YourSolanaWalletAddress"
}
```

**Validation Rules:**
- `email`: Valid email format, max 255 characters
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number
- `walletAddress`: Valid Solana public key (44 characters)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "walletAddress": "YourSolanaWalletAddress"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**409 Conflict:**
```json
{
  "error": "Email already registered"
}
```

**409 Conflict:**
```json
{
  "error": "Wallet already connected to another account"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, and number"
    }
  ]
}
```

---

### POST /auth/login

Authenticate existing user.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "walletAddress": "YourSolanaWalletAddress"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### GET /auth/profile

Get current user profile with statistics.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "walletAddress": "YourSolanaWalletAddress",
      "createdAt": "2025-11-01T10:00:00.000Z"
    },
    "stats": {
      "total_transactions": "5",
      "total_sent": "500.000000",
      "completed_transactions": "4"
    }
  }
}
```

---

### POST /auth/refresh

Refresh JWT token.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Transaction Endpoints

### POST /transactions

Create a new transfer transaction.

**Authentication:** Required

**Rate Limit:** 50 requests per minute per user

**Request Body:**
```json
{
  "recipientWallet": "RecipientSolanaAddress",
  "amount": "100.50",
  "memo": "Payment for services"
}
```

**Validation Rules:**
- `recipientWallet`: Valid Solana public key
- `amount`: Positive number, max 6 decimal places
- `memo`: Optional, max 200 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Transaction created. Please sign and submit to blockchain.",
  "data": {
    "id": 42,
    "sender_id": 1,
    "recipient_wallet": "RecipientSolanaAddress",
    "amount": "100.500000",
    "status": "pending",
    "memo": "Payment for services",
    "created_at": "2025-11-21T15:30:00.000Z",
    "completed_at": null,
    "signature": null
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be a positive number"
    }
  ]
}
```

---

### PUT /transactions/:id/signature

Update transaction with blockchain signature after signing.

**Authentication:** Required

**URL Parameters:**
- `id`: Transaction ID (integer)

**Request Body:**
```json
{
  "signature": "SolanaTransactionSignature88CharactersLong..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction submitted. Monitoring confirmation."
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Transaction not found"
}
```

**403 Forbidden:**
```json
{
  "error": "Unauthorized"
}
```

---

### GET /transactions

Get user's transaction history with pagination.

**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)
- `status`: Filter by status (optional: "pending", "completed", "cancelled", "failed")

**Example Request:**
```
GET /transactions?page=1&limit=10&status=completed
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "sender_id": 1,
      "sender_email": "user@example.com",
      "recipient_wallet": "RecipientAddress",
      "amount": "100.500000",
      "status": "completed",
      "signature": "TxSignature...",
      "memo": "Payment for services",
      "created_at": "2025-11-21T15:30:00.000Z",
      "completed_at": "2025-11-21T15:30:05.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET /transactions/stats

Get transaction statistics.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_transactions": "1234",
    "completed_transactions": "1200",
    "pending_transactions": "20",
    "total_volume": "1500000.000000"
  }
}
```

---

### GET /transactions/:id

Get specific transaction details.

**Authentication:** Required

**URL Parameters:**
- `id`: Transaction ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "sender_id": 1,
    "sender_email": "user@example.com",
    "sender_wallet": "SenderAddress",
    "recipient_wallet": "RecipientAddress",
    "amount": "100.500000",
    "status": "completed",
    "signature": "TxSignature...",
    "memo": "Payment for services",
    "created_at": "2025-11-21T15:30:00.000Z",
    "completed_at": "2025-11-21T15:30:05.000Z"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Transaction not found"
}
```

**403 Forbidden:**
```json
{
  "error": "Unauthorized"
}
```

---

### POST /transactions/:id/cancel

Cancel a pending transaction.

**Authentication:** Required

**URL Parameters:**
- `id`: Transaction ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction cancelled",
  "data": {
    "id": 42,
    "status": "cancelled",
    "amount": "100.500000"
  }
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Transaction not found or cannot be cancelled"
}
```

---

## Wallet Endpoints

### POST /wallets/connect

Connect a Solana wallet to user account.

**Authentication:** Required

**Request Body:**
```json
{
  "walletAddress": "NewSolanaWalletAddress"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wallet connected",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "walletAddress": "NewSolanaWalletAddress",
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
}
```

**Error Response (409):**
```json
{
  "error": "Wallet already connected to another account"
}
```

---

### POST /wallets/disconnect

Disconnect wallet from user account.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wallet disconnected",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "walletAddress": null,
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
}
```

---

### GET /wallets/balance

Get SOL and USDC balance for connected wallet.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "walletAddress": "YourWalletAddress",
    "solBalance": 2.5,
    "usdcBalance": 1000.250000,
    "stats": {
      "totalTransactions": "10",
      "totalSent": "500.000000",
      "lastTransaction": "2025-11-21T15:30:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "error": "No wallet connected"
}
```

---

### GET /wallets/transactions

Get recent on-chain transactions for connected wallet.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "signature": "TxSignature...",
      "blockTime": 1700000000,
      "slot": 123456789,
      "err": null,
      "memo": "Transfer"
    }
  ]
}
```

---

### GET /wallets/info

Get wallet information with statistics.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "wallet_address": "YourWalletAddress",
    "total_transactions": "10",
    "total_sent": "500.000000",
    "last_transaction": "2025-11-21T15:30:00.000Z"
  }
}
```

---

## User & Recipient Endpoints

### GET /users/profile

Get user profile with statistics.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "walletAddress": "YourWalletAddress",
      "createdAt": "2025-11-01T10:00:00.000Z"
    },
    "stats": {
      "total_transactions": "10",
      "total_sent": "500.000000",
      "completed_transactions": "9"
    },
    "recipientsCount": 5
  }
}
```

---

### PUT /users/profile

Update user profile.

**Authentication:** Required

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "walletAddress": "NewWalletAddress"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "walletAddress": "NewWalletAddress",
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
}
```

---

### PUT /users/password

Update user password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid current password"
}
```

---

### DELETE /users/account

Delete user account permanently.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### GET /users/recipients

Get all saved recipients.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "John Doe",
      "wallet_address": "RecipientWalletAddress",
      "created_at": "2025-11-01T10:00:00.000Z"
    }
  ]
}
```

---

### POST /users/recipients

Add a new recipient.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Doe",
  "walletAddress": "RecipientWalletAddress"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Recipient added",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "wallet_address": "RecipientWalletAddress",
    "created_at": "2025-11-21T15:30:00.000Z"
  }
}
```

**Error Response (409):**
```json
{
  "error": "Recipient already exists"
}
```

---

### GET /users/recipients/:id

Get specific recipient with transaction statistics.

**Authentication:** Required

**URL Parameters:**
- `id`: Recipient ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "wallet_address": "RecipientWalletAddress",
    "created_at": "2025-11-01T10:00:00.000Z",
    "total_transactions": "5",
    "total_sent": "500.000000"
  }
}
```

---

### PUT /users/recipients/:id

Update recipient information.

**Authentication:** Required

**URL Parameters:**
- `id`: Recipient ID

**Request Body:**
```json
{
  "name": "Jane Doe",
  "walletAddress": "NewWalletAddress"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recipient updated",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Jane Doe",
    "wallet_address": "NewWalletAddress",
    "created_at": "2025-11-01T10:00:00.000Z"
  }
}
```

---

### DELETE /users/recipients/:id

Delete a saved recipient.

**Authentication:** Required

**URL Parameters:**
- `id`: Recipient ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recipient deleted"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message here",
  "details": {} // Optional additional details
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Authenticated but not authorized |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |
| 503 | Service Unavailable - External service (blockchain) unavailable |

---

## Rate Limiting

**General API:** 100 requests per minute per IP
**Authentication Endpoints:** 5 requests per 15 minutes per IP
**User Endpoints:** 50 requests per minute per user

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-11-21T15:31:00.000Z
```

When rate limit is exceeded:
```json
{
  "error": "Too many requests, please try again later",
  "retryAfter": 60
}
```

---

## Pagination

Paginated endpoints return this structure:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## CORS

CORS is enabled for all origins in development. In production, configure allowed origins in the backend environment.

---

## WebSocket Support (Future)

Real-time transaction updates will be available via WebSocket in future versions.

---

## API Versioning

Current version: v1

Base URL includes version: `/api/v1/*`

---

## Support

For API issues or questions:
- GitHub Issues: [Issues](https://github.com/thetruesammyjay/RemitPay/issues)
- Email: support@remiteasy.com
- Discord: [Your server]

---

**API Version:** 1.0.0  
**Last Updated:** November 2025
