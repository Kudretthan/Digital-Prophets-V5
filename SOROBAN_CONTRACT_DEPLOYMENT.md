# Soroban Smart Contract Deployment Guide

## Prerequisites

1. **Soroban CLI** - Already installed ✅
2. **Funded Stellar Account** - Your admin account needs XLM on testnet
3. **Signing Key** - Secret key for admin account (keep it secret!)

## Step 1: Fund Your Admin Account

If your admin account isn't funded on testnet:

```bash
# Create a test account at https://stellar.org/ecosystem/testnet-js-sdk or use Friendbot:
curl "https://friendbot.stellar.org?addr=GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3"
```

## Step 2: Set Up Environment Variables

Create/update your `.env` file with your secret key (NEVER commit this to git):

```env
# Existing variables...
NEXT_PUBLIC_ADMIN_ADDRESS=GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3

# Add this (KEEP SECRET - use a test key only):
# SOROBAN_SECRET_KEY=SBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 3: Verify WASM Build

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
ls -la target/wasm32-unknown-unknown/release/prediction_market.wasm
```

## Step 4: Deploy Contract

### Option A: Using Stellar CLI (Recommended for security)

```bash
# Set environment
$WASM = "contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm"
$NETWORK = "testnet"
$ADMIN = "GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3"

# Build JavaScript SDK bindings first
soroban contract build

# Deploy
soroban contract deploy `
  --wasm $WASM `
  --network $NETWORK `
  --source $ADMIN
```

### Option B: Using Docker (If you have docker-compose)

```bash
docker run --rm \
  -v "$(pwd):/app" \
  -w /app \
  stellar/soroban-cli \
  contract deploy \
    --wasm contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm \
    --network testnet \
    --source-account GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3
```

## Step 5: Contract Initialization

Once deployed, initialize with:

```bash
soroban contract invoke \
  --id CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --network testnet \
  --source $ADMIN \
  -- initialize \
  --token CBVG2R747Z5F5KXH62RA550F6GRZCH472ESTAVXEWOA6BYHUZCZKJF6H \
  --admin $ADMIN
```

## Step 6: Update Frontend

1. Save contract address from deployment output
2. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Restart frontend dev server

## Contract Functions Available

```typescript
// Initialize
initialize(token: Address, admin: Address) -> void

// Create prediction
create_prediction(prediction_id: u32) -> void

// Place bet
place_bet(prediction_id: u32, amount: i128, prediction: bool) -> void

// Resolve prediction
resolve_prediction(prediction_id: u32, result: bool) -> void

// Get prediction data [yes_amount, no_amount, resolved, result]
get_prediction(prediction_id: u32) -> Vec<i128>

// Get user bets
get_user_bets(prediction_id: u32, bettor: Address) -> Vec<(bool, i128)>
```

## Troubleshooting

### Error: "No sign with key provided"
- You need to set up a signing key or use a different authentication method
- For development, consider using a test network account

### Error: "HTTP error: connection refused"
- Local network isn't running
- Use testnet instead: `--network testnet`
- Or start local Soroban network if you need local testing

### Error: "Account not found"
- Admin account isn't funded on testnet
- Use Friendbot to fund it

### Error: "Insufficient XLM balance"
- Account exists but doesn't have enough XLM
- Request more funds from Friendbot

## Testing Contract Locally (Optional)

To test on local Soroban network:

```bash
# Start local network (requires Docker)
soroban network add --name local --rpc-url http://localhost:8000 --passphrase "Soroban Stellar standalone network ; February 2024"

# Deploy to local
soroban contract deploy --wasm $WASM --network local --source $ADMIN
```

## Next Steps

1. Deploy contract to testnet
2. Update frontend with contract address
3. Test betting functionality
4. Implement transaction signing in frontend
5. Deploy to mainnet when ready

---

For more info: https://soroban.stellar.org/
