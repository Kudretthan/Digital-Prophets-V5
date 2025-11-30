/**
 * Soroban Smart Contract Integration
 * Prediction Market Contract Interaction
 */

import * as StellarSdk from 'stellar-sdk';
import { signTx } from './freighter';

export const SOROBAN_CONFIG = {
  // Contract address will be set after deployment
  contractAddress: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS || '',
  
  // Testnet configuration
  horizonUrl: 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  
  // XLM token address on testnet
  xlmTokenAddress: 'GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3',
  
  // Native XLM on Soroban
  nativeXlm: 'ec32fb795cfe65c3f749f60d195a654301a5389d479361e29de376615b88efc6',
  
  // Betting pool wallet (receives bets)
  bettingPoolAddress: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || 'GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3',
};

const server = new (StellarSdk as any).Horizon.Server(SOROBAN_CONFIG.horizonUrl);

/**
 * Check if contract is deployed and configured
 */
export function isContractDeployed(): boolean {
  return !!SOROBAN_CONFIG.contractAddress && SOROBAN_CONFIG.contractAddress.startsWith('C');
}

/**
 * Place a bet on a prediction using Soroban contract
 */
export async function placeBetOnContract(
  userPublicKey: string,
  predictionId: number,
  amount: number,  // In XLM
  prediction: boolean,  // true = YES, false = NO
  networkPassphrase: string
): Promise<string> {
  if (!SOROBAN_CONFIG.contractAddress) {
    throw new Error('Contract not deployed');
  }

  try {
    console.log('🎲 Placing bet on contract...');
    console.log(`  Prediction ID: ${predictionId}`);
    console.log(`  Amount: ${amount} XLM`);
    console.log(`  Prediction: ${prediction ? 'YES' : 'NO'}`);
    
    const sourceAccount = await server.loadAccount(userPublicKey);
    console.log(`Account loaded: seq=${sourceAccount.sequence}`);
    
    // Convert XLM to stroops and back to string (Stellar format)
    const amountInStroops = Math.floor(amount * 10000000);
    const amountStr = (amountInStroops / 10000000).toFixed(7);
    
    console.log(`Amount: ${amount} XLM → ${amountInStroops} stroops → ${amountStr} XLM`);
    
    // Send bet amount as payment to betting pool (contract processes via memo)
    const transaction = new (StellarSdk as any).TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase,
    })
      .addOperation(
        (StellarSdk as any).Operation.payment({
          destination: SOROBAN_CONFIG.bettingPoolAddress,  // Send to betting pool
          asset: (StellarSdk as any).Asset.native(),
          amount: amountStr,  // Use properly formatted amount
        })
      )
      .addMemo((StellarSdk as any).Memo.text(`bet-${predictionId}-${prediction ? 'yes' : 'no'}`))
      .setTimeout(300)
      .build();

    const signedXdr = await signTx(
      transaction.toXDR(),
      networkPassphrase,
      userPublicKey
    );

    const tx = (StellarSdk as any).TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result = await server.submitTransaction(tx);

    console.log('✅ Bet placed successfully:', result.id);
    return result.id;
  } catch (error: any) {
    console.error('❌ Error placing bet on contract:', error);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Resolve a prediction on the contract (admin only)
 */
export async function resolvePredictionOnContract(
  adminPublicKey: string,
  predictionId: number,
  result: boolean,  // true = YES won, false = NO won
  networkPassphrase: string
): Promise<string> {
  if (!SOROBAN_CONFIG.contractAddress) {
    throw new Error('Soroban contract address not configured. Deploy the contract first.');
  }

  try {
    console.log('🔍 Resolving prediction on contract...');
    console.log(`  Prediction ID: ${predictionId}`);
    console.log(`  Result: ${result ? 'YES' : 'NO'}`);
    
    const sourceAccount = await server.loadAccount(adminPublicKey);
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addMemo(StellarSdk.Memo.text(`resolve-${predictionId}-${result ? 'YES' : 'NO'}`))
      .setTimeout(30)
      .build();

    const signedXdr = await signTx(
      transaction.toXDR(),
      networkPassphrase,
      adminPublicKey
    );

    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result_tx = await server.submitTransaction(tx);

    console.log('✅ Prediction resolved successfully:', result_tx.id);
    return result_tx.id;
  } catch (error) {
    console.error('❌ Error resolving prediction on contract:', error);
    throw error;
  }
}

/**
 * Get prediction details from contract
 * Returns: [yes_amount, no_amount, resolved, result]
 */
export async function getPredictionFromContract(predictionId: number) {
  if (!SOROBAN_CONFIG.contractAddress) {
    console.warn('Soroban contract not configured');
    return null;
  }

  try {
    console.log(`📊 Fetching prediction ${predictionId} from contract...`);
    
    // To fetch from contract, we'd use:
    // 1. Soroban RPC client
    // 2. Contract ABI
    // 3. ledger_read to get storage
    
    // For now, placeholder - backend should fetch from Supabase
    return null;
  } catch (error) {
    console.error('Error fetching prediction from contract:', error);
    return null;
  }
}

/**
 * Create a new prediction market (admin only)
 */
export async function createPredictionOnContract(
  adminPublicKey: string,
  predictionId: number,
  networkPassphrase: string
): Promise<string> {
  if (!SOROBAN_CONFIG.contractAddress) {
    throw new Error('Soroban contract address not configured.');
  }

  try {
    console.log(`📝 Creating prediction ${predictionId} on contract...`);
    
    const sourceAccount = await server.loadAccount(adminPublicKey);
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addMemo(StellarSdk.Memo.text(`create-pred-${predictionId}`))
      .setTimeout(30)
      .build();

    const signedXdr = await signTx(
      transaction.toXDR(),
      networkPassphrase,
      adminPublicKey
    );

    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result = await server.submitTransaction(tx);

    console.log('✅ Prediction created successfully:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Error creating prediction on contract:', error);
    throw error;
  }
}

/**
 * Initialize the contract (one-time setup, admin only)
 */
export async function initializeContractOnChain(
  adminPublicKey: string,
  tokenAddress: string,
  networkPassphrase: string
): Promise<string> {
  if (!SOROBAN_CONFIG.contractAddress) {
    throw new Error('Soroban contract address not configured.');
  }

  try {
    console.log('⚙️ Initializing contract on chain...');
    
    const sourceAccount = await server.loadAccount(adminPublicKey);
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addMemo(StellarSdk.Memo.text('init-contract'))
      .setTimeout(30)
      .build();

    const signedXdr = await signTx(
      transaction.toXDR(),
      networkPassphrase,
      adminPublicKey
    );

    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result = await server.submitTransaction(tx);

    console.log('✅ Contract initialized:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Error initializing contract:', error);
    throw error;
  }
}

/**
 * Get user's bets for a prediction
 */
export async function getUserBetsFromContract(
  predictionId: number,
  userAddress: string
): Promise<any[]> {
  if (!SOROBAN_CONFIG.contractAddress) {
    return [];
  }

  try {
    console.log(`💰 Fetching bets for user ${userAddress} on prediction ${predictionId}...`);
    // Implementation would use Soroban RPC
    return [];
  } catch (error) {
    console.error('Error fetching user bets:', error);
    return [];
  }
}

export default {
  placeBetOnContract,
  resolvePredictionOnContract,
  getPredictionFromContract,
  createPredictionOnContract,
  initializeContractOnChain,
  getUserBetsFromContract,
  isContractDeployed,
  SOROBAN_CONFIG,
};
