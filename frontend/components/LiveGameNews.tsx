'use client';

import { useEffect, useState } from 'react';

interface HLTVMatch {
  id: string;
  team1: string;
  team2: string;
  date: Date;
  tournament: string;
  odds?: { team1: number; team2: number };
  status: 'upcoming' | 'live' | 'finished';
  link: string;
  game?: string;
}

interface HLTVMatchesGrouped {
  upcoming: HLTVMatch[];
  live: HLTVMatch[];
  finished: HLTVMatch[];
}

type GameFilter = 'all' | 'CS2' | 'LoL' | 'Valorant' | 'Dota 2';

const GAME_ICONS: Record<string, string> = {
  'CS2': '🎯',
  'LoL': '⚔️',
  'Valorant': '🔫',
  'Dota 2': '🛡️',
  'default': '🎮'
};

const GAME_COLORS: Record<string, string> = {
  'CS2': 'from-orange-600/40 to-orange-400/30 border-orange-400/70',
  'LoL': 'from-blue-600/40 to-blue-400/30 border-blue-400/70',
  'Valorant': 'from-red-600/40 to-red-400/30 border-red-400/70',
  'Dota 2': 'from-purple-600/40 to-purple-400/30 border-purple-400/70',
  'default': 'from-cyan-600/40 to-cyan-400/30 border-cyan-400/70'
};

