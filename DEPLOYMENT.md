# 🚀 Deployment Rehberi - Dijital Kahinler

## Production Deployment

### 1. Vercel (Recommended - Next.js optimized)

```bash
# Git repository başlat
git init
git add .
git commit -m "Initial commit: Dijital Kahinler platform"

# Vercel CLI ile deploy
npm install -g vercel
vercel

# Environment variables ayarla (Vercel Dashboard)
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_xlm_TOKEN_CODE=xlm
NEXT_PUBLIC_xlm_ISSUER=GAXN7H22EHZDGFTD2UXNW57QJHSOWQYQEHRYQKCRQ3OZRWOXMXVB3MZX
```

### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Build & Run
docker build -t digital-seers .
docker run -p 3001:3001 -e NEXT_PUBLIC_STELLAR_NETWORK=testnet digital-seers
```

### 3. Self-Hosted (Linux/Ubuntu)

```bash
# SSH ile bağlan
ssh user@your-server.com

# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Proje klon
git clone https://github.com/your-repo/digital-seers.git
cd digital-seers

# Bağımlılıkları yükle
npm install

# Production build
npm run build

# PM2 ile başlat (arka plan servisi)
sudo npm install -g pm2
pm2 start npm --name "digital-seers" -- start
pm2 save
pm2 startup
```

### 4. Environment Variables (.env.production)

```env
# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
NEXT_PUBLIC_HORIZON_URL=https://horizon.stellar.org

# API
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/digital-seers

# Security
JWT_SECRET=your-secure-random-secret-key
API_RATE_LIMIT=100

# Features
ENABLE_STELLAR_INTEGRATION=true
ENABLE_BETS=true
```

---

## Pre-Production Checklist

- [ ] **Stellar Network**: Testnet → Mainnet
- [ ] **SSL Certificate**: HTTPS etkinleştirildi
- [ ] **CORS Configuration**: Doğru domain'ler
- [ ] **Rate Limiting**: API DDoS koruması
- [ ] **Error Logging**: Sentry veya benzer hizmet
- [ ] **Database Backup**: Otomatik backup sistemi
- [ ] **Security Headers**: HSTS, X-Frame-Options vb
- [ ] **Content Delivery**: CDN (Cloudflare)

---

## Stellar Mainnet Setup

### xlm Token Kontrat Oluşturma

```bash
# Mainnet issuer hesabı oluştur
# Freighter → Settings → Change Network → Stellar Mainnet

# Trust line oluştur ve token dağıt
# Horizon API kullanarak ya da Web UI ile
```

### Smart Contract (Soroban - Opsiyonel)

```rust
// Soroban smart contract (Rust)
use soroban_sdk::{contract, contractimpl, Env, Symbol, IntoVal};

#[contract]
pub struct PredictionMarket;

#[contractimpl]
impl PredictionMarket {
    pub fn place_bet(env: Env, user: Address, amount: i128, prediction: bool) -> Result {
        // Bahis yerleştirme mantığı
        Ok(())
    }

    pub fn resolve_prediction(env: Env, prediction_id: u32, result: bool) -> Result {
        // Tahmin çözümleme mantığı
        Ok(())
    }
}
```

---

## Monitoring & Maintenance

### Log Monitoring

```bash
# PM2 logs
pm2 logs digital-seers

# Syslog
tail -f /var/log/syslog | grep digital-seers
```

### Database Optimization

```sql
-- Tahmin tablosu indexleri
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_predictions_creator ON predictions(created_by);

-- Bahis tablosu indexleri
CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_prediction ON bets(prediction_id);
```

### Performance Tuning

- Redis cache için: `npm install redis`
- Image optimization: Next.js Image component
- Bundle analysis: `npm install -D @next/bundle-analyzer`

---

## Scaling Strategy

### Horizontal Scaling
- Load Balancer (Nginx/HAProxy)
- Multiple Next.js instances
- Redis session store

### Database Scaling
- Read replicas (PostgreSQL)
- Connection pooling (PgBouncer)
- Sharding (partition by user_id)

### Blockchain Scaling
- Stellar'ın built-in scalability
- Batch transactions
- State channels (ileri)

---

## Security Best Practices

1. **API Security**
   - Rate limiting enabled
   - CORS properly configured
   - API key authentication

2. **Wallet Security**
   - Client-side signing only
   - No private keys in backend
   - Freighter integration verified

3. **Database Security**
   - SSL connection enabled
   - Automated backups
   - Encryption at rest

4. **DDoS Protection**
   - Cloudflare DDoS mitigation
   - IP whitelisting
   - Request throttling

---

## Rollback Procedure

```bash
# Eğer deployment başarısız olursa
pm2 kill
git checkout previous-stable-commit
npm install
npm run build
pm2 start npm --name "digital-seers" -- start
```

---

## Monitoring URLs

- **Application**: https://yourdomain.com
- **API Health**: https://yourdomain.com/api/health
- **Database**: Connection string verified
- **Stellar**: https://stellar.expert/explorer/mainnet

---

## Support & Updates

- Next.js: `npm update next`
- Stellar SDK: `npm update stellar-sdk`
- Security patches: Düzenli uygulan

**Production ready! 🚀**
