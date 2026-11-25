# V292 — C5 çömelme geçişi

Temel: C4 düzeltilmiş commit 046cc2d3493246569469f8e08496690ef1c25f04. C4 statik CI 45712232088 başarılı; WebGL ve önceki V287/C1–C3 kabulü açık. Kullanıcının devam talebiyle yalnız aday dalda entegrasyon yapıldı.

- 16*c²*(1-c)² zarfı mevcut uç pozları ve uç eğimlerini korur. Hareket ve duruş için kalça/diz/yan açıklık hedeflerine sınırlı düzeltme, sınıf ağırlığına göre ölçeklenir. Fiziksel crouchAmt, kök konumu, hitbox, görüş, silah, zamanlama, RNG, AI ve menü değişmedi. Yeni mesh/doku yok.
- Doğrudan yürütülen test: 118.080 poz, 947.520 sayısal kontrol, 118.080 prototip eşitliği, inline JavaScript syntax başarılı. En yüksek düzeltme 0.14 rad, ayak temas çözümü farkı 0.134657 rad. On bir açık kaynak değişikliği geri alınarak HTML'nin kalanının V291 ile birebir aynı olduğu doğrulandı.
- scripts/check-v292-crouch-transition.mjs entegre fonksiyonun sayısal doğrulaması; scripts/browser-v292-crouch-transition.mjs 50 eş kamera poz karşılaştırması. Bunlar henüz gerçek tarayıcı kabulü/FPS ölçümü değildir.
- Durum: kodlandı, sayısal kabul başarılı; gerçek WebGL ve önceki kabul kapıları açık. Ana dala birleştirme yok.