export function LiveGameNews() {
  const [hltvMatches, setHltvMatches] = useState<HLTVMatchesGrouped>({
    upcoming: [],
    live: [],
    finished: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [gameFilter, setGameFilter] = useState<GameFilter>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/scraper/data');
        const data = await response.json();
        setHltvMatches(data.hltvMatches || { upcoming: [], live: [], finished: [] });
        setLastUpdate(new Date(data.lastUpdated));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch:', error);
        setLoading(false);
      }
    };

    fetchData();
    // Her 60 saniyede bir güncelle (performans için optimize edildi)
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const compareDate = new Date(date);
    return compareDate.toDateString() === today.toDateString();
  };

  const getGameIcon = (game?: string) => GAME_ICONS[game || 'default'] || GAME_ICONS['default'];
  const getGameColor = (game?: string) => GAME_COLORS[game || 'default'] || GAME_COLORS['default'];

  const filterMatches = (matches: HLTVMatch[]) => {
    if (gameFilter === 'all') return matches;
    return matches.filter(m => m.game === gameFilter);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-4xl mb-2">🎮</div>
        <p className="text-white/60 text-sm">Maçlar yükleniyor...</p>
      </div>
    );
  }

  // Maçları filtrele
  const liveMatches = filterMatches(hltvMatches.live);
  const todaysMatches = filterMatches(hltvMatches.upcoming.filter(m => isToday(m.date))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const futureMatches = filterMatches(hltvMatches.upcoming.filter(m => !isToday(m.date))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  // Oyun sayılarını hesapla
  const allMatches = [...hltvMatches.live, ...hltvMatches.upcoming];
  const gameCounts: Record<string, number> = {};
  allMatches.forEach(m => {
    const game = m.game || 'Other';
    gameCounts[game] = (gameCounts[game] || 0) + 1;
  });

  return (
    <div className="space-y-3">
      {/* Oyun Filtreleri */}
      <div className="flex flex-wrap gap-1 pb-2 border-b border-white/10">
        <button
          onClick={() => setGameFilter('all')}
          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
            gameFilter === 'all' 
              ? 'bg-cyan-500 text-white' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Tümü ({allMatches.length})
        </button>
        {Object.entries(gameCounts).map(([game, count]) => (
          <button
            key={game}
            onClick={() => setGameFilter(game as GameFilter)}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              gameFilter === game 
                ? 'bg-cyan-500 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {getGameIcon(game)} {count}
          </button>
        ))}
      </div>

      {/* Canlı Maçlar */}
      {liveMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="text-lg animate-pulse">🔴</span>
            <h3 className="text-sm font-bold text-red-400">CANLI</h3>
            <span className="text-xs text-white/50">({liveMatches.length})</span>
          </div>
          <div className="space-y-1.5">
            {liveMatches.map(match => (
              <a 
                key={match.id} 
                href={match.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`block backdrop-blur-xl bg-gradient-to-r ${getGameColor(match.game)} rounded-lg p-2.5 hover:shadow-lg transition-all group hover:scale-[1.02] cursor-pointer`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{getGameIcon(match.game)}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-500/50 text-red-100 animate-pulse">CANLI</span>
                    </div>
                    {match.odds && (
                      <div className="flex gap-1 text-xs">
                        <span className="px-1.5 py-0.5 bg-green-500/30 text-green-300 rounded font-bold">{match.odds.team1.toFixed(2)}</span>
                        <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded font-bold">{match.odds.team2.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white truncate flex-1 text-right">{match.team1}</span>
                    <span className="text-yellow-400 font-bold">VS</span>
                    <span className="font-bold text-white truncate flex-1">{match.team2}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate text-center">{match.tournament}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bugünün Maçları */}
      {todaysMatches.length > 0 && (
        <div className="space-y-2 border-t border-white/20 pt-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-lg">⏰</span>
            <h3 className="text-sm font-bold text-amber-400">BUGÜN</h3>
            <span className="text-xs text-white/50">({todaysMatches.length})</span>
          </div>
          <div className="space-y-1.5">
            {todaysMatches.map(match => (
              <a 
                key={match.id} 
                href={match.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block backdrop-blur-xl bg-gradient-to-r from-amber-600/25 to-amber-400/15 border border-amber-400/40 rounded-lg p-2 hover:shadow-lg transition-all group hover:scale-[1.02]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{getGameIcon(match.game)}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">{formatTime(match.date)}</span>
                    </div>
                    {match.odds && (
                      <div className="flex gap-1 text-xs">
                        <span className="text-green-300 font-bold">{match.odds.team1.toFixed(2)}</span>
                        <span className="text-white/40">|</span>
                        <span className="text-blue-300 font-bold">{match.odds.team2.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-bold text-white truncate flex-1 text-right">{match.team1}</span>
                    <span className="text-white/50">vs</span>
                    <span className="font-bold text-white truncate flex-1">{match.team2}</span>
                  </div>
                  <p className="text-xs text-white/50 truncate">{match.tournament}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Yaklaşan Maçlar */}
      {futureMatches.length > 0 && (
        <div className="space-y-2 border-t border-white/20 pt-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-lg">📅</span>
            <h3 className="text-sm font-bold text-purple-400">YAKINDA</h3>
            <span className="text-xs text-white/50">({futureMatches.length})</span>
          </div>
          <div className="space-y-1.5">
            {futureMatches.map(match => (
              <a 
                key={match.id} 
                href={match.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-purple-400/10 border border-purple-400/30 rounded-lg p-2 hover:shadow-lg transition-all group hover:scale-[1.02]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{getGameIcon(match.game)}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">{formatDate(match.date)}</span>
                    </div>
                    {match.odds && (
                      <span className="text-xs text-cyan-300 font-bold">{match.odds.team1.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-white/90 truncate flex-1 text-right">{match.team1}</span>
                    <span className="text-white/40">vs</span>
                    <span className="font-medium text-white/90 truncate flex-1">{match.team2}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Boş durum */}
      {liveMatches.length === 0 && todaysMatches.length === 0 && futureMatches.length === 0 && (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🎮</div>
          <p className="text-white/50 text-sm">Seçili oyun için maç bulunamadı</p>
        </div>
      )}

      {/* Son güncelleme */}
      {lastUpdate && (
        <div className="text-xs text-white/30 text-center pt-2 border-t border-white/10 flex items-center justify-center gap-1">
          <span className="animate-pulse">🟢</span>
          Güncellendi: {formatTime(lastUpdate)}
        </div>
      )}
    </div>
  );
}
