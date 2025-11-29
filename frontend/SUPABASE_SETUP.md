# Supabase Setup Guide

## 1. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git ve hesap oluştur
2. Yeni bir proje oluştur (PostgreSQL)
3. Proje başlatılana kadar bekle

## 2. Veritabanı Şemasını Oluştur

1. Supabase dashboard'da "SQL Editor"e git
2. Sol taraftaki "New query" butonuna tıkla
3. `SUPABASE_SCHEMA.sql` dosyasının içeriğini kopyala ve yapıştır
4. "RUN" butonuna tıkla

## 3. Environment Değişkenlerini Ayarla

1. Supabase dashboard'da "Settings" → "API" git
2. Şu bilgileri kopyala:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public) key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. `.env.local` dosyasını güncelle:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Uygulamayı Yeniden Başlat

```bash
cd frontend
npm run dev
```

## 5. Test Et

- Uygulamayı http://localhost:3000 adresinde aç
- Canlı bahisler, tahminler ve bahisler artık Supabase'den gelecek

## Tablolar

### `predictions` Tablosu
- Tüm tahminleri ve pazar istatistiklerini saklar
- Kategori: valorant, lol, cs2, dota2, tft

### `bets` Tablosu
- Kullanıcı bahislerini saklar
- user_id, prediction_id, amount, status vb.

### `users` Tablosu (Opsiyonel)
- Kullanıcı profillerini saklar
- Username, avatar, bakiye vb.

## Güvenlik

Row Level Security (RLS) etkinleştirildikten sonra, daha spesifik politikalar ekleyebilirsin:

```sql
-- Örnek: Sadece kendi bahislerini görmek
CREATE POLICY "Users can view their own bets" ON bets
  FOR SELECT USING (auth.uid()::text = user_id);
```

## Sorun Giderme

**"Supabase credentials are missing" hatası:**
- `.env.local` dosyasında URL ve key'in doğru olup olmadığını kontrol et
- Dosyayı kaydettikten sonra dev sunucusunu yeniden başlat (`npm run dev`)

**"Bağlantı başarısız" hatası:**
- Supabase'de project'in çalışıp çalışmadığını kontrol et
- URL ve key'in doğru olup olmadığını kontrol et
