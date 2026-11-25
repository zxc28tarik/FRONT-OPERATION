# V246 — Kask ve koruma ekipmanı revizyonu

Temel: `art/v245-anatomy-face-rebuild`. Bu paket yalnız üçüncü kişi karakter görselini değiştirir; AI, hitbox, silah istatistikleri, harita ve mod kuralları sabittir.

- Mevcut sınıf kask kabuğu ön/yan/arka konturda yeniden şekillendirildi; yalnız tessellation artırılmadı.
- Kask bandı, NVG yuvası, göz koruması, kulak koruması ve yan raylar aynı kafa pivotunda yeniden oturtuldu.
- Assault/Medic/Engineer/Sniper/Heavy için ekipman fit'i farklılaştırıldı; Heavy daha korumalı, Sniper daha kompakt baş silüeti kullanır.
- Yakın LOD için iki çene kayışı ve çene kupası eklendi; Heavy'de iki ek yan koruma parçası vardır. Bu grup orta/uzak LOD'da görünmez.
- Kask kabuğu tüm LOD'larda kalır ve V246 düşük detay geometrisine geçer. Kafa, el, namlu ve eklem pivotları değişmez.

Kabul testi 2 takım × 5 sınıf × 3 varyant = 30 modelde kask zarfı, sabit anchor'lar, mevcut koruma parçaları, yakın/orta/uzak LOD davranışı ve sınıf başına ek mesh bütçesini kontrol eder. Görsel kullanıcı kabulü ve gerçek donanım FPS ölçümü ayrıca gereklidir.
