#!/bin/bash

echo "================================================"
echo "🎬 VIDEO CLIP CREATOR - Docker ile Başlatılıyor"
echo "================================================"
echo ""

# Docker kontrolü
if ! command -v docker &> /dev/null; then
    echo "❌ HATA: Docker yüklü değil!"
    echo ""
    echo "📦 Docker'ı yüklemek için:"
    echo "   macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Docker Compose kontrolü
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  UYARI: docker-compose bulunamadı, Docker Compose V2 deneniyor..."
    if ! docker compose version &> /dev/null; then
        echo "❌ HATA: Docker Compose da yüklü değil!"
        echo ""
        echo "📦 Docker Desktop ile birlikte gelmelidir."
        exit 1
    fi
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "✅ Docker ve Docker Compose yüklü"
echo ""

# Gerekli dosyaları kontrol et
echo "🔍 Gerekli dosyalar kontrol ediliyor..."
REQUIRED_FILES=("Dockerfile.backend" "Dockerfile.frontend" "nginx.conf" "docker-compose.yml")
MISSING_FILES=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Eksik dosya: $file"
        MISSING_FILES=1
    else
        echo "✅ Mevcut: $file"
    fi
done

if [ $MISSING_FILES -eq 1 ]; then
    echo ""
    echo "❌ Bazı gerekli dosyalar eksik!"
    exit 1
fi

echo ""
echo "✅ Tüm gerekli dosyalar mevcut"
echo ""

# Docker imajlarını oluştur
echo "🔨 Docker imajları oluşturuluyor (ilk defa 5-10 dakika sürebilir)..."
$COMPOSE_CMD build

if [ $? -ne 0 ]; then
    echo "❌ HATA: Docker build başarısız!"
    exit 1
fi

echo ""
echo "✅ Docker imajları başarıyla oluşturuldu"
echo ""

# Container'ları başlat
echo "🚀 Container'lar başlatılıyor..."
$COMPOSE_CMD up -d

if [ $? -ne 0 ]; then
    echo "❌ HATA: Container'lar başlatılamadı!"
    exit 1
fi

echo ""
echo "⏳ Servislerin başlaması bekleniyor (15 saniye)..."
sleep 15

echo ""
echo "🔍 Servis durumu kontrol ediliyor..."
$COMPOSE_CMD ps

echo ""
echo "================================================"
echo "🎉 TEBRİKLER! Video Clip Creator hazır!"
echo "================================================"
echo ""
echo "🌐 UYGULAMAYA ERİŞİM:"
echo "   • Ana Uygulama: http://localhost"
echo "   • Backend API: http://localhost:8000"
echo "   • API Dokümantasyonu: http://localhost:8000/docs"
echo "   • Swagger UI: http://localhost:8000/docs"
echo ""
echo "🛠️  KOMUTLAR:"
echo "   • Durdurmak: ./stop.sh"
echo "   • Log'ları görmek: ./logs.sh"
echo "   • Temizlemek: ./clean.sh"
echo ""
echo "📝 NOT:"
echo "   • İlk açılışta Angular build işlemi biraz zaman alabilir"
echo "   • Tarayıcınızı yenileyin (Ctrl+R veya Cmd+R)"
echo "   • 30MB'a kadar video yükleyebilirsiniz"
echo "================================================"
echo ""
echo "👨‍💻 İyi kesmeler! ✂️🎬"
echo ""
