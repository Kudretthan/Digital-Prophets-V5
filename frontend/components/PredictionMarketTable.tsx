'use client';

import { useEffect, useState } from 'react';
import { Prediction } from '@/types';
import useAppStore from '@/store/app';
import { BetPlacementModal } from './BetPlacementModal';

interface PredictionTableProps {
  predictions: Prediction[];
  onSelectPrediction: (prediction: Prediction) => void;
}

export function PredictionMarketTable({ predictions, onSelectPrediction }: PredictionTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Prediction | 'probability' | 'volatility';
    direction: 'asc' | 'desc';
  }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const [animatingPredictions, setAnimatingPredictions] = useState<Set<string>>(new Set());
  const [selectedBetPrediction, setSelectedBetPrediction] = useState<Prediction | null>(null);
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);

  // Simulate price movement animations
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndices = Math.floor(Math.random() * predictions.length);
      if (predictions[randomIndices]) {
        setAnimatingPredictions((prev) => {
          const next = new Set(prev);
          next.add(predictions[randomIndices].id);
          setTimeout(() => {
            next.delete(predictions[randomIndices].id);
            setAnimatingPredictions(next);
          }, 500);
          return next;
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [predictions]);

  const sortedPredictions = [...predictions].sort((a, b) => {
    let aVal: any = a[sortConfig.key as keyof Prediction];
    let bVal: any = b[sortConfig.key as keyof Prediction];

    if (sortConfig.key === 'probability') {
      aVal = a.probability;
      bVal = b.probability;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: any) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenBetModal = (prediction: Prediction, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBetPrediction(prediction);
    setIsBetModalOpen(true);
  };

  const handleCloseBetModal = () => {
    setIsBetModalOpen(false);
    setSelectedBetPrediction(null);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability > 70) return 'text-green-300';
    if (probability > 50) return 'text-amber-300';
    if (probability > 30) return 'text-orange-300';
    return 'text-red-300';
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30';
    if (status === 'resolved') return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-400/30';
    return 'bg-white/10 text-white/70 border border-white/20';
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 text-white/80">
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('title')}
              >
                TAHMİN KONUSU
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('createdBy')}
              >
                TAHMİNCİ
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('totalxlmStaked')}
              >
                xlm STAKED
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('probability')}
              >
                OLASILIK
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('odds')}
              >
                ORAN
              </th>
              <th className="px-4 py-3 text-center">DURUM</th>
              <th className="px-4 py-3 text-center">İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {sortedPredictions.map((prediction, idx) => {
              const isAnimating = animatingPredictions.has(prediction.id);
              const priceChange = Math.random() > 0.5 ? 'up' : 'down';

              return (
                <tr
                  key={prediction.id}
                  className={`border-b border-white/10 hover:bg-white/5 cursor-pointer transition-all ${
                    isAnimating ? (priceChange === 'up' ? 'bg-green-500/10' : 'bg-red-500/10') : ''
                  }`}
                  onClick={() => onSelectPrediction(prediction)}
                >
                  <td className="px-4 py-3 max-w-xs truncate text-white hover:text-cyan-300">{prediction.title}</td>
                  <td className="px-4 py-3 text-white/80">{prediction.createdBy}</td>
                  <td className={`px-4 py-3 text-right ${isAnimating ? (priceChange === 'up' ? 'text-green-300' : 'text-red-300') : 'text-white/80'}`}>
                    {prediction.totalxlmStaked.toLocaleString()}
                    {isAnimating && (
                      <span className="ml-1">{priceChange === 'up' ? '▲' : '▼'}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${getProbabilityColor(prediction.probability)}`}>
                    {prediction.probability}%
                  </td>
                  <td className="px-4 py-3 text-right text-purple-300">
                    {prediction.odds.toFixed(2)}x
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(prediction.status)}`}>
                      {prediction.status === 'active' ? '🟢 AKTIF' : prediction.status === 'resolved' ? '🔵 ÇÖZÜLDÜ' : '⚪ BEKLEMEDe'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={(e) => handleOpenBetModal(prediction, e)}
                      className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-lg text-xs transition-all hover:shadow-lg"
                    >
                      BET
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedBetPrediction && (
        <BetPlacementModal
          prediction={selectedBetPrediction}
          isOpen={isBetModalOpen}
          onClose={handleCloseBetModal}
        />
      )}
    </>
  );
}
