#!/bin/bash
# Soroban Smart Contract Build & Deploy Script
# Usage: ./deploy-contract.sh

set -e

echo "🚀 Stellar Soroban Smart Contract Deployment"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ADMIN_ACCOUNT="GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3"
NETWORK="testnet"
CONTRACT_NAME="prediction_market"

echo -e "${BLUE}Step 1: Building Rust Contract to WASM${NC}"
cd contracts
rustup target add wasm32-unknown-unknown 2>/dev/null || true
cargo build --target wasm32-unknown-unknown --release

WASM_FILE="target/wasm32-unknown-unknown/release/${CONTRACT_NAME}.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo -e "${YELLOW}Error: WASM file not found at $WASM_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contract built: $WASM_FILE${NC}"

cd ..

echo -e "${BLUE}Step 2: Deploying Contract to Stellar ${NETWORK}${NC}"
echo "Admin Account: $ADMIN_ACCOUNT"

CONTRACT_HASH=$(soroban contract deploy \
    --wasm "$WASM_FILE" \
    --source-account "$ADMIN_ACCOUNT" \
    --network "$NETWORK" \
    2>&1 | grep -oP '(?<=contract id: )[^ ]+' || echo "")

if [ -z "$CONTRACT_HASH" ]; then
    echo -e "${YELLOW}Contract deployment initiated. Check transaction status.${NC}"
    echo "Run: soroban contract list --network $NETWORK"
    exit 0
fi

echo -e "${GREEN}✓ Contract Deployed: $CONTRACT_HASH${NC}"

echo -e "${BLUE}Step 3: Initializing Contract${NC}"

soroban contract invoke \
    --id "$CONTRACT_HASH" \
    --source-account "$ADMIN_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    initialize \
    --token "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4" \
    --admin "$ADMIN_ACCOUNT"

echo -e "${GREEN}✓ Contract Initialized${NC}"

echo -e "${BLUE}Step 4: Updating Environment Variables${NC}"

# Update .env.local
ENV_FILE="frontend/.env.local"
if grep -q "NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS" "$ENV_FILE"; then
    sed -i.bak "s/NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=$CONTRACT_HASH/" "$ENV_FILE"
else
    echo "NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=$CONTRACT_HASH" >> "$ENV_FILE"
fi

echo -e "${GREEN}✓ Environment updated${NC}"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Contract Address: $CONTRACT_HASH"
echo ""
echo "Next steps:"
echo "1. Commit changes: git add . && git commit -m 'Deploy Soroban contract'"
echo "2. Restart frontend: npm run dev"
echo "3. Start placing bets! 🎮"
