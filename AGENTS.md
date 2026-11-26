# FRONT OPERATION — Zorunlu proje çalışma kuralları

Proje sahibi 26 Kasım 2026'da açıkça "Botları geliştirmeye izin veriyorum." dedi. **BOT-KISS planı (BOT01–07) kapsamındaki bot geliştirmeleri artık yetkilidir.** Önceki AI kilidi yalnız bu onaylı plan kapsamında kaldırılmıştır; plan dışı denge/AI değişiklikleri izinli değildir.

- BOT-KISS sırasına uy: az düşün, kararlı ve agresif hareket, harita/sınıf/göreve uygun davranış, gereksiz kararları azalt. V344 sabit referans, aynı koşullu A/B karşılaştırması. Gerçek LOS/dost ateş hattı, fizik, mühimmat, hasar/RPM, 0.34 s orta nişan oturma hızı, zorluk dağılımı ve görev kuralları korunur. Plan dışı değişiklik yapma. Gerileyen aday kabul edilmez.
- Her görevde [docs/DEVELOPMENT_ROADMAP_TR.md](docs/DEVELOPMENT_ROADMAP_TR.md) dosyasını oku, sıradaki tamamlanmamış aşamadan ilerle, sırayı keyfi değiştirme. Aşamaların durumunu ve test kanıtını belgeleyip kaydet.
- Onaylı karakter/silah/harita, kontrol, menü ve HUD bileşenlerini koru. KISS menü/HUD; yüksek kaliteli fakat düşük maliyetli görseller. Oyun mekaniği, denge ve AI üzerinde plan dışı değişiklik yok.
- Kod tamamlandı ile test kabulünü ayır; başarısız testleri saklama veya gevşetme. Gerçek FPS ölçülmeden performans garantisi verme.
- Son geliştirme tabanından ilerle, ana dala test edilmemiş oyun kodu birleştirme.
- Yalnız kullanıcının açık yeni talimatı bu kuralları veya yol haritası sırasını değiştirebilir.
