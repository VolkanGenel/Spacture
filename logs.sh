#!/bin/bash

echo "📊 Video Clip Creator Log'ları"
echo "================================"
echo ""
echo "Log'lar gösteriliyor. Çıkmak için Ctrl+C tuşuna basın."
echo ""

# Docker Compose komutunu belirle
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose bulunamadı!"
    exit 1
fi

# Log'ları göster
$COMPOSE_CMD logs -f
