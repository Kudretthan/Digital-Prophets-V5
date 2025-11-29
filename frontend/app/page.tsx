'use client';

import { useEffect, useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { CyberpunkBackground } from '@/components/CyberpunkBackground';
import { BettingGrid } from '@/components/BettingGrid';
import { AnalystProfile } from '@/components/AnalystProfile';
import { LiveGameNews } from '@/components/LiveGameNews';
import useAppStore from '@/store/app';
import { Prediction, UserProfile, GameNews } from '@/types';
import { getOrCreateProfile, updateProfileAvatar, updateProfileUsername } from '@/lib/profileManager';
import Link from 'next/link';

export default function Home() {
  const { predictions, setPredictions, wallet, refreshWalletBalance, disconnectWallet } = useAppStore();
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [gameNews, setGameNews] = useState<GameNews[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [marketStats, setMarketStats] = useState({
    totalVolume: 0,
    activePredictions: 0,
    resolvedToday: 0,
  });

  // Auto-refresh wallet balance
  useEffect(() => {
    if (wallet?.publicKey) {
      // Initial refresh
      refreshWalletBalance(wallet.publicKey);
      
      // Refresh every 10 seconds
      const interval = setInterval(() => {
        refreshWalletBalance(wallet.publicKey);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [wallet?.publicKey, refreshWalletBalance]);

  // Fetch game news
  useEffect(() => {
    const fetchGameNews = async () => {
      try {
        const response = await fetch('/api/scraper/data');
        const data = await response.json();
        setGameNews(data.gameNews || []);
      } catch (error) {
        console.error('Failed to fetch game news:', error);
      }
    };

    fetchGameNews();
    // Refresh every 30 seconds
    const interval = setInterval(fetchGameNews, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch predictions from Supabase
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predictions');
        const data = await response.json();
        setPredictions(data);
        setMarketStats({
          totalVolume: data.reduce((sum: number, p: any) => sum + (p.total_xlm_staked || 0), 0),
          activePredictions: data.filter((p: any) => p.status === 'active').length,
          resolvedToday: data.filter((p: any) => p.status === 'resolved').length,
        });
        if (data.length > 0) {
          setSelectedPrediction(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      }
    };

    fetchPredictions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPredictions, 30 * 1000);
    return () => clearInterval(interval);
  }, [setPredictions]);

  // Cüzdan bağlıysa profili cüzdan adresine göre yükle/oluştur
  useEffect(() => {
    if (wallet?.publicKey) {
      const profile = getOrCreateProfile(wallet.publicKey);
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
  }, [wallet?.publicKey]);

  // Avatar değiştiğinde
  const handleAvatarChange = (newAvatar: string) => {
    if (wallet?.publicKey && userProfile) {
      updateProfileAvatar(wallet.publicKey, newAvatar);
      setUserProfile({ ...userProfile, avatar: newAvatar });
    }
  };

  // Kullanıcı adı değiştiğinde
  const handleUsernameChange = (newUsername: string) => {
    if (wallet?.publicKey && userProfile) {
      updateProfileUsername(wallet.publicKey, newUsername);
      setUserProfile({ ...userProfile, username: newUsername });
    }
  };

  return (
    <main className="min-h-screen relative">
      <CyberpunkBackground />

      {/* Header - Cyberpunk style */}
      <header className="bg-black/60 backdrop-blur-md border-b border-orange-500/30 sticky top-0 z-40 cyber-box">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚡</div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500 tracking-wider cyber-glow glitch">
                DIGITAL PROPHETS
              </h1>
              <p className="text-sm text-orange-300/70 tracking-widest uppercase">Oyun Mekaniği Tahmin Piyasası</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {wallet?.isConnected && userProfile ? (
              <div className="flex items-center gap-2">
                {/* Cüzdan + Profil birleşik - Cyberpunk */}
                <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur border border-orange-500/40 rounded-xl neon-border">
                  {/* Bakiye */}
                  <div className="text-sm font-bold text-orange-400">
                    ⚡ {(wallet.xlmBalance ?? 0).toFixed(2)} XLM
                  </div>
                  <div className="w-px h-6 bg-orange-500/30" />
                  {/* Profil butonu */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {userProfile.avatar && userProfile.avatar.startsWith('data:image') ? (
                      <span className="w-8 h-8 rounded-lg overflow-hidden bg-orange-500/20 flex items-center justify-center border border-orange-500/40">
                        <img src={userProfile.avatar} alt="Profil" className="w-full h-full object-cover" />
                      </span>
                    ) : (
                      <span className="text-xl">{userProfile.avatar || '👤'}</span>
                    )}
                    <span className="text-sm font-semibold text-orange-300 max-w-[80px] truncate">{userProfile.username}</span>
                  </button>
                  <div className="w-px h-6 bg-orange-500/30" />
                  {/* Çıkış */}
                  <button
                    onClick={() => {
                      disconnectWallet();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            ) : wallet?.isConnected ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur border border-orange-500/40 rounded-xl neon-border">
                <div className="text-sm font-bold text-orange-400">
                  ⚡ {(wallet.xlmBalance ?? 0).toFixed(2)} XLM
                </div>
                <div className="w-px h-6 bg-orange-500/30" />
                <button
                  onClick={() => {
                    disconnectWallet();
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <WalletConnect />
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <div className="w-full px-4 pt-16 pb-12 space-y-6">

        {/* Removed Hero Stats Section */}

        {/* Removed Quick Actions */}

        {/* Main Content Grid - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar - Canlı Maçlar (col-2) */}
          <div className="lg:col-span-2 lg:row-span-2">
            <div className="bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto cyber-box">
              <h3 className="text-base font-bold text-orange-400 mb-3 flex items-center gap-2">
                ⚡ CANLI MAÇLAR
              </h3>
              <LiveGameNews />
            </div>
          </div>

          {/* Center - Predictions Table (4 sütun kart düzeni) */}
          <div className="lg:col-span-8">
            <div className="bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 cyber-box">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">⚡ CANLI BAHİSLER</h2>
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">{predictions.length} AKTİF</span>
                </div>
              </div>
              <BettingGrid predictions={predictions} />
            </div>
          </div>

          {/* Right Sidebar - Leaderboard Mini (col-2) */}
          <div className="lg:col-span-2">
            <div className="bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 sticky top-20 cyber-box">
              <button onClick={() => setShowLeaderboard(true)} className="w-full mb-4 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/30 text-xs whitespace-nowrap neon-border">
                🏆 LİDER TABLOSU
              </button>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-orange-400 mb-2">TOP 10</h4>
                <div className="text-center py-4">
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-orange-300/50 text-xs">Henüz veri yok</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-md border border-orange-500/40 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto cyber-box">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center gap-2">
                  🏆 LİDER TABLOSU
                </h2>
                <button onClick={() => setShowLeaderboard(false)} className="text-orange-400/60 hover:text-orange-400 text-2xl transition">
                  ✕
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-orange-400 mb-2">Henüz Lider Yok</h3>
                <p className="text-orange-300/60 text-sm max-w-md">
                  Liderlik tablosu şu anda boş. İlk tahminini yaparak liderlik tablosunda yerini al!
                </p>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all neon-border"
                >
                  Tahmin Yapmaya Başla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfile && userProfile && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <AnalystProfile
                profile={userProfile}
                onAvatarChange={handleAvatarChange}
                onUsernameChange={handleUsernameChange}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowProfile(false)}
                  className="px-4 py-2 rounded-lg bg-black/60 border border-orange-500/40 text-sm text-orange-300 hover:bg-orange-500/20 transition-all"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Updates Section - Ayrı Bölüm */}
        <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🎮 OYUN YAMALARI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* LOL */}
            {gameNews.filter(n => n.source === 'lol').map(news => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer"
                className="group backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-400/50 rounded-lg p-4 hover:shadow-lg hover:shadow-blue-500/40 transition-all hover:scale-105 cursor-pointer">
                <div className="flex gap-3">
                  <div className="text-2xl">⚔️</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">{news.title}</h4>
                    <p className="text-xs text-white/70 line-clamp-2">{news.description}</p>
                    <p className="text-xs text-white/40 mt-2">League of Legends</p>
                  </div>
                  <div className="text-white/50 group-hover:text-white transition">→</div>
                </div>
              </a>
            ))}

            {/* Valorant */}
            {gameNews.filter(n => n.source === 'valorant').map(news => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer"
                className="group backdrop-blur-xl bg-gradient-to-br from-red-600/20 to-red-400/10 border border-red-400/50 rounded-lg p-4 hover:shadow-lg hover:shadow-red-500/40 transition-all hover:scale-105 cursor-pointer">
                <div className="flex gap-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">{news.title}</h4>
                    <p className="text-xs text-white/70 line-clamp-2">{news.description}</p>
                    <p className="text-xs text-white/40 mt-2">Valorant</p>
                  </div>
                  <div className="text-white/50 group-hover:text-white transition">→</div>
                </div>
              </a>
            ))}

            {/* CS2 */}
            {gameNews.filter(n => n.source === 'cs2').map(news => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer"
                className="group backdrop-blur-xl bg-gradient-to-br from-yellow-600/20 to-yellow-400/10 border border-yellow-400/50 rounded-lg p-4 hover:shadow-lg hover:shadow-yellow-500/40 transition-all hover:scale-105 cursor-pointer">
                <div className="flex gap-3">
                  <div className="text-2xl">💣</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">{news.title}</h4>
                    <p className="text-xs text-white/70 line-clamp-2">{news.description}</p>
                    <p className="text-xs text-white/40 mt-2">Counter-Strike 2</p>
                  </div>
                  <div className="text-white/50 group-hover:text-white transition">→</div>
                </div>
              </a>
            ))}

            {/* TFT */}
            {gameNews.filter(n => n.source === 'tft').map(news => (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer"
                className="group backdrop-blur-xl bg-gradient-to-br from-purple-600/20 to-pink-400/10 border border-purple-400/50 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-105 cursor-pointer">
                <div className="flex gap-3">
                  <div className="text-2xl">🎲</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">{news.title}</h4>
                    <p className="text-xs text-white/70 line-clamp-2">{news.description}</p>
                    <p className="text-xs text-white/40 mt-2">Teamfight Tactics</p>
                  </div>
                  <div className="text-white/50 group-hover:text-white transition">→</div>
                </div>
              </a>
            ))}
          </div>

          {gameNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60">📡 Oyun yamaları yükleniyor...</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

