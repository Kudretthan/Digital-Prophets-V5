# Soroban Contract Deployment Instructions - Türkçe

## 📝 Deployment Adımları

### 1. Admin Hesabını Freighter'a İmport Et

```
1. Freighter Browser Extension'ı aç
2. "Add Account" / "Hesap Ekle" butonuna tıkla
3. "Import Secret Key" / "Gizli Anahtarı İmport Et" seç
4. Gizli anahtarını yapıştır (SBXXXXX... ile başlayan)
   Örnek: SBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
5. "Import" butonuna tıkla
```

**NOT:** Bu admin hesabı sadece testnet için kullanılır. Production'da hardware wallet kullan!

### 2. Ağı Testnet Olarak Ayarla

```
1. Freighter → Settings / Ayarlar
2. "Network" / "Ağ" bölümünde "Stellar Testnet" seç
3. Değişiklikleri kaydet
```

### 3. Deploy Komutunu Çalıştır

PowerShell'de şu komutu çalıştır:

```powershell
$WASM = "contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm"
soroban contract deploy `
  --wasm $WASM `
  --network testnet `
  --source-account GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3
```

### 4. Freighter'da İmzala

Deploy komutu çalıştığında:
- Freighter'da bir pencere açılacak
- İşlem detaylarını kontrol et
- "Approve" / "Onayla" butonuna tıkla
- İmza işlemi gerçekleşecek

### 5. Kontrat ID'sini Kaydet

Terminal'de sonuç şu şekilde görünecek:

```
✅ Kontrat başarıyla deploy edildi!
Kontrat ID: CAB3C7CJXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Bu ID'yi kopyala ve `.env.local` dosyasına ekle:

```env
NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=CAB3C7CJXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 6. Frontend'i Yeniden Başlat

```bash
cd frontend
npm run dev
```

## 🔗 Faydalı Linkler

- **Stellar Testnet Explorer:** https://stellar.expert/explorer/testnet/
- **Soroban Docs:** https://soroban.stellar.org/
- **Freighter Wallet:** https://www.freighter.app/
- **Kontrat Yönetimi:** https://soroban.stellar.org/docs/learn/deploying-contracts

## ❓ Sıkça Sorulan Sorular

**S: "No sign with key provided" hatası alıyorum**
- **C:** Freighter'da admin hesabını import ettiğinden emin ol

**S: "Account not found" hatası**
- **C:** Hesabın testnet'te yeterli XLM'ye sahip olmadığı anlamına gelir. Friendbot'tan yeniden fon iste:
  ```bash
  curl "https://friendbot.stellar.org?addr=GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3"
  ```

**S: Deploy işlemi cevap veremedi**
- **C:** İnternet bağlantısını kontrol et veya biraz bekle sonra tekrar dene

## 📋 Kontrol Listesi

- [ ] Freighter kurulu ve çalışıyor
- [ ] Admin hesabı Freighter'da import edildi
- [ ] Ağ Stellar Testnet olarak ayarlandı
- [ ] Hesapta yeterli XLM var (minimum 50 stroops)
- [ ] WASM dosyası build edildi
- [ ] Deploy komutu çalıştırıldı
- [ ] Freighter'da işlem imzalandı
- [ ] Kontrat ID kopyalandı ve kaydedildi
- [ ] .env.local güncellendi
- [ ] Frontend yeniden başlatıldı

---

**Başarı sonrası:** Kontratı testnet'te görebilirsin:
https://stellar.expert/explorer/testnet/contract/[KONTRAT_ID]
