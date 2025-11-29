# Soroban Smart Contract Deployment Guide

## Current Status
- ✅ **Smart Contract** (Rust): `contracts/prediction_market.rs` - ready for deployment
- ✅ **Frontend Integration** (TypeScript): `frontend/lib/soroban.ts` - functions prepared
- ⏳ **Deployment**: Pending Soroban CLI installation (Windows AppLocker restriction)

## Deployment Steps

### Prerequisites
1. Soroban CLI installed (`cargo install soroban-cli`)
2. Rust toolchain configured for Soroban (`rustup target add wasm32-unknown-unknown`)
3. Stellar testnet account with XLM balance (for gas fees)

### Step 1: Build the Contract
```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

### Step 2: Deploy to Soroban Testnet
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/prediction_market.wasm \
  --source-account GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3 \
  --network testnet
```

This will return a **Contract Address** (e.g., `CXXXXX...`)

### Step 3: Initialize Contract
```bash
soroban contract invoke \
  --id CXXXXX... \
  --source-account GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3 \
  --network testnet \
  -- \
  initialize \
  --token CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4 \
  --admin GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3
```

### Step 4: Add to Environment
Update `frontend/.env.local`:
```env
NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=CXXXXX...
```

## Contract Functions

### Admin Functions
```typescript
// Create a new prediction
create_prediction(id: u32)

// Resolve a prediction and distribute winnings
resolve_prediction(prediction_id: u32, result: bool)
```

### User Functions
```typescript
// Place a bet
place_bet(prediction_id: u32, bettor: Address, amount: i128, prediction: bool)

// Get prediction details
get_prediction(prediction_id: u32) -> Prediction

// Get user's bets
get_user_bets(prediction_id: u32, bettor: Address) -> Vec<(bool, i128)>
```

## Data Structures

### Prediction
```rust
pub struct Prediction {
    pub id: u32,                 // Unique prediction ID
    pub yes_amount: i128,        // Total XLM bet on YES
    pub no_amount: i128,         // Total XLM bet on NO
    pub resolved: bool,          // Has prediction been resolved
    pub result: bool,            // true = YES won, false = NO won
}
```

### Bet
```rust
pub struct Bet {
    pub bettor: Address,         // User's wallet address
    pub amount: i128,            // Amount of XLM wagered
    pub prediction: bool,        // true = YES, false = NO
    pub prediction_id: u32,      // Associated prediction
}
```

## Frontend Integration

Once deployed, contract interactions will work through:

```typescript
import { placeBetOnContract, resolvePredictionOnContract } from '@/lib/soroban';

// Place a bet
const txId = await placeBetOnContract(
  walletAddress,
  predictionId,
  amountXLM,
  true, // EVET
  networkPassphrase
);

// Resolve prediction (admin only)
const txId = await resolvePredictionOnContract(
  adminAddress,
  predictionId,
  true, // YES wins
  networkPassphrase
);
```

## Current Alternative Architecture

While waiting for contract deployment:
- **Frontend**: Displays predictions from Supabase ✅
- **Backend**: Supabase database stores all prediction data ✅
- **Smart Contract**: Ready for deployment, currently a reference implementation
- **Transactions**: Can be tracked through `/api/transactions` route

Migration to full contract-based storage can happen post-deployment without breaking existing functionality.

## Troubleshooting

### Windows Security Issues
If you encounter "Application Control policy" errors:
1. Use Docker container: `docker pull stellar/soroban-cli`
2. Or deploy from a Linux/Mac machine
3. Or disable AppLocker temporarily (requires admin)

### XLM Balance Issues
- Check account balance: `soroban account show -s <your-address> --network testnet`
- Fund with testnet: https://friendbot.stellar.org/?addr=<your-address>

### Contract Address Not Found
- Verify deployment succeeded and contract exists on testnet
- Check Stellar Testnet Explorer: https://testnet.steexp.com/

## Resources
- Soroban Docs: https://soroban.stellar.org/docs
- Stellar SDK: https://stellar.org/developers
- Testnet Explorer: https://testnet.steexp.com/
