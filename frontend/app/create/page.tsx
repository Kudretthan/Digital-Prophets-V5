'use client';

import { useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { MatrixBackground } from '@/components/MatrixBackground';
import useAppStore from '@/store/app';
import Link from 'next/link';
import { Prediction } from '@/types';

export default function CreatePrediction() {
  const { addPrediction, wallet } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'game-design',
    targetDate: '',
    technicalAnalysis: '',
    emotionalAnalysis: '',
    initialxlm: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet?.isConnected) {
      alert('Lütfen önce cüzdan bağlayın');
      return;
    }

    const newPrediction: Prediction = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      createdBy: 'DigitalSeer',
      createdAt: new Date(),
      targetDate: new Date(formData.targetDate),
      status: 'active',
      technicalAnalysis: formData.technicalAnalysis,
      emotionalAnalysis: formData.emotionalAnalysis,
      totalxlmStaked: formData.initialxlm,
      supportingxlm: Math.floor(formData.initialxlm * 0.6),
      opposingxlm: Math.floor(formData.initialxlm * 0.4),
      successRate: 50,
      probability: 50,
      odds: 1.5,
      result: null,
    };

    addPrediction(newPrediction);
    alert('Tahmin başarıyla oluşturuldu!');
    setFormData({
      title: '',
      description: '',
      category: 'game-design',
      targetDate: '',
      technicalAnalysis: '',
      emotionalAnalysis: '',
      initialxlm: 100,
    });
  };

  return (
    <main className="bg-black text-white min-h-screen">
      <MatrixBackground />

      {/* Header */}
      <header className="bg-black border-b-2 border-green-400 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-3xl">🔮</div>
            <div>
              <h1 className="text-2xl font-bold text-green-400 font-mono">DIGITAL PROPHETS</h1>
            </div>
          </Link>
          <WalletConnect />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900 border-2 border-green-400 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 font-mono">
            ➕ YENİ TAHMIN OLUŞTUR
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-green-400 mb-2">
                TAHMIN BAŞLIĞI *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Valorant Ajan Meta Değişir Mi?"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-400 rounded font-mono text-white focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-green-400 mb-2">
                AÇIKLAMA *
              </label>
              <textarea
                required
                placeholder="Tahmininizin kapsamlı açıklaması..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-400 rounded font-mono text-white h-24 focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-green-400 mb-2">
                KATEGORİ *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-400 rounded font-mono text-white focus:outline-none focus:border-green-400"
              >
                <option value="game-design">Oyun Tasarımı</option>
                <option value="balance-patch">Balance Patch</option>
                <option value="tournament">Turnuva</option>
                <option value="economy">Ekonomi</option>
                <option value="meta">Meta Shift</option>
              </select>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-bold text-green-400 mb-2">
                HEDEF TARİH *
              </label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-blue-400 rounded font-mono text-white focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Technical Analysis */}
            <div>
              <label className="block text-sm font-bold text-purple-400 mb-2">
                📐 TEKNİK ANALİZ *
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Veri, istatistik ve oyun metriğine dayalı analiz
              </p>
              <textarea
                required
                placeholder="Geçmiş patch verilerine bakıldığında... Benzer durumlarda..."
                value={formData.technicalAnalysis}
                onChange={(e) =>
                  setFormData({ ...formData, technicalAnalysis: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-purple-400 rounded font-mono text-white h-32 focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Emotional Analysis */}
            <div>
              <label className="block text-sm font-bold text-purple-400 mb-2">
                💭 DUYGUSAL ANALİZ *
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Geliştirici niyeti, topluluk duygu ve oyuncu psikolojisi
              </p>
              <textarea
                required
                placeholder="Geliştirici açıklamalarında... Profesyonel oyuncular söyledi... Topluluk tepkisi..."
                value={formData.emotionalAnalysis}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emotionalAnalysis: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border-2 border-purple-400 rounded font-mono text-white h-32 focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Initial xlm */}
            <div>
              <label className="block text-sm font-bold text-green-400 mb-2">
                İLK xlm STAKE *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  required
                  value={formData.initialxlm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialxlm: parseInt(e.target.value) || 100,
                    })
                  }
                  className="flex-1 px-4 py-2 bg-gray-800 border-2 border-blue-400 rounded font-mono text-white focus:outline-none focus:border-green-400"
                />
                <span className="text-yellow-400 font-bold">xlm</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tahmininize olan güveninizi gösteren tutar
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              >
                ✓ TAHMIN OLUŞTUR
              </button>
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-all text-center"
              >
                ← GERİ DÖN
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
