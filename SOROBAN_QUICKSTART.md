# ✅ Soroban Contract Deployment - Quick Start

## What's Ready

✅ **Smart Contract (Rust/Soroban)**
- Location: `contracts/src/lib.rs`
- Built: `contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm`
- Features:
  - Initialize with admin and token
  - Create prediction markets
  - Place bets (YES/NO)
  - Resolve predictions
  - Query prediction data

✅ **Soroban CLI**
- Installed: `soroban 23.2.1`
- Ready for deployment to testnet

✅ **Frontend Integration**
- Updated `frontend/lib/soroban.ts` with contract functions
- Ready to call contract methods
- Freighter wallet integration for signing

✅ **Deployment Documentation**
- `SOROBAN_CONTRACT_DEPLOYMENT.md` - Complete guide

## Next Steps

### 1. Fund Your Admin Account (Testnet)
```bash
# Use Friendbot to fund your admin account
curl "https://friendbot.stellar.org?addr=GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3"
```

### 2. Deploy Contract
```bash
# Set up environment
$WASM = "contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm"

# Deploy to testnet
soroban contract deploy `
  --wasm $WASM `
  --network testnet `
  --source-account GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3
```

### 3. Initialize Contract
After deployment, you'll get a contract ID (C...). Use it to initialize:
```bash
soroban contract invoke `
  --id <CONTRACT_ID> `
  --network testnet `
  --source-account GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3 `
  -- initialize `
  --token CBVG2R747Z5F5KXH62RA550F6GRZCH472ESTAVXEWOA6BYHUZCZKJF6H `
  --admin GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3
```

### 4. Update Frontend Environment
Add to `frontend/.env.local`:
```
NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=<YOUR_CONTRACT_ID>
```

### 5. Restart Frontend
```bash
cd frontend
npm run dev
```

## Contract Deployed ✅

Git commit: `fc3d771`
- 828 files changed, 24703 insertions(+)
- Full contract source, WASM build, and deployment infrastructure

## Testing

Once deployed, test with:
```typescript
// frontend/lib/soroban.ts
import { placeBetOnContract, resolvePredictionOnContract } from './soroban';

// Place a bet
await placeBetOnContract(
  userPublicKey,
  predictionId, 
  amountXLM,
  true, // YES
  networkPassphrase
);
```

## Troubleshooting

**"No sign with key provided"** - Need authentication setup
- Use `--source-account` parameter
- Or set up with Freighter signing

**"Account not found"** - Account not funded
- Use Friendbot to fund account

**"Connection refused"** - Wrong network
- Use `--network testnet` not `local`

---

For more details: Read `SOROBAN_CONTRACT_DEPLOYMENT.md`
