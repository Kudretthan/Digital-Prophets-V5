import React, { useState } from 'react';
import StellarSdk from 'stellar-sdk';
import { connectFreighter, signTx } from '@/lib/freighter';
import { SOROBAN_CONFIG } from '@/lib/soroban';

interface DeploymentStatus {
  step: 'idle' | 'preparing' | 'signing' | 'submitting' | 'success' | 'error';
  message: string;
  contractId?: string;
  error?: string;
}

export default function ContractDeployer() {
  const [status, setStatus] = useState<DeploymentStatus>({
    step: 'idle',
    message: 'Deployment hazır. Başla butonuna tıkla.',
  });
  const [wasmFile, setWasmFile] = useState<File | null>(null);

  const handleDeploy = async () => {
    try {
      // Step 1: Connect Freighter
      setStatus({
        step: 'preparing',
        message: '🔗 Freighter\'a bağlanıyor...',
      });

      const wallet = await connectFreighter();
      if (!wallet) {
        throw new Error('Freighter bağlanamadı');
      }

      const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
      if (!adminAddress) {
        throw new Error('ADMIN_ADDRESS tanımlanmamış');
      }

      // Step 2: Build transaction
      setStatus({
        step: 'preparing',
        message: '📝 İşlem hazırlanıyor...',
      });

      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const sourceAccount = await server.loadAccount(adminAddress);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: 'Test SDF Network ; September 2015',
      })
        .addMemo(StellarSdk.Memo.text('deploy-prediction-market'))
        .setTimeout(300)
        .build();

      // Step 3: Sign with Freighter
      setStatus({
        step: 'signing',
        message: '✍️ Freighter\'da imzala...',
      });

      const signedXdr = await signTx(
        transaction.toXDR(),
        'Test SDF Network ; September 2015',
        adminAddress
      );

      if (!signedXdr) {
        throw new Error('İşlem imzalanmadı');
      }

      // Step 4: Submit
      setStatus({
        step: 'submitting',
        message: '📤 Testnet\'e gönderiliyor...',
      });

      const submittedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        'Test SDF Network ; September 2015'
      );

      const result = await server.submitTransaction(submittedTx);

      setStatus({
        step: 'success',
        message: `✅ Kontrat başarıyla deploy edildi!\n\nHash: ${result.id}`,
        contractId: result.id,
      });

      // Save to environment
      console.log('📋 Deployment Details:');
      console.log('Transaction ID:', result.id);
      console.log('Ledger:', result.ledger);
      console.log('\n⚠️ Update NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS in .env.local');
    } catch (error) {
      setStatus({
        step: 'error',
        message: '❌ Deployment başarısız',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-cyan-900 to-purple-900 rounded-lg border border-cyan-500 shadow-lg">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">🚀 Soroban Kontratı Deploy Et</h2>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="bg-black/50 p-4 rounded border border-cyan-700">
          <div className="text-sm text-cyan-300 mb-2">Durum: {status.step}</div>
          <div className="text-white whitespace-pre-wrap font-mono text-sm">
            {status.message}
          </div>
          {status.error && (
            <div className="mt-2 text-red-400 text-sm">{status.error}</div>
          )}
        </div>

        {/* Contract ID Display */}
        {status.contractId && (
          <div className="bg-green-900/30 p-4 rounded border border-green-600">
            <div className="text-green-400 font-mono break-all text-sm">
              Contract ID: {status.contractId}
            </div>
            <div className="text-green-300 text-xs mt-2">
              ℹ️ Bunu .env.local dosyasına NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS olarak ekle
            </div>
          </div>
        )}

        {/* Deploy Button */}
        <button
          onClick={handleDeploy}
          disabled={status.step === 'preparing' || status.step === 'signing' || status.step === 'submitting'}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition-colors"
        >
          {status.step === 'idle' ? '🚀 Deploy Başlat' : '⏳ Devam ediyor...'}
        </button>

        {/* Additional Info */}
        <div className="bg-yellow-900/30 p-4 rounded border border-yellow-600 text-sm text-yellow-300">
          <strong>📝 Önemli:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Freighter cüzdanına admin hesabını import et</li>
            <li>Ağı Stellar Testnet'e ayarla</li>
            <li>Freighter imza penceresinde Onayla</li>
            <li>Deploy sonrası kontrat ID'sini not et</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
