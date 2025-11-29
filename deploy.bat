@echo off
REM Digital Seers Deploy Script for Windows
REM Bu script SCP ve SSH ile deployment yapar

setlocal enabledelayedexpansion

set SERVER_IP=45.9.30.40
set SERVER_USER=root
set SERVER_PASS=4763e2de6eb2!diyo@
set ZIP_FILE=digital-seers.zip
set TEMP_ZIP=C:\tmp\%ZIP_FILE%

echo.
echo ========================================
echo Digital Seers Deployment Script
echo ========================================
echo.

REM 1. ZIP dosyasını kontrol et
if not exist "%ZIP_FILE%" (
    echo ERROR: %ZIP_FILE% bulunamadi!
    exit /b 1
)
echo OK ZIP dosyası bulundu: %ZIP_FILE%
echo.

REM 2. Geçici klasör oluştur
if not exist "C:\tmp" mkdir C:\tmp
copy "%ZIP_FILE%" "%TEMP_ZIP%" >nul
echo OK ZIP C:\tmp ye kopyalandı

REM 3. OpenSSH kontrol et
where ssh >nul 2>&1
if errorlevel 1 (
    echo WARNING: SSH bulunamadı. PuTTY plink kullanacağız...
    if not exist "C:\Program Files\PuTTY\pscp.exe" (
        echo ERROR: PuTTY bulunamadı. Lütfen PuTTY yükleyin veya OpenSSH kullanın
        exit /b 1
    )
)

echo.
echo ========================================
echo SCP İLE SUNUCUYA GÖNDERILIYOR...
echo ========================================
echo.

REM 4. SCP ile gönder
scp "%TEMP_ZIP%" %SERVER_USER%@%SERVER_IP%:/tmp/
if errorlevel 1 (
    echo ERROR: Dosya gönderilemedi!
    exit /b 1
)

echo.
echo ========================================
echo SUNUCUDA KURULUM BAŞLATILIYOR...
echo ========================================
echo.

REM 5. SSH ile sunucuda script çalıştır
ssh %SERVER_USER%@%SERVER_IP% << 'EOFSCRIPT'
set -e

PROJECT_NAME="digital-seers"
APP_PORT=3000
DEPLOY_PATH="/opt/${PROJECT_NAME}"
TEMP_ZIP="/tmp/digital-seers.zip"

echo "🚀 Digital Seers Deploy Başlıyor..."
echo ""

# PM2'yi durdur
echo "⏹️  Eski uygulamayı durduruluyor..."
pm2 stop ${PROJECT_NAME} 2>/dev/null || true
sleep 2

# Dizin hazırla
echo "📁 Dizin hazırlanıyor: ${DEPLOY_PATH}"
mkdir -p ${DEPLOY_PATH}
cd ${DEPLOY_PATH}

# Eski dosyaları temizle
echo "🗑️  Eski dosyalar temizleniyor..."
rm -rf ${DEPLOY_PATH}/* 2>/dev/null || true

# ZIP dosyasını aç
echo "📦 ZIP dosyası açılıyor..."
unzip -q -o ${TEMP_ZIP} -d ${DEPLOY_PATH}

# Node.js kontrol et
echo "📋 Node.js kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 18 kurulacak..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get update
    apt-get install -y nodejs
fi

# PM2 kontrol et
echo "📋 PM2 kontrol ediliyor..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 kurulacak..."
    npm install -g pm2
fi

# npm dependencies
echo "📚 npm dependencies kurulacak..."
npm ci --production || npm install --production

# Build
echo "🏗️  Build yapılıyor..."
npm run build

# PM2 ile başlat
echo "🚀 Uygulama başlatılıyor..."
pm2 delete ${PROJECT_NAME} 2>/dev/null || true
sleep 1
pm2 start npm --name ${PROJECT_NAME} -- start -- -p ${APP_PORT}
pm2 save
pm2 startup systemd -u root --hp /root

# Temizlik
rm -f ${TEMP_ZIP}

# Status
echo ""
echo "=========================================="
echo "✨ Deploy Tamamlandı!"
echo "=========================================="
echo "🌐 URL: http://45.9.30.40:${APP_PORT}"
echo "📋 Status: "
pm2 status
echo "=========================================="

EOFSCRIPT

echo.
echo ========================================
echo DEPLOYMENT TAMAMLANDI
echo ========================================
echo.
echo Siteniz sunucuda çalışıyor!
echo URL: http://45.9.30.40:3000
echo.
pause
