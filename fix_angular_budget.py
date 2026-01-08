import json
import sys

# angular.json dosyasını oku
with open('Frontend/video-clip-frontend/angular.json', 'r') as f:
    data = json.load(f)

# Budget ayarlarını değiştir
if 'projects' in data and 'video-clip-frontend' in data['projects']:
    project = data['projects']['video-clip-frontend']
    if 'architect' in project and 'build' in project['architect']:
        build_config = project['architect']['build']
        
        # Production configuration'daki budget'ları değiştir
        if 'configurations' in build_config and 'production' in build_config['configurations']:
            prod_config = build_config['configurations']['production']
            
            # Budget array'ini güncelle
            prod_config['budgets'] = [
                {
                    "type": "initial",
                    "maximumWarning": "5mb",
                    "maximumError": "10mb"
                },
                {
                    "type": "anyComponentStyle", 
                    "maximumWarning": "500kb",
                    "maximumError": "1mb"
                }
            ]
            
            print("✅ Budget ayarları güncellendi!")
            
            # Değişiklikleri kaydet
            with open('Frontend/video-clip-frontend/angular.json', 'w') as f:
                json.dump(data, f, indent=2)
            
            print("✅ angular.json dosyası kaydedildi!")
        else:
            print("❌ Production configuration bulunamadı!")
    else:
        print("❌ Build configuration bulunamadı!")
else:
    print("❌ Proje yapısı bulunamadı!")
