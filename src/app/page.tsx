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

  // Initialize mock data
  useEffect(() => {
    // Mock predictions - Her oyundan en az 2 tane
    const mockPredictions: Prediction[] = [
      // VALORANT BAHİSLERİ
      {
        id: '1',
        title: 'Valorant Patch 9.0: Yeni Ajan Meta\'yı Değiştirir Mi?',
        description: 'Gelecek patch\'da eklenen yeni ajan pick rate %20\'yi geçer mi?',
        createdBy: 'ProsanalystXYZ',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Oyunda benzer ajan türlerinin istatistiklerine bakıldığında, ajan pick rate %15 civarında olacağı öngörülüyor.',
        emotionalAnalysis: 'Pro oyuncuların yorumlarına göre, Valorant geliştirme ekibi oyunun meta\'sını shake up etmek istiyor.',
        totalxlmStaked: 2500,
        supportingxlm: 1800,
        opposingxlm: 700,
        successRate: 85,
        probability: 78,
        odds: 1.45,
        category: 'valorant',
      },
      {
        id: '2',
        title: 'VCT Americas: Sentinels vs Cloud9 - Kim Kazanır?',
        description: 'VCT Americas maçında Sentinels Cloud9\'u yener mi?',
        createdBy: 'ValorantGuru',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Sentinels son 5 maçta 4 galibiyet aldı. Cloud9 ise son dönemde formunu kaybetti.',
        emotionalAnalysis: 'Taraftar desteği ve ev sahibi avantajı Sentinels\'a psikolojik üstünlük sağlıyor.',
        totalxlmStaked: 8500,
        supportingxlm: 5100,
        opposingxlm: 3400,
        successRate: 75,
        probability: 62,
        odds: 1.65,
        category: 'valorant',
      },
      {
        id: '3',
        title: 'Valorant: Jett Nerf Gelecek Mi?',
        description: 'Bir sonraki patch\'te Jett\'e nerf gelir mi?',
        createdBy: 'AgentAnalyst',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Jett pick rate %35 ve win rate %54. Riot genelde bu tür istatistiklerde nerf yapar.',
        emotionalAnalysis: 'Topluluk Jett\'in çok güçlü olduğunu düşünüyor, Riot muhtemelen dinleyecek.',
        totalxlmStaked: 3200,
        supportingxlm: 2400,
        opposingxlm: 800,
        successRate: 80,
        probability: 72,
        odds: 1.38,
        category: 'valorant',
      },

      // LEAGUE OF LEGENDS BAHİSLERİ
      {
        id: '4',
        title: 'LoL: Support Rolü Zayıflatılacak Mı?',
        description: 'Yeni balance patch\'ta support damage\'ı düşecek mi?',
        createdBy: 'MetaAnalyzer88',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Son 3 patch\'ta support damage arttı ve win rate %52 oldu. Genellikle meta-defining roller her season zayıflatılıyor.',
        emotionalAnalysis: 'Riot Games CEO\'su, supp oyuncu deneyimini artırmak istediğini söyledi.',
        totalxlmStaked: 1850,
        supportingxlm: 950,
        opposingxlm: 900,
        successRate: 72,
        probability: 55,
        odds: 1.82,
        category: 'lol',
      },
      {
        id: '5',
        title: 'LCK Winter: T1 vs Gen.G - Şampiyon Kim?',
        description: 'LCK Winter finalinde T1 Gen.G\'yi yener mi?',
        createdBy: 'KoreanHype',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        targetDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'T1 Faker liderliğinde son 3 seride Gen.G\'yi yendi. Ancak Gen.G yeni roster ile güçlü.',
        emotionalAnalysis: 'Faker efsanesi ve T1 mirası, takıma motivasyon sağlıyor.',
        totalxlmStaked: 12500,
        supportingxlm: 7500,
        opposingxlm: 5000,
        successRate: 88,
        probability: 58,
        odds: 1.72,
        category: 'lol',
      },
      {
        id: '6',
        title: 'LoL Worlds 2025: Hangi Bölge Şampiyon?',
        description: 'Worlds 2025\'te LCK takımı mı LPL takımı mı şampiyon olur?',
        createdBy: 'WorldsOracle',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Son 5 yılda LCK 3, LPL 2 şampiyonluk kazandı. Şu an LCK daha güçlü görünüyor.',
        emotionalAnalysis: 'Taraftar oylamasında %60 LCK favori.',
        totalxlmStaked: 25000,
        supportingxlm: 15000,
        opposingxlm: 10000,
        successRate: 65,
        probability: 60,
        odds: 1.67,
        category: 'lol',
      },

      // CS2 BAHİSLERİ
      {
        id: '7',
        title: 'ESL Pro League: FaZe vs Navi - Maç Sonucu',
        description: 'ESL Pro League\'de FaZe Clan Navi\'yi 2-0 yener mi?',
        createdBy: 'CS2Prophet',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        targetDate: new Date(Date.now() + 1 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'FaZe son 5 maçta 3 galibiyet aldı. Navi ise s1mple dönüşüyle güçlendi.',
        emotionalAnalysis: 'FaZe taraftarları yoğun destek veriyor, ev sahibi avantajı var.',
        totalxlmStaked: 9800,
        supportingxlm: 4900,
        opposingxlm: 4900,
        successRate: 70,
        probability: 48,
        odds: 2.08,
        category: 'cs2',
      },
      {
        id: '8',
        title: 'IEM Katowice 2025: G2 Şampiyon Olur Mu?',
        description: 'IEM Katowice 2025\'te G2 Esports şampiyonluğa ulaşır mı?',
        createdBy: 'KatowiceKing',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'G2 son 2 büyük turnuvada final oynadı. Form grafiği yukarı yönlü.',
        emotionalAnalysis: 'NiKo ve m0nesy ikilisi motivasyon zirvesinde.',
        totalxlmStaked: 6500,
        supportingxlm: 3900,
        opposingxlm: 2600,
        successRate: 78,
        probability: 35,
        odds: 2.85,
        category: 'cs2',
      },
      {
        id: '9',
        title: 'CS2: AWP Nerf Gelecek Mi?',
        description: 'CS2\'de AWP\'ye hareket veya hasar nerfü gelir mi?',
        createdBy: 'WeaponMaster',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'AWP pick rate pro maçlarda %95. Valve genelde dominant silahları dengeler.',
        emotionalAnalysis: 'Topluluk AWP\'nin dengeli olduğunu düşünüyor, nerf gelmeyebilir.',
        totalxlmStaked: 4200,
        supportingxlm: 1680,
        opposingxlm: 2520,
        successRate: 62,
        probability: 40,
        odds: 2.50,
        category: 'cs2',
      },

      // DOTA 2 BAHİSLERİ
      {
        id: '10',
        title: 'Dota 2 TI 2025: Hangi Ülke Şampiyon?',
        description: 'The International 2025\'te hangi bölge şampiyon olur?',
        createdBy: 'ESportsProphet',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Geçmiş 5 yıl TI verilerine bakıldığında, Çin ve Avrupa ekipleri %70 başarı oranına sahip.',
        emotionalAnalysis: 'Esports analitik ekipleri, bu yıl Güney Kore ekiplerinin comeback yapabileceğini tahmin ediyor.',
        totalxlmStaked: 5200,
        supportingxlm: 3200,
        opposingxlm: 2000,
        successRate: 68,
        probability: 65,
        odds: 1.54,
        category: 'dota2',
      },
      {
        id: '11',
        title: 'DPC 2025: Team Spirit vs Gaimin - Kim Kazanır?',
        description: 'DPC 2025 maçında Team Spirit Gaimin Gladiators\'ı yener mi?',
        createdBy: 'DotaOracle',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Team Spirit TI13 şampiyonu ve formda. Gaimin ise yeni patch\'e adapte olmakta zorlanıyor.',
        emotionalAnalysis: 'Spirit\'in şampiyonluk deneyimi psikolojik avantaj sağlıyor.',
        totalxlmStaked: 7800,
        supportingxlm: 5460,
        opposingxlm: 2340,
        successRate: 82,
        probability: 70,
        odds: 1.43,
        category: 'dota2',
      },
      {
        id: '12',
        title: 'Dota 2: Yeni Hero OP Olacak Mı?',
        description: 'Dota 2\'de eklenecek yeni hero ilk haftada %55+ win rate\'e ulaşır mı?',
        createdBy: 'HeroHunter',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Son eklenen 3 hero ilk haftada %52-58 arası win rate gösterdi.',
        emotionalAnalysis: 'Valve yeni heroleri güçlü çıkarma eğiliminde.',
        totalxlmStaked: 3500,
        supportingxlm: 2100,
        opposingxlm: 1400,
        successRate: 75,
        probability: 60,
        odds: 1.67,
        category: 'dota2',
      },

      // TFT BAHİSLERİ
      {
        id: '13',
        title: 'TFT Set 12: En Güçlü Comp Hangisi?',
        description: 'TFT Set 12\'de Reroll comp\'lar meta\'yı domine eder mi?',
        createdBy: 'TFTMaster',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Set 11\'de reroll comp\'lar %35 play rate\'e ulaştı. Set 12 mekanikler benzer.',
        emotionalAnalysis: 'Challenger oyuncular reroll meta\'sından şikayet ediyor, nerf gelebilir.',
        totalxlmStaked: 2800,
        supportingxlm: 1680,
        opposingxlm: 1120,
        successRate: 70,
        probability: 58,
        odds: 1.72,
        category: 'tft',
      },
      {
        id: '14',
        title: 'TFT Worlds: Kore Şampiyon Olur Mu?',
        description: 'TFT Dünya Şampiyonası\'nda Kore temsilcisi şampiyon olur mu?',
        createdBy: 'TacticianKR',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        technicalAnalysis: 'Son 3 TFT Worlds\'te Kore 2 şampiyonluk kazandı. Ladder\'da Koreli oyuncular dominant.',
        emotionalAnalysis: 'Kore TFT topluluğu çok aktif ve rekabetçi.',
        totalxlmStaked: 4500,
        supportingxlm: 3150,
        opposingxlm: 1350,
        successRate: 85,
        probability: 68,
        odds: 1.47,
        category: 'tft',
      },
    ];

    setPredictions(mockPredictions);

    // Cüzdan bağlıysa profili cüzdan adresine göre yükle/oluştur
    if (wallet?.publicKey) {
      const profile = getOrCreateProfile(wallet.publicKey);
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }

    // Market stats
    setMarketStats({
      totalVolume: 45200,
      activePredictions: 23,
      resolvedToday: 3,
    });

    if (mockPredictions.length > 0) {
      setSelectedPrediction(mockPredictions[0]);
    }
  }, [setPredictions, wallet?.publicKey, wallet?.xlmBalance]);

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

