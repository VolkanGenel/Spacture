#!/bin/bash

echo "🧹 Video Clip Creator Temizliği"
echo "================================"
echo ""

echo "⚠️  UYARI: Bu işlem şunları silecektir:"
echo "   • Tüm Docker container'ları"
echo "   • Kullanılmayan Docker imajları"
echo "   • Docker network'leri"
echo "   • Docker volume'leri"
echo ""
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ İptal edildi"
    exit 0
fi

echo "1. Container'lar durduruluyor..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null

echo "2. Kullanılmayan Docker objeleri temizleniyor..."
docker system prune -af

echo "3. Volume'ler temizleniyor..."
docker volume prune -f

echo "4. Network'ler temizleniyor..."
docker network prune -f

echo ""
echo "✅ Temizlik tamamlandı!"
echo ""
echo "📝 Not: Yerel verileriniz (uploads/, clips/, video_clips.db) korundu."
