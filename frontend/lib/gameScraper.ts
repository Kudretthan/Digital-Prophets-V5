import axios from 'axios';
import * as cheerio from 'cheerio';

export interface GameNews {
  id: string;
  source: 'lol' | 'cs2' | 'valorant' | 'tft' | 'hltv';
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  timestamp: Date;
  type: 'patch' | 'news' | 'tournament' | 'match';
  game: string;
}

export interface HLTVMatch {
  id: string;
  team1: string;
  team2: string;
  date: Date;
  tournament: string;
  odds?: {
    team1: number;
    team2: number;
  };
  status: 'upcoming' | 'live' | 'finished';
  link: string;
  game?: string;
}

export interface HLTVMatchesGrouped {
  upcoming: HLTVMatch[];
  live: HLTVMatch[];
  finished: HLTVMatch[];
}

// Axios instance with better error handling
const axiosInstance = axios.create({
  timeout: 10000,
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

export class GameScraper {
  private baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xlm,application/xlm;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1'
  };

  async scrapeLOLPatchNotes(): Promise<GameNews[]> {
    try {
      const url = 'https://www.leagueoflegends.com/en-us/news/game-updates/';
      const { data } = await axios.get(url, { headers: this.baseHeaders, timeout: 10000 });
      const $ = cheerio.load(data);

      // GAME UPDATES kategorisinden LoL'u bul (TFT değil!)
      let patchLink = '';
      const links = $('a[href*="patch"], a[href*="update"]');
      
      links.each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().toLowerCase();
        // GAME UPDATES kategorisinden, TFT'yi hariç tut
        if (!href.includes('teamfight') && !href.includes('tft') && 
            (href.includes('patch') || text.includes('patch'))) {
          patchLink = href;
          return false;
        }
      });
      
      if (!patchLink.startsWith('http')) {
        patchLink = 'https://www.leagueoflegends.com' + patchLink;
      }

      if (!patchLink || patchLink.includes('teamfight')) {
        return [{
          id: `lol-fallback-${Date.now()}`,
          source: 'lol',
          title: 'Latest League of Legends Game Update',
          description: 'Visit LoL official website for latest game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'League of Legends'
        }];
      }

      try {
        const patchData = await axios.get(patchLink, { headers: this.baseHeaders, timeout: 10000 });
        const $patch = cheerio.load(patchData.data);
        
        const title = $patch('h1').first().text().trim() || 'Latest LoL Game Update';
        
        let description = '';
        $patch('p').slice(0, 5).each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10) {
            description += text + ' ';
          }
        });

        return [{
          id: `lol-patch-${Date.now()}`,
          source: 'lol',
          title,
          description: description.substring(0, 250).trim() || 'Official League of Legends game update',
          link: patchLink,
          timestamp: new Date(),
          type: 'patch',
          game: 'League of Legends'
        }];
      } catch (innerError) {
        console.error('Error fetching LoL patch details:', innerError);
        return [{
          id: `lol-fallback-${Date.now()}`,
          source: 'lol',
          title: 'Latest League of Legends Game Update',
          description: 'Check official LoL website for latest game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'League of Legends'
        }];
      }
    } catch (error) {
      console.error('LoL scraping error:', error);
      return [{
        id: `lol-fallback-${Date.now()}`,
        source: 'lol',
        title: 'Latest League of Legends Game Update',
        description: 'Visit League of Legends official website for updates',
        link: 'https://www.leagueoflegends.com/en-us/news/game-updates/',
        timestamp: new Date(),
        type: 'patch',
        game: 'League of Legends'
      }];
    }
  }

  async scrapeValorantPatchNotes(): Promise<GameNews[]> {
    try {
      const url = 'https://playvalorant.com/en-us/news/';
      const { data } = await axios.get(url, { headers: this.baseHeaders, timeout: 10000 });
      const $ = cheerio.load(data);

      // GAME UPDATES kategorisinden en güncel update linkini bul
      let updateLink = '';
      const links = $('a[href*="patch"], a[href*="update"]');
      
      links.each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().toLowerCase();
        if ((href.includes('patch') || text.includes('patch') || text.includes('update')) && 
            (text.includes('game') || text.includes('update'))) {
          updateLink = href;
          return false;
        }
      });
      
      if (!updateLink.startsWith('http')) {
        updateLink = 'https://playvalorant.com' + updateLink;
      }

      if (!updateLink) {
        return [{
          id: `valorant-fallback-${Date.now()}`,
          source: 'valorant',
          title: 'Latest Valorant Game Update',
          description: 'Visit Valorant official website for latest game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'Valorant'
        }];
      }

      try {
        const updateData = await axios.get(updateLink, { headers: this.baseHeaders, timeout: 10000 });
        const $update = cheerio.load(updateData.data);
        
        const title = $update('h1').first().text().trim() || 'Latest Valorant Game Update';
        
        let description = '';
        $update('p').slice(0, 5).each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10) {
            description += text + ' ';
          }
        });

        return [{
          id: `valorant-patch-${Date.now()}`,
          source: 'valorant',
          title,
          description: description.substring(0, 250).trim() || 'Official Valorant game update',
          link: updateLink,
          timestamp: new Date(),
          type: 'patch',
          game: 'Valorant'
        }];
      } catch (innerError) {
        console.error('Error fetching Valorant update details:', innerError);
        return [{
          id: `valorant-fallback-${Date.now()}`,
          source: 'valorant',
          title: 'Latest Valorant Game Update',
          description: 'Check official Valorant website for game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'Valorant'
        }];
      }
    } catch (error) {
      console.error('Valorant scraping error:', error);
      return [{
        id: `valorant-fallback-${Date.now()}`,
        source: 'valorant',
        title: 'Latest Valorant Game Update',
        description: 'Visit Valorant official website',
        link: 'https://playvalorant.com/en-us/news/',
        timestamp: new Date(),
        type: 'patch',
        game: 'Valorant'
      }];
    }
  }

  async scrapeCS2PatchNotes(): Promise<GameNews[]> {
    try {
      const url = 'https://store.steampowered.com/news/app/730';
      const { data } = await axios.get(url, { headers: this.baseHeaders, timeout: 10000 });
      const $ = cheerio.load(data);

      // GAME UPDATES: En güncel update/patch linkini bul
      let newsLink = '';
      const posts = $('.newspost');
      
      posts.each((i, el) => {
        const link = $(el).find('a').first().attr('href') || '';
        const text = $(el).text().toLowerCase();
        if (link && (text.includes('update') || text.includes('patch') || text.includes('game'))) {
          newsLink = link;
          return false;
        }
      });
      
      // Fallback: İlk linki al
      if (!newsLink) {
        newsLink = $('.newspost').first().find('a').first().attr('href') || '';
      }
      
      if (!newsLink) {
        return [{
          id: `cs2-fallback-${Date.now()}`,
          source: 'cs2',
          title: 'Latest CS2 Game Update',
          description: 'Check Steam for Counter-Strike 2 game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'Counter-Strike 2'
        }];
      }

      if (!newsLink.startsWith('http')) {
        newsLink = 'https://store.steampowered.com' + newsLink;
      }

      try {
        const newsData = await axios.get(newsLink, { headers: this.baseHeaders, timeout: 10000 });
        const $news = cheerio.load(newsData.data);
        
        const title = $news('h1').first().text().trim() || 'Latest CS2 Game Update';
        
        let description = '';
        $news('p').slice(0, 5).each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10) {
            description += text + ' ';
          }
        });

        return [{
          id: `cs2-patch-${Date.now()}`,
          source: 'cs2',
          title,
          description: description.substring(0, 250).trim() || 'Counter-Strike 2 official game update',
          link: newsLink,
          timestamp: new Date(),
          type: 'patch',
          game: 'Counter-Strike 2'
        }];
      } catch (innerError) {
        console.error('Error fetching CS2 update details:', innerError);
        return [{
          id: `cs2-fallback-${Date.now()}`,
          source: 'cs2',
          title: 'Latest CS2 Game Update',
          description: 'Check Steam for Counter-Strike 2 game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'Counter-Strike 2'
        }];
      }
    } catch (error) {
      console.error('CS2 scraping error:', error);
      return [{
        id: `cs2-fallback-${Date.now()}`,
        source: 'cs2',
        title: 'Latest CS2 Game Update',
        description: 'Visit Steam for CS2 updates',
        link: 'https://store.steampowered.com/news/app/730',
        timestamp: new Date(),
        type: 'patch',
        game: 'Counter-Strike 2'
      }];
    }
  }

  async scrapeTFTPatchNotes(): Promise<GameNews[]> {
    try {
      const url = 'https://www.leagueoflegends.com/en-us/news/game-updates/';
      const { data } = await axios.get(url, { headers: this.baseHeaders, timeout: 10000 });
      const $ = cheerio.load(data);

      // GAME UPDATES: TFT patch linkini bul (teamfight/tft içeren)
      let tftLink = '';
      const links = $('a[href*="patch"], a[href*="teamfight"]');
      
      links.each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().toLowerCase();
        if ((href.includes('teamfight') || href.includes('tft')) && 
            (text.includes('patch') || text.includes('update'))) {
          tftLink = href;
          return false;
        }
      });
      
      if (!tftLink.startsWith('http')) {
        tftLink = 'https://www.leagueoflegends.com' + tftLink;
      }

      if (!tftLink) {
        return [{
          id: `tft-fallback-${Date.now()}`,
          source: 'tft',
          title: 'Latest TFT Game Update',
          description: 'Visit LoL official website for latest TFT game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'Teamfight Tactics'
        }];
      }

      try {
        const patchData = await axios.get(tftLink, { headers: this.baseHeaders, timeout: 10000 });
        const $patch = cheerio.load(patchData.data);
        
        const title = $patch('h1').first().text().trim() || 'Latest TFT Game Update';
        
        let description = '';
        $patch('p').slice(0, 5).each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10) {
            description += text + ' ';
          }
        });

        return [{
          id: `tft-patch-${Date.now()}`,
          source: 'tft',
          title,
          description: description.substring(0, 250).trim() || 'Official Teamfight Tactics game update',
          link: tftLink,
          timestamp: new Date(),
          type: 'patch',
          game: 'Teamfight Tactics'
        }];
      } catch (innerError) {
        console.error('Error fetching TFT patch details:', innerError);
        return [{
          id: `tft-fallback-${Date.now()}`,
          source: 'tft',
          title: 'Latest TFT Game Update',
          description: 'Check LoL website for latest TFT game updates',
          link: url,
          timestamp: new Date(),
          type: 'patch',
          game: 'Teamfight Tactics'
        }];
      }
    } catch (error) {
      console.error('TFT scraping error:', error);
      return [{
        id: `tft-fallback-${Date.now()}`,
        source: 'tft',
        title: 'Latest TFT Game Update',
        description: 'Visit LoL official website for TFT game updates',
        link: 'https://www.leagueoflegends.com/en-us/news/game-updates/',
        timestamp: new Date(),
        type: 'patch',
        game: 'Teamfight Tactics'
      }];
    }
  }

  // Mock match data - gerçek API entegrasyonu için kullanılabilir
  private getMockMatchData(): HLTVMatchesGrouped {
    const now = Date.now();
    
    return {
      live: [
        // CS2 Canlı Maçlar
        {
          id: `cs2-live-1-${now}`,
          team1: 'FaZe Clan',
          team2: 'Natus Vincere',
          date: new Date(),
          tournament: 'ESL Pro League S20',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 1.85, team2: 1.95 }
        },
        {
          id: `cs2-live-2-${now}`,
          team1: 'G2 Esports',
          team2: 'Team Vitality',
          date: new Date(),
          tournament: 'BLAST Premier',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 2.10, team2: 1.75 }
        },
        // LoL Canlı Maçlar
        {
          id: `lol-live-1-${now}`,
          team1: 'T1',
          team2: 'Gen.G',
          date: new Date(),
          tournament: 'LCK Winter 2025',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'LoL',
          odds: { team1: 1.65, team2: 2.25 }
        },
        {
          id: `lol-live-2-${now}`,
          team1: 'Fnatic',
          team2: 'G2 Esports',
          date: new Date(),
          tournament: 'LEC Winter',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'LoL',
          odds: { team1: 1.90, team2: 1.90 }
        },
        // Valorant Canlı Maçlar
        {
          id: `val-live-1-${now}`,
          team1: 'Sentinels',
          team2: 'Cloud9',
          date: new Date(),
          tournament: 'VCT Americas',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'Valorant',
          odds: { team1: 1.70, team2: 2.15 }
        },
        {
          id: `val-live-2-${now}`,
          team1: 'LOUD',
          team2: 'NRG',
          date: new Date(),
          tournament: 'VCT Americas',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'Valorant',
          odds: { team1: 1.55, team2: 2.45 }
        },
        // Dota 2 Canlı Maç
        {
          id: `dota-live-1-${now}`,
          team1: 'Team Spirit',
          team2: 'Gaimin Gladiators',
          date: new Date(),
          tournament: 'DPC 2025',
          status: 'live',
          link: 'https://escharts.com/tr/matches',
          game: 'Dota 2',
          odds: { team1: 1.80, team2: 2.00 }
        }
      ],
      upcoming: [
        // CS2 Yaklaşan Maçlar
        {
          id: `cs2-up-1-${now}`,
          team1: 'MOUZ',
          team2: 'Astralis',
          date: new Date(now + 1 * 3600000),
          tournament: 'IEM Katowice 2025',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 1.60, team2: 2.35 }
        },
        {
          id: `cs2-up-2-${now}`,
          team1: 'Team Liquid',
          team2: 'Heroic',
          date: new Date(now + 2 * 3600000),
          tournament: 'ESL Pro League S20',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 1.75, team2: 2.10 }
        },
        {
          id: `cs2-up-3-${now}`,
          team1: 'Cloud9',
          team2: 'ENCE',
          date: new Date(now + 3 * 3600000),
          tournament: 'BLAST Premier',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 1.95, team2: 1.85 }
        },
        // Valorant Yaklaşan Maçlar
        {
          id: `val-up-1-${now}`,
          team1: 'Paper Rex',
          team2: 'DRX',
          date: new Date(now + 2.5 * 3600000),
          tournament: 'VCT Pacific',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'Valorant',
          odds: { team1: 1.85, team2: 1.95 }
        },
        {
          id: `val-up-2-${now}`,
          team1: 'Fnatic',
          team2: 'Team Heretics',
          date: new Date(now + 4 * 3600000),
          tournament: 'VCT EMEA',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'Valorant',
          odds: { team1: 1.50, team2: 2.60 }
        },
        // LoL Yaklaşan Maçlar
        {
          id: `lol-up-1-${now}`,
          team1: 'Hanwha Life',
          team2: 'KT Rolster',
          date: new Date(now + 3.5 * 3600000),
          tournament: 'LCK Winter 2025',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'LoL',
          odds: { team1: 1.70, team2: 2.15 }
        },
        {
          id: `lol-up-2-${now}`,
          team1: 'MAD Lions',
          team2: 'Team BDS',
          date: new Date(now + 5 * 3600000),
          tournament: 'LEC Winter',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'LoL',
          odds: { team1: 1.65, team2: 2.25 }
        },
        // Dota 2 Yaklaşan Maçlar
        {
          id: `dota-up-1-${now}`,
          team1: 'Team Falcons',
          team2: 'Tundra Esports',
          date: new Date(now + 6 * 3600000),
          tournament: 'DPC 2025',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'Dota 2',
          odds: { team1: 1.90, team2: 1.90 }
        },
        // Yarınki Maçlar
        {
          id: `cs2-tomorrow-1-${now}`,
          team1: 'Natus Vincere',
          team2: 'MOUZ',
          date: new Date(now + 24 * 3600000),
          tournament: 'IEM Katowice 2025',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 1.55, team2: 2.50 }
        },
        {
          id: `lol-tomorrow-1-${now}`,
          team1: 'T1',
          team2: 'Dplus KIA',
          date: new Date(now + 26 * 3600000),
          tournament: 'LCK Winter 2025',
          status: 'upcoming',
          link: 'https://escharts.com/tr/matches',
          game: 'LoL',
          odds: { team1: 1.45, team2: 2.75 }
        }
      ],
      finished: [
        {
          id: `cs2-fin-1-${now}`,
          team1: 'FaZe Clan',
          team2: 'G2 Esports',
          date: new Date(now - 2 * 3600000),
          tournament: 'ESL Pro League S20',
          status: 'finished',
          link: 'https://escharts.com/tr/matches',
          game: 'CS2',
          odds: { team1: 1.75, team2: 2.10 }
        },
        {
          id: `lol-fin-1-${now}`,
          team1: 'Gen.G',
          team2: 'Hanwha Life',
          date: new Date(now - 3 * 3600000),
          tournament: 'LCK Winter 2025',
          status: 'finished',
          link: 'https://escharts.com/tr/matches',
          game: 'LoL',
          odds: { team1: 1.40, team2: 2.90 }
        }
      ]
    };
  }

  async scrapeEschartsMatches(): Promise<HLTVMatchesGrouped> {
    // Escharts 403 hatası veriyor, doğrudan mock veri döndür
    // Gerçek API entegrasyonu için escharts API veya başka kaynak gerekli
    return this.getMockMatchData();
  }

  async scrapeAll() {
    const [lolNews, cs2News, valorantNews, tftNews, eschartsData] = await Promise.all([
      this.scrapeLOLPatchNotes(),
      this.scrapeCS2PatchNotes(),
      this.scrapeValorantPatchNotes(),
      this.scrapeTFTPatchNotes(),
      this.scrapeEschartsMatches()
    ]);

    return {
      gameNews: [...lolNews, ...cs2News, ...valorantNews, ...tftNews],
      hltvMatches: eschartsData,
      lastUpdated: new Date()
    };
  }

  private parseDate(dateText: string): Date {
    if (!dateText) return new Date();
    
    if (/^\d{1,2}:\d{2}/.test(dateText)) {
      const today = new Date();
      const [hours, minutes] = dateText.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0);
      return today;
    }

    try {
      return new Date(dateText);
    } catch {
      return new Date();
    }
  }

  private makeAbsoluteUrl(href: string, baseUrl: string): string {
    if (!href) return baseUrl;
    if (href.startsWith('http')) return href;
    if (href.startsWith('/')) return new URL(baseUrl).origin + href;
    return new URL(href, baseUrl).href;
  }
}

export const gameScraper = new GameScraper();
