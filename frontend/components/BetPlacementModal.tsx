'use client';

import { useState } from 'react';
import { Prediction } from '@/types';
import useAppStore from '@/store/app';
import PredictionMarketService from '@/lib/predictionMarket';

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
  const { wallet } = useAppStore();
  const [betAmount, setBetAmount] = useState(100);
  const [betType, setBetType] = useState<'yes' | 'no'>('yes');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculatePayout = () => {
    if (betType === 'yes') {
      return (betAmount * prediction.odds).toFixed(2);
    } else {
      return (betAmount / prediction.odds).toFixed(2);
    }
  };

  const handlePlaceBet = async () => {
    if (!wallet?.isConnected) {
      alert('Lütfen cüzdan bağlayın');
      return;
    }

    setIsSubmitting(true);

    try {
      // Try smart contract placement first
      try {
        const service = new PredictionMarketService();
        const txHash = await service.placeBet(
          parseInt(prediction.id),
          wallet.publicKey,
          betAmount,
          betType === 'yes',
          (window as any).freighter
        );

        console.log('Bet placed on-chain:', txHash);
        alert(`✓ Bahis blockchain'e yerleştirildi!\nİşlem: ${txHash}\nPotansiyel kazanç: ${calculatePayout()} xlm`);
        onClose();
      } catch (contractError) {
        console.warn('Contract placement failed, falling back to API:', contractError);
        
        // Fallback to API
        const response = await fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: wallet.publicKey,
            predictionId: prediction.id,
            amountxlm: betAmount,
            prediction: betType,
          }),
        });

        if (response.ok) {
          alert(`✓ Bahis başarıyla yerleştirildi!\nPotansiyel kazanç: ${calculatePayout()} xlm`);
          onClose();
        } else {
          alert('Bahis yerleştirilemedi');
        }
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Hata oluştu: ' + (error as any).message);
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
      <div className="relative z-10 bg-gradient-to-br from-black/95 via-orange-950/40 to-black/95 border-2 border-orange-500/50 rounded-3xl p-6 max-w-lg w-full mx-4 my-auto shadow-[0_0_60px_rgba(255,107,0,0.4)] max-h-[90vh] overflow-y-auto cyber-box">
        {/* Kapat butonu */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 hover:text-orange-300 transition-all text-lg"
        >
          ✕
        </button>

        {/* Başlık */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-1">⚡</div>
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
            ⚡ BAHİS TUTARI (xlm)
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">xlm</div>
          </div>
          {/* Hızlı tutar butonları */}
          <div className="flex gap-2 mt-2">
            {[50, 100, 250, 500, 1000].map((amount) => (
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
            <p className="text-xs text-red-400/70">xlm</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-2 text-center">
            <p className="text-xs text-orange-300/50 mb-0.5">ORAN</p>
            <p className="text-base font-bold text-yellow-400">{prediction.odds.toFixed(2)}x</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-2 text-center">
            <p className="text-xs text-orange-300/50 mb-0.5">KAZANÇ</p>
            <p className="text-base font-bold text-green-400">+{calculatePayout()}</p>
            <p className="text-xs text-green-400/70">xlm</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePlaceBet}
            disabled={isSubmitting || !wallet?.isConnected}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:shadow-none text-base neon-border"
          >
            {isSubmitting ? '⏳ İşleniyor...' : !wallet?.isConnected ? '🔗 Cüzdan Bağlayın' : '⚡ BAHİS YAP'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 hover:text-orange-200 font-bold rounded-xl transition-all border border-orange-500/30 text-sm"
          >
            İptal
          </button>
        </div>

        {/* Alt bilgi */}
        {wallet?.isConnected && (
          <p className="text-center text-orange-300/40 text-xs mt-3">
            Cüzdan: {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)} • Bakiye: {wallet.xlmBalance?.toFixed(2) || '0'} XLM
          </p>
        )}
      </div>
    </div>
  );
}
