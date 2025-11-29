#!/bin/bash

# Digital Seers Sunucu Deploy Script
# Bu script sunucu tarafında çalıştırılacak

set -e

echo "🚀 Digital Seers Deploy Başlıyor..."
echo "📦 Sunucu: 45.9.30.40"
echo "🔧 Proje: digital-seers"

# Konfigürasyon
SERVER_IP="45.9.30.40"
PROJECT_NAME="digital-seers"
APP_PORT=3000
DEPLOY_PATH="/opt/${PROJECT_NAME}"
TEMP_ZIP="/tmp/${PROJECT_NAME}.zip"

# 1. Zaten çalışan uygulamayı durdur
echo "⏹️ Eski uygulamayı durduruluyor..."
pm2 stop ${PROJECT_NAME} 2>/dev/null || true
sleep 2

# 2. Dizin hazırla
echo "📁 Dizin hazırlanıyor..."
mkdir -p ${DEPLOY_PATH}
cd ${DEPLOY_PATH}

# 3. Eski dosyaları temizle (package-lock.json ve .env hariç)
if [ -d "${DEPLOY_PATH}" ] && [ "$(ls -A ${DEPLOY_PATH})" ]; then
    echo "🗑️ Eski dosyalar temizleniyor..."
    find ${DEPLOY_PATH} -type f -not -name "package-lock.json" -not -name ".env" -not -name ".env.local" -delete
fi

# 4. ZIP dosyası aç
echo "📦 ZIP dosyası açılıyor..."
unzip -q -o ${TEMP_ZIP} -d ${DEPLOY_PATH} 2>/dev/null || {
    echo "❌ ZIP dosyası bulunamadı: ${TEMP_ZIP}"
    exit 1
}

# 5. Node.js kontrol et
echo "📋 Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 18 kurulacak..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get update
    apt-get install -y nodejs
else
    NODE_VER=$(node -v)
    echo "✅ Node.js $NODE_VER mevcut"
fi

# 6. npm kontrol et
echo "📋 npm kontrol ediliyor..."
npm -v

# 7. PM2 kontrol et
echo "📋 PM2 kontrol ediliyor..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 kurulacak..."
    npm install -g pm2
else
    echo "✅ PM2 mevcut"
fi

# 8. Bağımlılıkları yükle
echo "📚 npm dependencies kurulacak..."
npm ci --production 2>/dev/null || npm install --production

# 9. Build yapısı oluştur
echo "🏗️ Build yapılıyor..."
npm run build

# 10. .env dosyası yoksa oluştur
if [ ! -f "${DEPLOY_PATH}/.env.local" ]; then
    echo "⚙️ .env.local dosyası oluşturuluyor..."
    cat > .env.local << EOF
# Digital Seers Environment
NODE_ENV=production
PORT=${APP_PORT}
NEXT_PUBLIC_SITE_URL=http://45.9.30.40:${APP_PORT}
EOF
fi

# 11. PM2 ile başlat
echo "🚀 Uygulama başlatılıyor..."
pm2 delete ${PROJECT_NAME} 2>/dev/null || true
sleep 1

# Start with production
pm2 start npm --name ${PROJECT_NAME} -- start -- -p ${APP_PORT}

# 12. PM2 ayarlarını kaydet
echo "💾 PM2 ayarları kaydediliyor..."
pm2 save
pm2 startup systemd -u root --hp /root

# 13. Temizlik
echo "🧹 Geçici dosyalar temizleniyor..."
rm -f ${TEMP_ZIP}

# 14. Status kontrol et
echo ""
echo "=========================================="
echo "✨ Deploy Tamamlandı!"
echo "=========================================="
echo "🌐 Uygulama URL: http://45.9.30.40:${APP_PORT}"
echo "📋 Status Kontrol: pm2 status"
echo "📊 Logs Görmek: pm2 logs ${PROJECT_NAME}"
echo "🔄 Yeniden Başlatmak: pm2 restart ${PROJECT_NAME}"
echo "⏹️ Durdurmak: pm2 stop ${PROJECT_NAME}"
echo "=========================================="
echo ""

pm2 status
