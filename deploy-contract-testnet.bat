@echo off
REM Soroban Contract Deployment Script for Windows

setlocal enabledelayedexpansion

set ADMIN_ADDRESS=GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3
set WASM_FILE=contracts\target\wasm32-unknown-unknown\release\prediction_market.wasm
set NETWORK=testnet

echo.
echo ========================================
echo  Soroban Contract Deployment Script
echo ========================================
echo.

REM Check if WASM file exists
if not exist "%WASM_FILE%" (
    echo [ERROR] WASM file not found: %WASM_FILE%
    exit /b 1
)

echo [INFO] WASM file found: %WASM_FILE%
for /F %%A in ('dir /b "%WASM_FILE%"') do set WASM_SIZE=%%~zA
echo [INFO] Size: %WASM_SIZE% bytes
echo.

REM Display deployment info
echo [INFO] Deployment Configuration:
echo   - Admin: %ADMIN_ADDRESS%
echo   - Network: %NETWORK%
echo   - Testnet URL: https://horizon-testnet.stellar.org
echo.

REM Show deployment command
echo [INFO] To deploy, use one of these methods:
echo.
echo METHOD 1: Using Freighter (Recommended for security):
echo   1. Install Freighter browser extension
echo   2. Import admin account
echo   3. Use this command with Freighter signing:
echo   soroban contract deploy ^
echo     --wasm %WASM_FILE% ^
echo     --network %NETWORK% ^
echo     --source-account %ADMIN_ADDRESS%
echo.

echo METHOD 2: Using stored secret key (Less secure):
echo   set SOROBAN_SECRET_KEY=YOUR_SECRET_KEY
echo   soroban contract deploy ^
echo     --wasm %WASM_FILE% ^
echo     --network %NETWORK% ^
echo     --source-account %ADMIN_ADDRESS%
echo.

echo [INFO] After deployment, save the contract ID:
echo   Contract ID will be in format: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
echo.

pause
