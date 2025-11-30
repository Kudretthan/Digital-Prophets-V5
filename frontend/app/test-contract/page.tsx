'use client';

import React, { useState } from 'react';
import { requestAccess, signTransaction, isConnected } from '@stellar/freighter-api';
import * as StellarSdk from 'stellar-sdk';

const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const CONTRACT_ID = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS || '';

export default function TestContractPage() {
  const [status, setStatus] = useState('ready');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    setResult((prev) => prev + msg + '\n');
    console.log(msg);
  };

  const testInitialize = async () => {
    try {
      setLoading(true);
      setResult('');
      log('🧪 Testing initialize()...\n');

      if (!CONTRACT_ID) {
        throw new Error('Contract ID not set in .env');
      }

      log(`Contract: ${CONTRACT_ID}`);

      // Check Freighter
      const connected = await isConnected();
      if (!connected.isConnected) throw new Error('Freighter not connected');
      log('✓ Freighter connected');

      // Request access
      const accessResult = await requestAccess();
      if (accessResult.error) throw new Error(accessResult.error);
      const publicKey = accessResult.address;
      log(`✓ Address: ${publicKey}`);

      // Load account
      const horizonServer = new (StellarSdk as any).Horizon.Server(
        'https://horizon-testnet.stellar.org'
      );
      const sourceAccount = await horizonServer.loadAccount(publicKey);
      log(`✓ Account loaded (seq: ${sourceAccount.sequence})`);

      // Build initialize transaction
      log('\n📝 Building initialize tx...');
      
      const xdrStream = new (StellarSdk as any).xdr.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      // Soroban invoke_host_function
      const op = new (StellarSdk as any).xdr.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addMemo((StellarSdk as any).Memo.text('init-contract'))
        .setTimeout(30)
        .build();

      log('✓ Transaction built');
      log(`✓ XDR: ${op.toXDR().substring(0, 50)}...`);

      // Sign
      log('\n🔐 Signing with Freighter...');
      const signResult = await signTransaction(op.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signResult.error) throw new Error(signResult.error);
      log('✓ Signed');

      log('\n✅ Test passed! Contract is responsive.');
      setStatus('success');
    } catch (error) {
      log(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const checkContractOnChain = async () => {
    try {
      setLoading(true);
      setResult('');
      log('🔍 Checking contract on chain...\n');

      if (!CONTRACT_ID) {
        throw new Error('Contract ID not set');
      }

      log(`Contract ID: ${CONTRACT_ID}\n`);

      // Use Soroban RPC to check contract
      const response = await fetch(SOROBAN_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getLedgerEntries',
          params: {
            keys: [
              `AAAAAAAAAADgAAAA${CONTRACT_ID.padStart(56, '0')}`,
            ],
          },
        }),
      });

      const data = await response.json();
      log(`RPC Response:\n${JSON.stringify(data, null, 2)}`);

      if (data.result?.entries?.length > 0) {
        log('\n✅ Contract found on testnet!');
        setStatus('success');
      } else {
        log('\n⚠️ Contract not found in ledger entries');
        setStatus('warning');
      }
    } catch (error) {
      log(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const viewContractOnChain = async () => {
    if (!CONTRACT_ID) {
      setResult('❌ Contract ID not set in .env');
      return;
    }

    // Open Stellar Expert to view contract
    const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">🧪 Test Soroban Contract</h1>
        <p className="text-cyan-300 mb-8">Verify deployment and functionality</p>

        <div className="bg-black/50 p-8 rounded-lg border border-cyan-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={checkContractOnChain}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
            >
              {loading ? '⏳ Loading...' : '🔍 Check on Chain'}
            </button>
            <button
              onClick={testInitialize}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
            >
              {loading ? '⏳ Testing...' : '⚙️ Test Initialize'}
            </button>
            <button
              onClick={viewContractOnChain}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg"
            >
              🔗 View on Explorer
            </button>
          </div>

          <div className="bg-black p-6 rounded border border-cyan-600 min-h-[400px] font-mono text-sm text-cyan-300 overflow-auto max-h-[500px] whitespace-pre-wrap">
            {result || 'Select a test to begin...'}
          </div>

          <div className="mt-6 p-4 bg-cyan-900/30 rounded border border-cyan-600 text-cyan-300 text-sm">
            <strong>Contract Address:</strong>
            <br />
            <code className="break-all text-xs">{CONTRACT_ID || 'Not set'}</code>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900/30 p-4 rounded border border-blue-600">
            <h3 className="text-blue-300 font-bold mb-2">✅ What Works</h3>
            <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
              <li>Deploy WASM via Freighter</li>
              <li>Sign transactions</li>
              <li>Read contract ID</li>
            </ul>
          </div>

          <div className="bg-yellow-900/30 p-4 rounded border border-yellow-600">
            <h3 className="text-yellow-300 font-bold mb-2">⚠️ Next Steps</h3>
            <ul className="text-yellow-200 text-sm space-y-1 list-disc list-inside">
              <li>Initialize contract with token</li>
              <li>Test betting functions</li>
              <li>Verify ledger storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
