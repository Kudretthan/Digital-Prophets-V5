import { gameScraper } from '@/lib/gameScraper';
import { NextResponse } from 'next/server';

// Cache için
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function GET() {
  try {
    // Cache kontrol
    const now = Date.now();
    if (cachedData && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Verileri çek
    const data = await gameScraper.scrapeAll();
    
    // Cache'e kaydet
    cachedData = data;
    cacheTime = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Scraping API error:', error);
    return NextResponse.json(
      { 
        error: 'Veriler yüklenirken hata oluştu',
        gameNews: [],
        hltvMatches: { upcoming: [], live: [], finished: [] },
        lastUpdated: new Date()
      },
      { status: 500 }
    );
  }
}
