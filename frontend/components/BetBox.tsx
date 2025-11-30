'use client';

import React, { useState } from 'react';
import { requestAccess, isConnected } from '@stellar/freighter-api';
import { placeBetOnContract } from '@/lib/soroban';

interface BetBoxProps {
  predictionId: number;
  question: string;
  yesAmount: number;
  noAmount: number;
}

export default function BetBox({ predictionId, question, yesAmount, noAmount }: BetBoxProps) {
  const [amount, setAmount] = useState('1');
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleBet = async (prediction: boolean) => {
    try {
      setLoading(true);
      setResult('⏳ Bağlantı kontrol ediliyor...');

      // Check Freighter
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error('Freighter connected değil');
      }

      // Request access
      setResult('⏳ Freighter izni isteniyor...');
      const accessResult = await requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }

      const publicKey = accessResult.address;
      if (!publicKey) {
        throw new Error('Cüzdan adresi alınamadı');
      }

      setResult('⏳ Bahis veriliyor...');
      const betAmount = parseFloat(amount);
      if (isNaN(betAmount) || betAmount <= 0) {
        throw new Error('Geçerli bir miktar girin');
      }

      // Place bet on contract
      const txId = await placeBetOnContract(
        publicKey,
        predictionId,
        betAmount,
        prediction,
        'Test SDF Network ; September 2015'
      );

      setResult(`✅ Bahis başarılı!\nTransaction: ${txId.substring(0, 16)}...`);
      setSelectedPrediction(null);
      setAmount('1');
    } catch (error) {
      setResult(`❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const total = yesAmount + noAmount;
  const yesPercent = total > 0 ? (yesAmount / total) * 100 : 50;
  const noPercent = total > 0 ? (noAmount / total) * 100 : 50;

  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-2 border-cyan-600 rounded-lg p-6 mb-4">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">{question}</h3>

      {/* Odds Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/50 p-4 rounded border border-green-600">
          <div className="text-sm text-green-400 mb-2">EVET</div>
          <div className="text-2xl font-bold text-green-300">{yesPercent.toFixed(1)}%</div>
          <div className="text-xs text-green-600">{yesAmount.toFixed(2)} XLM</div>
        </div>
        <div className="bg-black/50 p-4 rounded border border-red-600">
          <div className="text-sm text-red-400 mb-2">HAYIR</div>
          <div className="text-2xl font-bold text-red-300">{noPercent.toFixed(1)}%</div>
          <div className="text-xs text-red-600">{noAmount.toFixed(2)} XLM</div>
        </div>
      </div>

      {/* Bet Input */}
      {result ? (
        <div className="bg-black/50 p-4 rounded border border-cyan-600 mb-4 text-sm font-mono text-cyan-300">
          {result}
        </div>
      ) : (
        <>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Bahis miktarı (XLM)"
            disabled={loading}
            className="w-full bg-black/50 border border-cyan-600 text-cyan-300 px-4 py-2 rounded mb-4 disabled:opacity-50"
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleBet(true)}
              disabled={loading || !amount}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 rounded"
            >
              {loading ? '⏳' : '✅'} EVET ({amount} XLM)
            </button>
            <button
              onClick={() => handleBet(false)}
              disabled={loading || !amount}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 rounded"
            >
              {loading ? '⏳' : '❌'} HAYIR ({amount} XLM)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
