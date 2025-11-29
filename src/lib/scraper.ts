import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedData {
  source: string;
  title: string;
  description: string;
  price?: string;
  url: string;
  timestamp: Date;
  imageUrl?: string;
  data: Record<string, any>;
}

export class WebScraperBot {
  private cache: Map<string, ScrapedData[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 dakika

  /**
   * Genel scraping fonksiyonu
   */
  async scrapeWebsite(url: string, selector: string, extractFn?: (html: string) => any): Promise<ScrapedData[]> {
    try {
      console.log(`🔄 Scraping başlıyor: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      const results: ScrapedData[] = [];

      $(selector).each((index, element) => {
        try {
          const $element = $(element);
          
          const data = {
            source: new URL(url).hostname,
            title: $element.find('h1, h2, h3, .title, [data-title]').text().trim(),
            description: $element.find('p, .description, [data-description]').text().trim(),
            price: $element.find('[data-price], .price, .cost').text().trim(),
            url: url,
            timestamp: new Date(),
            imageUrl: $element.find('img').attr('src'),
            data: extractFn ? extractFn($element.html() || '') : {},
          };

          if (data.title) {
            results.push(data);
          }
        } catch (error) {
          console.error('Element parsing hatası:', error);
        }
      });

      console.log(`✅ ${results.length} veri çekildi`);
      return results;
    } catch (error) {
      console.error(`❌ Scraping hatası (${url}):`, error);
      return [];
    }
  }

  /**
   * Cache ile scraping
   */
  async scrapeWithCache(url: string, selector: string, cacheKey: string): Promise<ScrapedData[]> {
    const now = Date.now();
    const cacheTime = this.cacheExpiry.get(cacheKey) || 0;

    // Cache geçerli mi?
    if (this.cache.has(cacheKey) && cacheTime > now) {
      console.log(`📦 Cache kullanılıyor: ${cacheKey}`);
      return this.cache.get(cacheKey) || [];
    }

    // Yeni veri çek
    const data = await this.scrapeWebsite(url, selector);
    
    // Cache'e kaydet
    this.cache.set(cacheKey, data);
    this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL);

    return data;
  }

  /**
   * Spesifik site scraperları
   */

  // Örnek: Kripto fiyatları (CoinMarketCap)
  async scrapeCryptoPrices(): Promise<ScrapedData[]> {
    return this.scrapeWithCache(
      'https://coinmarketcap.com',
      'table tbody tr',
      'crypto-prices'
    );
  }

  // Örnek: Haber sitesi
  async scrapeNews(newsUrl: string): Promise<ScrapedData[]> {
    return this.scrapeWithCache(
      newsUrl,
      'article, .article, [data-article]',
      `news-${new URL(newsUrl).hostname}`
    );
  }

  // Örnek: E-ticaret ürünleri
  async scrapeProducts(productUrl: string): Promise<ScrapedData[]> {
    return this.scrapeWithCache(
      productUrl,
      '.product, [data-product], .item',
      `products-${new URL(productUrl).hostname}`
    );
  }

  /**
   * Batch scraping - Birden çok site
   */
  async scrapeBatch(
    urls: Array<{ url: string; selector: string; key: string }>
  ): Promise<Map<string, ScrapedData[]>> {
    const results = new Map<string, ScrapedData[]>();

    for (const { url, selector, key } of urls) {
      const data = await this.scrapeWithCache(url, selector, key);
      results.set(key, data);
    }

    return results;
  }

  /**
   * Cache temizle
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      console.log(`🗑️  Cache temizlendi: ${key}`);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
      console.log(`🗑️  Tüm cache temizlendi`);
    }
  }

  /**
   * Cache durumu
   */
  getCacheStatus(): { key: string; itemCount: number; expiryTime: string }[] {
    return Array.from(this.cache.entries()).map(([key, data]) => ({
      key,
      itemCount: data.length,
      expiryTime: new Date(this.cacheExpiry.get(key) || 0).toISOString(),
    }));
  }
}

export default new WebScraperBot();
