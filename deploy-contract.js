#!/usr/bin/env node

/**
 * Soroban Contract Deployment Script
 * Deploys the prediction market contract to Stellar testnet
 */

const StellarSdk = require('stellar-sdk');
const fs = require('fs');
const path = require('path');

const ADMIN_ADDRESS = 'GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3';
const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

async function deployContract() {
  try {
    console.log('🚀 Starting Soroban Contract Deployment...\n');

    // Read WASM file
    const wasmPath = path.join(__dirname, 'contracts', 'target', 'wasm32-unknown-unknown', 'release', 'prediction_market.wasm');
    
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file not found: ${wasmPath}`);
    }

    const wasmBuffer = fs.readFileSync(wasmPath);
    console.log(`✅ WASM file loaded: ${wasmPath}`);
    console.log(`   Size: ${(wasmBuffer.length / 1024).toFixed(2)} KB\n`);

    // Get admin account details
    const server = new StellarSdk.Server(HORIZON_URL);
    console.log('📡 Fetching admin account details from Horizon...');
    const adminAccount = await server.loadAccount(ADMIN_ADDRESS);
    console.log(`✅ Admin account loaded`);
    console.log(`   Address: ${ADMIN_ADDRESS}`);
    console.log(`   Sequence: ${adminAccount.sequence}\n`);

    // Build installation transaction
    console.log('🔨 Building installation transaction...');
    
    const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: TESTNET_PASSPHRASE,
    })
      .addMemo(StellarSdk.Memo.text('deploy-prediction-market-v1'))
      .setTimeout(300)
      .build();

    console.log('⚠️  Manual signing required!');
    console.log('\n📝 To complete deployment with Freighter wallet:');
    console.log('1. Import your secret key into Freighter wallet');
    console.log('2. Set network to Stellar Testnet');
    console.log('3. Sign the transaction via Freighter');
    console.log('\n💡 For automated deployment, use stellar-cli with stored secret key\n');

    // Output transaction details
    console.log('📋 Transaction Details:');
    console.log(`   XDR (for signing):`);
    console.log(`   ${transaction.toXDR()}\n`);

    console.log('🔗 Soroban RPC URL: ' + SOROBAN_RPC_URL);
    console.log('🌐 Testnet: https://stellar.expert/explorer/testnet/');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployContract();
