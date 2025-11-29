'use client';

import { useState, memo, useCallback } from 'react';
import { Prediction } from '@/types';
import { BetPlacementModal } from './BetPlacementModal';

interface BettingGridProps {
  predictions: Prediction[];
}

export const BettingGrid = memo(function BettingGrid({ predictions }: BettingGridProps) {
  const [selectedBetPrediction, setSelectedBetPrediction] = useState<Prediction | null>(null);
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);

  const handleOpenBetModal = useCallback((prediction: Prediction) => {
    setSelectedBetPrediction(prediction);
    setIsBetModalOpen(true);
  }, []);

  const handleCloseBetModal = useCallback(() => {
    setIsBetModalOpen(false);
    setSelectedBetPrediction(null);
  }, []);

  const getProbabilityColor = (probability: number) => {
    if (probability > 70) return 'from-orange-500/30 to-yellow-500/30 border-orange-400/50';
    if (probability > 50) return 'from-yellow-500/30 to-amber-500/30 border-yellow-400/50';
    if (probability > 30) return 'from-red-500/30 to-orange-500/30 border-red-400/50';
    return 'from-red-600/30 to-pink-600/30 border-red-500/50';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return { bg: 'bg-orange-500/20', text: 'text-orange-300', label: '⚡ AKTİF' };
    if (status === 'resolved') return { bg: 'bg-green-500/20', text: 'text-green-300', label: '✅ KAPANDI' };
    return { bg: 'bg-gray-500/20', text: 'text-gray-300', label: '⏸️ BEKLEME' };
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {predictions.map((prediction) => {
          const probability = (prediction.probability as unknown as number) || 50;
          const probColor = getProbabilityColor(probability);
          const status = (prediction.status as unknown as string) || 'active';
          const statusBadge = getStatusBadge(status);

          return (
            <div
              key={prediction.id}
              className="relative group"
            >
              {/* Kart gövdesi - Cyberpunk */}
              <div
                className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${probColor} p-4 min-h-[140px] flex flex-col justify-between hover:border-orange-400/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer`}
                onClick={() => status === 'active' && handleOpenBetModal(prediction)}
              >
                {/* Tahmin Et butonu - sadece aktif kartlarda */}
                {status === 'active' && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 backdrop-blur-md border border-orange-400/50 hover:shadow-orange-500/70 hover:from-orange-600 hover:to-red-600 transition-all">
                      ⚡ TAHMİN ET
                    </span>
                  </div>
                )}

                {/* İçerik */}
                <div className="relative z-10 flex flex-col gap-3">
                  {/* Durum etiketi */}
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text} whitespace-nowrap border border-orange-500/20 w-fit`}>
                    {statusBadge.label}
                  </span>

                  {/* Başlık */}
                  <h3 className="text-sm font-bold text-orange-100 leading-snug line-clamp-3 min-h-[48px] flex-grow">
                    {prediction.title}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boş durumda mesaj */}
      {predictions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-orange-300/60 text-lg">📊 Canlı bahisler yükleniyor...</p>
        </div>
      )}

      {/* Bet Modal */}
      {selectedBetPrediction && (
        <BetPlacementModal
          prediction={selectedBetPrediction}
          isOpen={isBetModalOpen}
          onClose={handleCloseBetModal}
        />
      )}
    </>
  );
});
