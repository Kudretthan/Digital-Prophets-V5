'use client';

import { Prediction } from '@/types';

interface MarketStatsProps {
  predictions: Prediction[];
}

export function MarketStats({ predictions }: MarketStatsProps) {
  const activePredictions = predictions.filter((p) => p.status === 'active').length;
  const resolvedPredictions = predictions.filter((p) => p.status === 'resolved').length;
  const totalVolume = predictions.reduce((sum, p) => sum + p.totalxlmStaked, 0);

  const averageOdds =
    predictions.length > 0
      ? (predictions.reduce((sum, p) => sum + p.odds, 0) / predictions.length).toFixed(2)
      : '0.00';

  const highestProbability = predictions.length > 0
    ? Math.max(...predictions.map((p) => p.probability))
    : 0;

  const lowestProbability = predictions.length > 0
    ? Math.min(...predictions.map((p) => p.probability))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-900 border-2 border-green-400 rounded-lg p-6 font-mono">
        <div className="text-sm text-gray-400 mb-2">AKTİF TAHMİN</div>
        <div className="text-4xl font-bold text-green-400">{activePredictions}</div>
        <div className="text-xs text-gray-500 mt-2">
          Toplam: {predictions.length}
        </div>
      </div>

      <div className="bg-gray-900 border-2 border-blue-400 rounded-lg p-6 font-mono">
        <div className="text-sm text-gray-400 mb-2">TOPLAM VOLÜMİ</div>
        <div className="text-4xl font-bold text-blue-400">
          {(totalVolume / 1000).toFixed(1)}K
        </div>
        <div className="text-xs text-gray-500 mt-2">xlm Staked</div>
      </div>

      <div className="bg-gray-900 border-2 border-purple-400 rounded-lg p-6 font-mono">
        <div className="text-sm text-gray-400 mb-2">ORTALAMA ORAN</div>
        <div className="text-4xl font-bold text-purple-400">{averageOdds}x</div>
        <div className="text-xs text-gray-500 mt-2">Tüm Tahminler</div>
      </div>

      <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-6 font-mono">
        <div className="text-sm text-gray-400 mb-2">OLASILIK ARALIGI</div>
        <div className="text-xl font-bold text-yellow-400">
          {lowestProbability}% - {highestProbability}%
        </div>
        <div className="text-xs text-gray-500 mt-2">Min - Max</div>
      </div>
    </div>
  );
}
