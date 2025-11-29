'use client';

import { useEffect, useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { MatrixBackground } from '@/components/MatrixBackground';
import Link from 'next/link';
import { UserProfile } from '@/types';

export default function Leaderboard() {
  const [analysts, setAnalysts] = useState<UserProfile[]>([]);
  const [sortBy, setSortBy] = useState<'successRate' | 'xlmEarned' | 'predictions'>(
    'successRate'
  );

  useEffect(() => {
    // Mock leaderboard data
    const mockAnalysts: UserProfile[] = [
      {
        id: '1',
        walletAddress: 'GAXN7H22EHZDGFTD2UXNW57QJHSOWQYQEHRYQKCRQ3OZRWOXMXVB3MZX',
        username: 'MetaKing99',
        avatar: '👑',
        totalPredictions: 87,
        correctPredictions: 76,
        successRate: 87,
        xlmBalance: 45200,
        xlmEarned: 32100,
        xlmSpent: 5000,
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        bio: 'Pro oyuncu ve analist. 5 yıl esports deneyimi.',
        badges: ['🥇 #1 Analist', '💎 Platinum Member', '⭐ Tutarlı Performer'],
      },
      {
        id: '2',
        walletAddress: 'Gdem0000000000000000000000000000000000',
        username: 'DataGoblin',
        avatar: '🧟',
        totalPredictions: 124,
        correctPredictions: 101,
        successRate: 81,
        xlmBalance: 28500,
        xlmEarned: 21200,
        xlmSpent: 8900,
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        bio: 'İstatistik ve veri analizi uzmanı.',
        badges: ['🥈 #2 Analist', '📊 Data Master'],
      },
      {
        id: '3',
        walletAddress: 'GTEST0000000000000000000000000000000000',
        username: 'PsyhoAnalyst',
        avatar: '🧠',
        totalPredictions: 56,
        correctPredictions: 45,
        successRate: 80,
        xlmBalance: 18900,
        xlmEarned: 15600,
        xlmSpent: 3200,
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        bio: 'Oyuncu davranışı ve ekonomisi hakkında analiz.',
        badges: ['🥉 #3 Analist'],
      },
      {
        id: '4',
        walletAddress: 'GVOL0000000000000000000000000000000000',
        username: 'VolatilityHunter',
        avatar: '🎯',
        totalPredictions: 42,
        correctPredictions: 32,
        successRate: 76,
        xlmBalance: 12500,
        xlmEarned: 9800,
        xlmSpent: 2100,
        joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        bio: 'Market volatilitesi benim oyunumun alanı.',
        badges: ['🚀 Rising Star'],
      },
      {
        id: '5',
        walletAddress: 'GPAL0000000000000000000000000000000000',
        username: 'PatchNinja',
        avatar: '🥷',
        totalPredictions: 98,
        correctPredictions: 71,
        successRate: 72,
        xlmBalance: 8200,
        xlmEarned: 6500,
        xlmSpent: 1200,
        joinedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
        bio: 'Patch notlarını okumak sanatı.',
        badges: ['📝 Patch Expert'],
      },
    ];

    const sorted = [...mockAnalysts].sort((a, b) => {
      if (sortBy === 'successRate') return b.successRate - a.successRate;
      if (sortBy === 'xlmEarned') return b.xlmEarned - a.xlmEarned;
      return b.totalPredictions - a.totalPredictions;
    });

    setAnalysts(sorted);
  }, [sortBy]);

  const getMedalEmoji = (idx: number) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 font-mono flex items-center gap-2">
            🏆 GLOBAL LİDER TABLOSU
          </h2>

          {/* Sort Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSortBy('successRate')}
              className={`px-4 py-2 rounded font-bold transition-all ${
                sortBy === 'successRate'
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              📈 BAŞARI ORANI
            </button>
            <button
              onClick={() => setSortBy('xlmEarned')}
              className={`px-4 py-2 rounded font-bold transition-all ${
                sortBy === 'xlmEarned'
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              💰 xlm KAZANÇ
            </button>
            <button
              onClick={() => setSortBy('predictions')}
              className={`px-4 py-2 rounded font-bold transition-all ${
                sortBy === 'predictions'
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              📊 TAHMIN SAYISI
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b-2 border-yellow-400 text-yellow-400">
                  <th className="px-4 py-3 text-left">SIRALAMA</th>
                  <th className="px-4 py-3 text-left">KÜLTÜRLEMECİ</th>
                  <th className="px-4 py-3 text-right">BAŞARI %</th>
                  <th className="px-4 py-3 text-right">DOĞRU/TOPLAM</th>
                  <th className="px-4 py-3 text-right">xlm KAZANÇ</th>
                  <th className="px-4 py-3 text-right">xlm BAKİYE</th>
                  <th className="px-4 py-3 text-center">ROZETLER</th>
                </tr>
              </thead>
              <tbody>
                {analysts.map((analyst, idx) => (
                  <tr
                    key={analyst.id}
                    className="border-b border-gray-700 hover:bg-yellow-400 hover:bg-opacity-10 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 font-bold text-yellow-400">
                      {getMedalEmoji(idx)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{analyst.avatar}</span>
                        <div>
                          <p className="font-bold text-blue-300">{analyst.username}</p>
                          <p className="text-xs text-gray-500">
                            {analyst.walletAddress.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-right font-bold ${
                      analyst.successRate >= 80
                        ? 'text-green-400'
                        : analyst.successRate >= 70
                        ? 'text-yellow-400'
                        : 'text-orange-400'
                    }`}>
                      {analyst.successRate}%
                    </td>
                    <td className="px-4 py-4 text-right text-green-300">
                      {analyst.correctPredictions}/{analyst.totalPredictions}
                    </td>
                    <td className="px-4 py-4 text-right text-purple-300 font-bold">
                      +{analyst.xlmEarned.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-cyan-300">
                      {analyst.xlmBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {analyst.badges.slice(0, 2).map((badge, i) => (
                          <span key={i} title={badge} className="text-lg">
                            {badge.split(' ')[0]}
                          </span>
                        ))}
                        {analyst.badges.length > 2 && (
                          <span className="text-xs text-gray-400">+{analyst.badges.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 border border-green-400 rounded p-4">
              <p className="text-gray-400 text-xs mb-2">EN YÜKSEK BAŞARI</p>
              <p className="text-2xl font-bold text-green-400">{Math.max(...analysts.map(a => a.successRate))}%</p>
            </div>
            <div className="bg-gray-800 border border-purple-400 rounded p-4">
              <p className="text-gray-400 text-xs mb-2">TOP ANALIST KAZANÇI</p>
              <p className="text-2xl font-bold text-purple-400">+{Math.max(...analysts.map(a => a.xlmEarned)).toLocaleString()} xlm</p>
            </div>
            <div className="bg-gray-800 border border-blue-400 rounded p-4">
              <p className="text-gray-400 text-xs mb-2">TOPLAM ANALİST</p>
              <p className="text-2xl font-bold text-blue-400">{analysts.length}</p>
            </div>
          </div>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-all"
          >
            ← ANA SAYFAYA DÖN
          </Link>
        </div>
      </div>
    </main>
  );
}
