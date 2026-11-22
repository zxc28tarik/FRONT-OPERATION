# FRONT OPERATION

Modern askerî temalı, tek HTML tabanlı 6v6 CQC FPS oyun projesi.

> **Depo Public** — görünürlük kullanıcı kararıdır. Açık kaynak lisansı henüz seçilmedi; kamuya açık olması tek başına yeniden kullanım izni vermez.

## Başlangıç durumu

- `index.html`: **V24** — kullanıcıdan gelen son tam oyun HTML'inin **bayt düzeyinde değiştirilmemiş** kopyası.
- Oyunun iç ekranlarında hâlen eski çalışma adı `WAR ROCK: CQC MODERN — MARIEN` görünebilir. Marka ve arayüz yeniden adlandırması henüz yapılmadı.
- V17 ADS/nişan ve V21 drone temel oynanışı kullanıcı tarafından onaylanan referanslardır.
- V24 drone: her doğuşta 1 hak, sağ tıkla anında patlama, Space/C irtifa, 9.5 normal hız, vurulunca patlama.
- **V25 henüz uygulanmadı:** Takla yalnız Q/E; drone canı 55'ten 110'a çıkacak. Görev `prompts/V25_QE_TAKLA_DRONE_110HP.md` dosyasında.
- Gerçek 6v6 Chromium/WebGL kabul testleri tamamlanmadı; statik/sözdizimi testleri oynanış onayı değildir.

## Çalıştırma

`index.html` dosyasını masaüstü WebGL destekli tarayıcıda aç. Oyun Three.js ve Tailwind'i CDN'den yüklediği için internet bağlantısı gerekir. Bazı tarayıcılarda pointer lock için yerel sunucu gerekebilir.

## Depo yapısı

- `main`: Korunan **V24 ana sürümü**; onaysız oyun değişikliği yapılmaz.
- `references/`: 1A–4B eski modüllerin korunmuş tam HTML referansları. Ana oyuna otomatik uygulanmaz.
- `modules/`: İzole 3B/3C yama ve inceleme parçaları; referans amaçlıdır.
- `docs/`: Kararlar, görev akışı, kalite kontrol ve sürüm planı.
- `prompts/`: Gemini'ye verilen kesin geliştirme talimatları.
- `.github/`: PR / hata şablonları ve JS sözdizimi CI kontrolü.

## Sorumluluklar

**Gemini oyun kodunu geliştirir. ChatGPT** kaynakları korur, sürümleri denetler, sorunları sınıflandırır ve Gemini promptlarını hazırlar. Yeni oyun kodu ayrı branch + PR ile sunulur, kullanıcı onayı gelmeden `main` ile birleştirilmez.

**Kaynak denetimi:** V24 `index.html` SHA256: `9ac15cc468369a5d1828930986e4ddc0ad98cb7763b62aa07a807431771318a0`.

## Lisans

Henüz bir lisans ilan edilmedi. Üçüncü taraf CDN ve diğer içeriklerin kullanım koşulları yayın öncesinde ayrıca kontrol edilmelidir.
