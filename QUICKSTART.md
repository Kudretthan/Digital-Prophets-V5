# Dijital Kahinler - Platform Özeti

## 🎮 Nedir?

Oyun gelecektini tahmin eden Web3 tabanlı decentralized prediction market platformu.

## 🏆 Temel Özellikler

✅ **Freighter Cüzdan Entegrasyonu** - Güvenli blockchain işlemleri
✅ **xlm Token Sistemi** - Tahmin başarısına göre kazanç/kayıp
✅ **Canlı Piyasa Tablosu** - Kripto borsa tarzı animasyonlar
✅ **Analist Profilleri** - Başarı oranı, rozetler, kazanç metrikleri
✅ **Lider Tablosu** - Global sıralaması
✅ **Dark Mode UI** - Neon yeşili/mavisi ve Matrix arka planı

## 🚀 Başlangıç

```bash
cd "C:\Users\kudre\OneDrive\Masaüstü\digital-seers"
npx next dev
# http://localhost:3001
```

## 📍 Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Canlı tahmin tablosu |
| Tahmin Oluştur | `/create` | Yeni tahmin formu |
| Lider Tablosu | `/leaderboard` | Analist sıralaması |

## 💡 Kullanım Akışı

1. **Cüzdan Bağla** - "💼 Connect Wallet"
2. **Tahmin Seç** - Ana tabloda tahmin tıkla
3. **Analiz Oku** - Teknik + Duygusal analiz gözlemle
4. **Bahis Yerleştir** - "BET" veya tahminin YES/NO butonlarını seç
5. **İzle** - Sonuç bekleme veya kazanç/kayıp takibi

## 🔐 Freighter Entegrasyonu

- **Ağ**: Stellar Testnet
- **Cüzdan**: Freighter extension (https://freighter.app)
- **Token**: xlm (örnek issuer)
- **İşlemler**: Client-side imzalama

## 📦 Teknik Stack

- **Frontend**: React, Next.js 16, TypeScript, Tailwind CSS
- **Web3**: Stellar SDK, Freighter API
- **State**: Zustand
- **API**: Next.js API routes

## 📁 Dosya Yapısı

```
src/
├── app/              # Next.js pages
├── components/       # React bileşenleri
├── types/            # TypeScript tanımları
├── lib/              # Utilities (Stellar, Freighter)
└── store/            # Zustand state
```

## ✨ Öne Çıkan Bileşenler

### MatrixBackground
- Canvas-tabanlı düşen karakter animasyonu
- Arkaplanın arkasında çalışır (pointer-events: none)

### WalletConnect
- Freighter bağlantısı ve yönetimi
- Cüzdan adresi gösterimi (truncated)
- LocalStorage ile kalıcılık

### PredictionMarketTable
- Canlı tahmin listesi
- Sıralanabilir sütunlar
- Fiyat hareket animasyonları

### BetPlacementModal
- Bahis tutarı giriş
- YES/NO seçimi
- Potansiyel kazanç hesabı

### AnalystProfile
- Analist istatistikleri
- Başarı oranı göstergesi
- Rozetler ve unvanlar

## 💰 Token Mekanikleri

- **xlm Balance**: Cüzdan xlm bakiyesi
- **Staking**: Tahmin oluşturmada bahis
- **Payout**: Oran × Bahis Tutarı
- **Leaderboard**: Kazanç sıralaması

## 🌐 API Endpoints

```
GET  /api/predictions          # Tahminleri getir
POST /api/predictions          # Tahmin oluştur
GET  /api/bets/[userId]        # Kullanıcı bahisleri
POST /api/bets                 # Bahis yerleştir
POST /api/wallet               # Cüzdan kontrol
POST /api/transactions         # İşlem oluştur
```

## 🎯 Sonraki Aşamalar

- [ ] Backend database (PostgreSQL)
- [ ] Gerçek Stellar işlem imzalama
- [ ] WebSocket gerçek zamanlı güncellemeler
- [ ] User authentication
- [ ] Advanced charts
- [ ] Mobile optimization

## 📞 Destek

Production deployment için:
1. Environment variables (.env.local)
2. API rate limiting
3. CORS konfigürasyonu
4. Blockchain explorer integrasyonu
5. Error logging sistemi

---

**Oyun meta'sını önceden görenler kazanır!** 🔮
