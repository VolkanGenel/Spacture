import re

with open('Backend/main.py', 'r') as f:
    content = f.read()

# CORS ayarlarını düzelt
content = content.replace(
    'allow_origins=["http://localhost:4200"],  # Angular dev sunucusu',
    'allow_origins=["*"],  # Allow all origins for Docker'
)

with open('Backend/main.py', 'w') as f:
    f.write(content)

print("✅ CORS ayarları düzeltildi!")
