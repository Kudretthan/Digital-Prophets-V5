#!/bin/bash

# Digital Seers Deployment Script
# Sunucuya deploy etmek için kullanılacak

set -e

echo "🚀 Digital Seers Deploy Başlıyor..."

# Sunucu bilgileri
SERVER_IP="45.9.30.40"
SERVER_USER="root"
PROJECT_NAME="digital-seers"
APP_PORT=3000
DEPLOY_PATH="/opt/${PROJECT_NAME}"

# Yerel dizin
LOCAL_DIR="$(pwd)"

echo "📦 Proje paketleniyor..."
# node_modules ve .next dosyaları hariç tut
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='dist' \
    -czf ${PROJECT_NAME}.tar.gz \
    --exclude='*.log' \
    .

echo "📤 Sunucuya yükleniyor (${SERVER_IP})..."
scp -r ${PROJECT_NAME}.tar.gz ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/ || true
mkdir -p ${DEPLOY_PATH} 2>/dev/null || true

echo "🔧 Sunucu tarafında ayarlama yapılıyor..."

# Sunucu tarafında komutları çalıştır
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
set -e

PROJECT_NAME="digital-seers"
APP_PORT=3000
DEPLOY_PATH="/opt/${PROJECT_NAME}"

cd ${DEPLOY_PATH}

# Eski dosyaları temizle
if [ -d "${DEPLOY_PATH}" ]; then
    rm -rf ${DEPLOY_PATH}/*
fi

# Arşivi aç
tar -xzf ${PROJECT_NAME}.tar.gz

# Node.js kurulu mu kontrol et
if ! command -v node &> /dev/null; then
    echo "📦 Node.js kurulacak..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# PM2 kurulu mu kontrol et
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 kurulacak..."
    npm install -g pm2
fi

# Bağımlılıkları yükle
echo "📚 npm dependencies kurulacak..."
npm ci --production || npm install --production

# Build yap
echo "🏗️  Build yapılıyor..."
npm run build

# PM2 ile başlat
echo "✅ Uygulama başlatılıyor..."
pm2 delete ${PROJECT_NAME} || true
pm2 start npm --name ${PROJECT_NAME} -- start -- -p ${APP_PORT}
pm2 save

# Nginx ayarları (varsa)
if command -v nginx &> /dev/null; then
    echo "🌐 Nginx yapılandırılıyor..."
    # Nginx config burada yapılabilir
fi

echo "✨ Deploy tamamlandı!"
echo "🌐 Uygulama şu adreste çalışıyor: http://45.9.30.40:${APP_PORT}"

EOF

# Yerel arşivi temizle
rm ${PROJECT_NAME}.tar.gz

echo "✅ Deploy başarılı!"
echo "🌐 URL: http://45.9.30.40:3000"
