'use client';

import { useEffect, useState } from 'react';

interface GameNews {
  id: string;
  source: 'lol' | 'cs2' | 'valorant' | 'hltv';
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  timestamp: Date;
  type: 'patch' | 'news' | 'tournament' | 'match';
  game: string;
}

interface HLTVMatch {
  id: string;
  team1: string;
  team2: string;
  date: Date;
  tournament: string;
  odds?: {
    team1: number;
    team2: number;
  }
  status: 'upcoming' | 'live' | 'finished';
  link: string;
}

export function LiveGameData() {
  const [gameNews, setGameNews] = useState<GameNews[]>([]);
  const [matches, setMatches] = useState<HLTVMatch[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'matches'>('news');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/scraper/data');
        const data = await response.json();
        
        setGameNews(data.gameNews || []);
        setMatches(data.matches || []);
        setLastUpdate(new Date(data.lastUpdated));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch game data:', error);
        setLoading(false);
      }
    };

    fetchData();
    // Her 5 dakikada bir güncelle
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getGameColor = (source: string) => {
    switch (source) {
      case 'lol':
        return 'from-blue-600 to-blue-400';
      case 'valorant':
        return 'from-red-600 to-red-400';
      case 'cs2':
        return 'from-yellow-600 to-yellow-400';
      default:
        return 'from-purple-600 to-purple-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <span className="px-2 py-1 bg-red-500/30 text-red-300 rounded-full text-xs font-bold animate-pulse">🔴 CANLI</span>;
      case 'finished':
        return <span className="px-2 py-1 bg-gray-500/30 text-gray-300 rounded-full text-xs">✓ BİTTİ</span>;
      default:
        return <span className="px-2 py-1 bg-green-500/30 text-green-300 rounded-full text-xs">📅 YAKINDA</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab Butonları */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('news')}
          className={`pb-3 px-4 font-bold transition-all ${
            activeTab === 'news'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📰 Oyun Haberleri ({gameNews.length})
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-4 font-bold transition-all ${
            activeTab === 'matches'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🎮 Maçlar ({matches.length})
        </button>
      </div>

      {/* Haberleri Göster */}
      {activeTab === 'news' && (
        <div className="grid gap-4">
          {gameNews.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Henüz veri bulunamadı</div>
          ) : (
            gameNews.map((news) => (
              <a
                key={news.id}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="flex gap-4">
                  {news.imageUrl && (
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getGameColor(news.source)} text-white`}>
                          {news.game}
                        </span>
                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                          {news.type === 'patch' ? '🔧 Patch' : '📢 Haber'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(news.timestamp).toLocaleString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{news.description}</p>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}

      {/* Maçları Göster */}
      {activeTab === 'matches' && (
        <div className="grid gap-4">
          {matches.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Henüz maç bulunamadı</div>
          ) : (
            matches.map((match) => (
              <a
                key={match.id}
                href={match.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-white/5 to-transparent backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-purple-300">{match.tournament}</span>
                  {getStatusBadge(match.status)}
                </div>

                <div className="flex items-center justify-between gap-4 mb-3">
                  {/* Takım 1 */}
                  <div className="flex-1 text-center">
                    <p className="font-bold text-white text-lg mb-2">{match.team1}</p>
                    {match.odds && (
                      <div className="text-sm bg-white/5 px-3 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                        {match.odds.team1.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* VS */}
                  <div className="text-center px-4">
                    <p className="text-gray-400 text-sm font-bold">VS</p>
                    <p className="text-xs text-gray-500">
                      {new Date(match.date).toLocaleString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Takım 2 */}
                  <div className="flex-1 text-center">
                    <p className="font-bold text-white text-lg mb-2">{match.team2}</p>
                    {match.odds && (
                      <div className="text-sm bg-white/5 px-3 py-1 rounded border border-red-500/30 text-red-300 font-bold">
                        {match.odds.team2.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all text-sm">
                  🎰 BU MAÇA BET YAP
                </button>
              </a>
            ))
          )}
        </div>
      )}

      {/* Son Güncelleme */}
      {lastUpdate && (
        <div className="mt-6 text-center text-xs text-gray-500">
          Son güncelleme: {lastUpdate.toLocaleString('tr-TR')}
        </div>
      )}
    </div>
  );
}
