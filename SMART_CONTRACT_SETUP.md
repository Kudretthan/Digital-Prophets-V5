# Stellar Smart Contract Kurulum Rehberi

## 1. Kontrat Derleme (Soroban SDK ile)

```bash
# Soroban CLI'yı kur
cargo install --locked soroban-cli

# Proje klasörüne geç
cd contracts

# Kontratı derle
soroban contract build
```

## 2. Testnet'te Deploy

```bash
# Testnet'te cüzdan oluştur (Freighter ile zaten var, ama keypair'i dışa aktar)
soroban keys generate --global testing

# Testnet'te deploy et
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/prediction_market.wasm \
  --source testing \
  --network testnet
```

Deploy sonrası çıkan contract ID'yi `src/lib/predictionMarket.ts` içinde `CONTRACT_ID` değerine kopyala:

```typescript
export const CONTRACT_ID = 'CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
```

## 3. Kontrat Initialization

Frontend'den başlattığında veya bu CLI komutla:

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source testing \
  --network testnet \
  -- initialize \
  --token GBRPYHIL2CI3WHZDTOOQFC6EB4NCQOB5SOHRAB52HM7XUFHRXKYDAB7D \
  --admin GDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 4. Frontend Entegrasyon

- `src/lib/predictionMarket.ts`: Kontrat çağrı fonksiyonları.
- `src/components/BetPlacementModal.tsx`: Bahis yerleştirmede akıllı kontrat çağrısı.
- Freighter ile işlem imzalama otomatik çalışıyor.

## 5. Önemli Notlar

- **Token Address**: xlm token'ın issuer adresini doğru ayarla.
- **Admin Address**: Tahminleri oluşturan ve çözen admin adresi.
- **Testnet Horizon**: Tüm sorgulamalar `https://soroban-testnet.stellar.org:443` üzerinden.

## 6. Test Akışı

1. Cüzdanı Freighter'dan bağla.
2. Bahis kartından "Tahmin Et" ye tıkla.
3. Bahis yerleştir → Freighter işlem imzalama iste.
4. Blockchain'de işlem tamamlanırsa başarı mesajı görürsün.
5. Fallback olarak API de kullanılabilir (eğer kontrat deploy değilse).

---

**Sonraki Adımlar:**
- Kontratı gerçekten deploy ettikten sonra, tahmin çözüm akışını (resolve_prediction) implement et.
- Kazanan belirleme ve ödeme dağıtımı otomatikleşti (kontrat düzeyinde).
