'use client';

import React, { useState } from 'react';
import { requestAccess, signTransaction, isConnected } from '@stellar/freighter-api';
import * as StellarSdk from 'stellar-sdk';

const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export default function DeployPage() {
  const [status, setStatus] = useState('ready');
  const [result, setResult] = useState('');
  const [contractId, setContractId] = useState('');
  const [loading, setLoading] = useState(false);

  const deployContract = async () => {
    try {
      setLoading(true);
      setStatus('deploying');
      setResult('🚀 Deploy başlatılıyor...\n');

      // 1. Check Freighter
      setResult((prev) => prev + '✓ Freighter kontrol ediliyor...\n');
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error('Freighter connected degil');
      }

      // 2. Request access
      setResult((prev) => prev + '✓ Freighter izni isteniyor...\n');
      const accessResult = await requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }
      const publicKey = accessResult.address;
      setResult((prev) => prev + `✓ Adres: ${publicKey}\n`);

      // 3. Read WASM file
      setResult((prev) => prev + '⏳ WASM dosyasi yukleniyor...\n');
      const wasmResponse = await fetch('/api/contract/wasm');
      if (!wasmResponse.ok) throw new Error('WASM yuklenemedi');
      const wasmBuffer = await wasmResponse.arrayBuffer();
      setResult((prev) => prev + `✓ WASM: ${(wasmBuffer.byteLength / 1024).toFixed(2)} KB\n`);

      // 4. Load account
      setResult((prev) => prev + '⏳ Hesap yukleniyor...\n');
      const horizonServer = new (StellarSdk as any).Horizon.Server('https://horizon-testnet.stellar.org');
      const sourceAccount = await horizonServer.loadAccount(publicKey);
      setResult((prev) => prev + `✓ Sequence: ${sourceAccount.sequence}\n`);

      // 5. Build upload transaction
      setResult((prev) => prev + '⏳ Upload transaction hazirlaniyor...\n');
      const uploadTx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addMemo(StellarSdk.Memo.text('upload-wasm'))
        .setTimeout(30)
        .build();

      // 6. Sign with Freighter
      setResult((prev) => prev + '⏳ Freighter ile imzalaniyor...\n');
      const signResult = await signTransaction(uploadTx.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signResult.error) throw new Error(signResult.error);
      setResult((prev) => prev + '✓ Imzalandi\n');

      // 7. Submit to Soroban RPC
      setResult((prev) => prev + '⏳ Soroban RPC\'ye yollaniyor...\n');
      const sorobanRpc = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);
      
      const submitResponse = await fetch(SOROBAN_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendTransaction',
          params: {
            transaction: signResult.signedTxXdr,
          },
        }),
      });

      const rpcResult = await submitResponse.json();
      
      if (rpcResult.error) {
        throw new Error(rpcResult.error.message || 'RPC error');
      }

      setResult((prev) => prev + `✓ Transaction: ${rpcResult.result.hash}\n`);
      setResult((prev) => prev + '\n✅ Deploy basarili!\n');
      setContractId(rpcResult.result.hash);
      setStatus('success');
    } catch (error) {
      setResult((prev) => prev + `\n❌ Hata: ${error instanceof Error ? error.message : 'Unknown'}\n`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">🚀 Deploy Contract</h1>
        <p className="text-cyan-300 mb-8">Freighter cuzdan ile imzala ve deploy et</p>

        <div className="bg-black/50 p-8 rounded-lg border border-cyan-700">
          <button
            onClick={deployContract}
            disabled={loading || status === 'deploying'}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 rounded-lg mb-6 text-lg"
          >
            {loading ? '⏳ Deploy ediliyor...' : '🚀 Deploy Basla'}
          </button>

          <div className="bg-black p-4 rounded border border-cyan-600 min-h-[300px] font-mono text-sm text-cyan-300 overflow-auto max-h-[400px] whitespace-pre-wrap">
            {result || 'Baslamak icin tiklayiniz...'}
          </div>

          {contractId && (
            <div className="mt-6 p-4 bg-green-900/30 rounded border border-green-600">
              <p className="text-green-300 text-sm">
                <strong>Contract ID:</strong>
              </p>
              <code className="text-green-200 break-all">{contractId}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
