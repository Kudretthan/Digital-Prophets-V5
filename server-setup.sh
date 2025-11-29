#!/bin/bash
# Digital Seers Kurulum ve Deploy Script
# Sunucu tarafında çalıştırılacak

set -e

echo "🚀 Digital Seers Sunucu Kurulumu Başlıyor..."

PROJECT_NAME="digital-seers"
APP_PORT=3000
DEPLOY_PATH="/opt/${PROJECT_NAME}"

# Dizin oluştur
mkdir -p ${DEPLOY_PATH}
cd ${DEPLOY_PATH}

echo "📦 Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 18 kurulacak..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get update
    apt-get install -y nodejs git
fi

echo "📦 PM2 kontrol ediliyor..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 kurulacak..."
    npm install -g pm2
fi

echo "🔄 Git repo klonlanıyor..."
if [ -d "${DEPLOY_PATH}/.git" ]; then
    cd ${DEPLOY_PATH}
    git pull origin main 2>/dev/null || git pull origin master
else
    # Eğer Git URL varsa buraya yazın
    cd /opt
    git clone https://github.com/your-repo/digital-seers.git || echo "Git repo kopyalanamadı, manuel yükle"
fi

cd ${DEPLOY_PATH}

echo "📚 Dependencies kurulacak..."
npm ci --production || npm install --production

echo "🏗️ Build yapılıyor..."
npm run build

echo "✅ Uygulama başlatılıyor..."
pm2 delete ${PROJECT_NAME} || true
pm2 start npm --name ${PROJECT_NAME} -- start -- -p ${APP_PORT}
pm2 startup
pm2 save

echo "✨ Deploy tamamlandı!"
echo "🌐 Uygulama çalışıyor: http://45.9.30.40:${APP_PORT}"
echo "📋 PM2 Logs: pm2 logs ${PROJECT_NAME}"
echo "🔄 Durumu kontrol: pm2 status"
