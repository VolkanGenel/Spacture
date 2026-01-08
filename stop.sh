#!/bin/bash

echo "🛑 Video Clip Creator durduruluyor..."

# Docker Compose komutunu belirle
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose bulunamadı!"
    exit 1
fi

# Container'ları durdur
$COMPOSE_CMD down

echo ""
echo "✅ Container'lar durduruldu"
echo ""

# İsteğe bağlı: Docker temizliği
read -p "🧹 Docker cache ve imajlarını temizlemek istiyor musunuz? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Temizlik yapılıyor..."
    docker system prune -f
    echo "✅ Temizlik tamamlandı"
fi

echo ""
echo "👋 Görüşmek üzere!"
