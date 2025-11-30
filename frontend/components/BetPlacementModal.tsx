'use client';

import { useState } from 'react';
import { Prediction } from '@/types';
import { requestAccess, isConnected } from '@stellar/freighter-api';
import { placeBetOnContract } from '@/lib/soroban';

interface BetPlacementModalProps {
  prediction: Prediction;
  isOpen: boolean;
  onClose: () => void;
}

export function BetPlacementModal({
  prediction,
  isOpen,
  onClose,
}: BetPlacementModalProps) {
  const [betAmount, setBetAmount] = useState(1);
  const [betType, setBetType] = useState<'yes' | 'no'>('yes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState('');

  if (!isOpen) return null;

  const calculatePayout = () => {
    const odds = prediction.odds || 2.0;
    return (betAmount * odds).toFixed(2);
  };

  const handlePlaceBet = async () => {
    try {
      setIsSubmitting(true);
      setResult('⏳ İşlem başlatılıyor...');

      // Check Freighter connection
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error('Freighter bağlı değil');
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
      
      // Place bet via contract
      const txId = await placeBetOnContract(
        publicKey,
        parseInt(prediction.id),
        betAmount,
        betType === 'yes',
        'Test SDF Network ; September 2015'
      );

      setResult(`✅ Bahis başarılı!\nTx: ${txId.substring(0, 16)}...`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setResult(`❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      {/* Arka plan blur overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Panel - Cyberpunk */}
      <div className="relative z-10 bg-gradient-to-br from-black/95 via-orange-950/40 to-black/95 border-2 border-orange-500/50 rounded-3xl p-6 max-w-lg w-full mx-4 my-auto shadow-[0_0_60px_rgba(255,107,0,0.4)] max-h-[90vh] overflow-y-auto">
        {/* Kapat butonu */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 hover:text-orange-300 transition-all text-lg"
        >
          ✕
        </button>

        {/* Başlık */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-1">💰</div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">BAHİS YERLEŞTIR</h2>
          <p className="text-orange-300/50 text-xs mt-1">Tahmininizi yapın ve kazanın</p>
        </div>

        {/* Tahmin Başlığı */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-4">
          <p className="text-xs text-orange-400 mb-1 font-semibold">📌 TAHMİN</p>
          <p className="text-orange-100 font-bold text-sm line-clamp-2">{prediction.title}</p>
        </div>

        {/* Bet Type Selection */}
        <div className="mb-4">
          <p className="text-sm font-bold text-orange-300/80 mb-2">TAHMİN TÜRÜ</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBetType('yes')}
              className={`py-3 rounded-xl font-bold text-base transition-all ${
                betType === 'yes'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 border-2 border-green-400'
                  : 'bg-orange-500/10 text-orange-300/70 hover:bg-orange-500/20 border border-orange-500/30'
              }`}
            >
              ✓ EVET
            </button>
            <button
              onClick={() => setBetType('no')}
              className={`py-3 rounded-xl font-bold text-base transition-all ${
                betType === 'no'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 border-2 border-red-400'
                  : 'bg-orange-500/10 text-orange-300/70 hover:bg-orange-500/20 border border-orange-500/30'
              }`}
            >
              ✗ HAYIR
            </button>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-orange-300/80 mb-2">
            ⚡ BAHİS TUTARI (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="10000"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl text-orange-100 text-lg font-bold placeholder-orange-300/40 focus:outline-none focus:border-orange-500 focus:bg-orange-500/20 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">XLM</div>
          </div>
          {/* Quick amount buttons */}
          <div className="flex gap-2 mt-2">
            {[1, 5, 10, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  betAmount === amount 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                    : 'bg-orange-500/20 text-orange-300/60 hover:bg-orange-500/30'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Calculation */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-xl p-2 text-center">
            <p className="text-xs text-orange-300/50 mb-0.5">RİSK</p>
            <p className="text-base font-bold text-red-400">{betAmount}</p>
            <p className="text-xs text-red-400/70">XLM</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-2 text-center">
            <p className="text-xs text-orange-300/50 mb-0.5">ORAN</p>
            <p className="text-base font-bold text-yellow-400">2.0x</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-2 text-center">
            <p className="text-xs text-orange-300/50 mb-0.5">KAZANÇ</p>
            <p className="text-base font-bold text-green-400">+{calculatePayout()}</p>
            <p className="text-xs text-green-400/70">XLM</p>
          </div>
        </div>

        {/* Fee Information */}
        <div className="mb-4 p-2 bg-orange-500/5 border border-orange-500/20 rounded-lg text-center">
          <p className="text-xs text-orange-300/60">⛽ Network Ücreti: <span className="text-orange-300 font-bold">0.00001 XLM</span></p>
          <p className="text-xs text-orange-300/60 mt-1">Toplam çıkış: <span className="text-orange-400 font-bold">{(betAmount + 0.00001).toFixed(5)} XLM</span></p>
        </div>

        {/* Status message */}
        {result && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
            <p className="text-sm text-orange-100 whitespace-pre-wrap">{result}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePlaceBet}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:shadow-none text-base"
          >
            {isSubmitting ? '⏳ İşleniyor...' : '⚡ BAHİS YAP'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 font-bold rounded-xl transition-all border border-orange-500/30 text-sm disabled:opacity-50"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}