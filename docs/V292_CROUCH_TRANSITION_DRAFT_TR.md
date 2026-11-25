# C5 / V292 — Çömelme ve ayağa kalkma (izole aday)

Temel: C4 aday commit 39e84880d48c6d5eb44c164863a020a5bb8ac1b2, PR #67. C4 PR syntax run 45711997294 kontrol anında sürüyordu; WebGL sonucu ve önceki V287/C1–C3 kabulü doğrulanamadı. Bu nedenle C5 canlı oyuna bağlanmadı.

- Mevcut çömelme değerinden türetilen 16*c²*(1-c)² geçiş zarfı. Her iki uçta değer ve eğim sıfır, mevcut ayakta/çömelmiş uç pozlar korunur.
- Yalnız yerel kalça, diz ve yan açıklık açılarına sınırlı düzeltme. Hareket hızına ve sınıf ağırlığına göre ölçeklenir. Fiziksel crouchAmt, root, hitbox, görüş, silah, RNG ve AI değişmez.
- scripts/check-v292-crouch-transition-draft.mjs: gerçek C4 gait ve mevcut botVisualLegContact fonksiyonu ile 118.080 poz, 947.520 sayısal doğrulama başarılı. 5 sınıf, 6 hız, 6 yön, 16 faz, 41 çömelme örneği; sonlu açı, diz, açıklık, uç poz eşitliği, süreklilik ve ayak temas çözümünün sınırları.
- En büyük ek yerel açı 0.14 rad; ayak temas çözümündeki en büyük açı farkı 0.134657 rad. Bunlar gerçek ayak kayması/çarpışma veya görsel kalite ölçümü değildir.
- C5 durum: aday kodlandı ve sayısal test edildi, entegrasyon ve gerçek tarayıcı kabulü bekliyor. Ana dal ve index.html değişmedi. Önceki aşamaların kabulü atlanmayacak.
