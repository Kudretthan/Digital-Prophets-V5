# Soroban Contract Deployment Script for Windows PowerShell

# Set environment variables
$ADMIN_ADDRESS = $env:NEXT_PUBLIC_ADMIN_ADDRESS
$XLM_TOKEN = "CBVG2R747Z5F5KXH62RA550F6GRZCH472ESTAVXEWOA6BYHUZCZKJF6H"  # Stellar native token on testnet
$NETWORK = "testnet"
$WASM_FILE = "contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm"

Write-Host "🚀 Deploying Soroban Prediction Market Contract..." -ForegroundColor Cyan
Write-Host "Network: $NETWORK" -ForegroundColor Yellow
Write-Host "Admin: $ADMIN_ADDRESS" -ForegroundColor Yellow

# Step 1: Build the contract
Write-Host "`n[1/3] Building WASM contract..." -ForegroundColor Green
cd contracts
cargo build --target wasm32-unknown-unknown --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
cd ..

# Step 2: Deploy the contract binary
Write-Host "`n[2/3] Deploying contract binary to testnet..." -ForegroundColor Green
$DEPLOY_OUTPUT = soroban contract deploy `
    --wasm $WASM_FILE `
    --network $NETWORK `
    --source-account $ADMIN_ADDRESS 2>&1

$CONTRACT_ID = ($DEPLOY_OUTPUT | Select-String -Pattern "^C[A-Z0-9]{55}$" | Select-Object -First 1).Matches.Value

if (-not $CONTRACT_ID) {
    Write-Host "❌ Failed to deploy contract!" -ForegroundColor Red
    Write-Host $DEPLOY_OUTPUT -ForegroundColor Red
    exit 1
}

Write-Host "✅ Contract deployed!" -ForegroundColor Green
Write-Host "Contract ID: $CONTRACT_ID" -ForegroundColor Cyan

# Step 3: Initialize the contract
Write-Host "`n[3/3] Initializing contract..." -ForegroundColor Green
soroban contract invoke `
    --id $CONTRACT_ID `
    --network $NETWORK `
    --source-account $ADMIN_ADDRESS `
    -- initialize `
    --token $XLM_TOKEN `
    --admin $ADMIN_ADDRESS

Write-Host "`n✅ Contract deployment complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with: NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=$CONTRACT_ID" -ForegroundColor Yellow
Write-Host "2. Restart the development server" -ForegroundColor Yellow
Write-Host "3. Test contract interactions via frontend" -ForegroundColor Yellow

# Save contract ID to a file for later reference
$CONTRACT_ID | Out-File -FilePath "CONTRACT_ADDRESS.txt" -Encoding UTF8
Write-Host "`nContract address saved to: CONTRACT_ADDRESS.txt" -ForegroundColor Gray
