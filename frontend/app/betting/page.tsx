'use client';

import React, { useState, useEffect } from 'react';
import BetBox from '@/components/BetBox';

interface Prediction {
  id: number;
  question: string;
  yesAmount: number;
  noAmount: number;
  resolved: boolean;
  result?: boolean;
}

export default function BettingPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch predictions from API
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predictions');
        const data = await response.json();
        
        // Transform data if needed
        const transformed = data.map((p: any) => ({
          id: p.id,
          question: p.question,
          yesAmount: p.yes_amount || 0,
          noAmount: p.no_amount || 0,
          resolved: p.resolved || false,
          result: p.result,
        }));
        
        setPredictions(transformed);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 p-8 flex items-center justify-center">
        <div className="text-cyan-300 text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">💰 Bahis Pazar</h1>
        <p className="text-cyan-300 mb-8">Tahminlere bahis yap ve kazanç sağla</p>

        {predictions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyan-300 text-lg">Şu an açık tahmin yok</p>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.map((prediction) => (
              !prediction.resolved && (
                <BetBox
                  key={prediction.id}
                  predictionId={prediction.id}
                  question={prediction.question}
                  yesAmount={prediction.yesAmount}
                  noAmount={prediction.noAmount}
                />
              )
            ))}

            {/* Resolved Predictions */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">✅ Kapatılmış Tahminler</h2>
              {predictions.filter((p) => p.resolved).length === 0 ? (
                <p className="text-cyan-300">Kapatılmış tahmin yok</p>
              ) : (
                <div className="space-y-4">
                  {predictions
                    .filter((p) => p.resolved)
                    .map((prediction) => (
                      <div key={prediction.id} className="bg-black/50 p-4 rounded border border-cyan-600">
                        <p className="text-cyan-300 mb-2">{prediction.question}</p>
                        <p className="text-sm text-green-400">
                          Sonuç: {prediction.result ? '✅ EVET' : '❌ HAYIR'}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
