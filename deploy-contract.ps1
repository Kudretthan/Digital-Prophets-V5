# Soroban Smart Contract Build & Deploy Script (PowerShell)
# Usage: .\deploy-contract.ps1

param(
    [string]$AdminAccount = "GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3",
    [string]$Network = "testnet",
    [string]$ContractName = "prediction_market"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Stellar Soroban Smart Contract Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Step 1: Build contract
Write-Host "Step 1: Building Rust Contract to WASM" -ForegroundColor Cyan

Push-Location contracts

# Add WASM target
rustup target add wasm32-unknown-unknown 2>$null
cargo build --target wasm32-unknown-unknown --release

$WasmFile = "target/wasm32-unknown-unknown/release/$($ContractName).wasm"

if (-Not (Test-Path $WasmFile)) {
    Write-Host "Error: WASM file not found at $WasmFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Contract built: $WasmFile" -ForegroundColor Green

Pop-Location

# Step 2: Deploy contract
Write-Host "Step 2: Deploying Contract to Stellar $Network" -ForegroundColor Cyan
Write-Host "Admin Account: $AdminAccount" -ForegroundColor Yellow

try {
    $DeployOutput = soroban contract deploy `
        --wasm $WasmFile `
        --source-account $AdminAccount `
        --network $Network 2>&1
    
    Write-Host $DeployOutput
    
    # Extract contract address from output
    $ContractHash = $DeployOutput | Select-String -Pattern 'contract id: ([a-zA-Z0-9]+)' | ForEach-Object { $_.Matches.Groups[1].Value }
    
    if ([string]::IsNullOrEmpty($ContractHash)) {
        Write-Host "Contract deployment initiated. Check transaction status." -ForegroundColor Yellow
        Write-Host "Run: soroban contract list --network $Network" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "✓ Contract Deployed: $ContractHash" -ForegroundColor Green
    
    # Step 3: Initialize contract
    Write-Host "Step 3: Initializing Contract" -ForegroundColor Cyan
    
    $InitOutput = soroban contract invoke `
        --id $ContractHash `
        --source-account $AdminAccount `
        --network $Network `
        -- `
        initialize `
        --token "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4" `
        --admin $AdminAccount 2>&1
    
    Write-Host $InitOutput
    Write-Host "✓ Contract Initialized" -ForegroundColor Green
    
    # Step 4: Update environment
    Write-Host "Step 4: Updating Environment Variables" -ForegroundColor Cyan
    
    $EnvFile = "frontend/.env.local"
    
    if (Test-Path $EnvFile) {
        $EnvContent = Get-Content $EnvFile
        
        if ($EnvContent -match "NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS") {
            $EnvContent = $EnvContent -replace "NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=.*", "NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=$ContractHash"
        } else {
            $EnvContent += "`nNEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=$ContractHash"
        }
        
        Set-Content -Path $EnvFile -Value $EnvContent
    } else {
        Set-Content -Path $EnvFile -Value "NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=$ContractHash"
    }
    
    Write-Host "✓ Environment updated" -ForegroundColor Green
    
    # Summary
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✓ Deployment Complete!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contract Address: $ContractHash" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Commit changes: git add . && git commit -m 'Deploy Soroban contract'" -ForegroundColor White
    Write-Host "2. Restart frontend: npm run dev" -ForegroundColor White
    Write-Host "3. Start placing bets! 🎮" -ForegroundColor White
    
} catch {
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    exit 1
}
