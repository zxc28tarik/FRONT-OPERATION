# FRONT OPERATION — Milis FO_MILIS02/03 görünüm ve kalite kabul kaydı

Tarih: 27 Kasım 2026. PR: https://github.com/zxc28tarik/FRONT-OPERATION/pull/69  
Geliştirme dalı: `art/fo-milis02-outfit-refinement`  
Taban: `art/v292-crouch-transition`. **Main'e merge yapılmadı.**

## Kapsam

- Kırmızı takımda orijinal V25/V106 insan kafası, silah pivotları, mevcut sınıf silahı ve animasyon rig korunur.
- İki sivile yakın milis kumaş paleti: koyu gri/füme ceket ve toprak tonlu iş kıyafeti; üç başlık/yüz varyasyonu.
- Ağır askerî kask ve yelek görselde saklanır; fizik, isabet alanı, nişan, saldırı, karar, takım, görev ve bot rota kodu değişmez.
- FO_MILIS03 düz renkli kumaşı, **tek kez oluşturulan ve bütün milisler arasında paylaşılan** üç adet 64×64 veri dokusu ile değiştirir (renk mikro-dokusu, kabartma hissi, pürüzlülük). Yeni dinamik gölge yok.
- V163 gövde üzerindeki mevcut gölgeli köşe/temas renkleri `vertexColors` materyal varyantıyla korunur.
- Mevcut uzaklık seviyelerinde küçük yüz ve dikiş detayları kapatılır, kask tekrar açılmaz.

## Kod ve test

- Oyun kodu farkı yalnız `index.html` içindeki `FO_MILIS02_BEGIN/END` sunum bloğunda ve ilgili mevcut çağrı adındadır.
- `scripts/check-soldier-scene.mjs` orijinal 10 sınıf/takım iskeleti, namlu pivotu ve milis/asker ayrımını sınar.
- `scripts/check-soldier-real-geometry.mjs` gerçek Three.js geometrileri, ekipman, animasyon, yüz, 2 kumaş, 3 başlık, LOD, malzeme haritaları ve gövde köşe gölgelerini sınar.
- `scripts/browser-milis02-visual.mjs` izole Chromium/WebGL koşulunda 5 sınıf × 3 görünümü, farklı kameraları ve 5/15 karakter sahnelerini çizer. Ekran görüntüleri ve rapor GitHub Actions arşivinde tutulur.
- `scripts/browser-v316-class-equipment.mjs` mevcut sınıf-ekipman/kontrol davranışlarını korumayı sınar; güncel üst taban ile milis dışı **birebir kaynak eşitliği** ayrı olarak doğrulanır.

## Başarılı sonuç (V3 kumaş + gövde gölgelendirmesi)

WebGL çalışması: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/46013899376  
Sonuç: **PASS**, 15 karakter/varyasyon denetimi, 15 gerçek Chromium görüntüsü, gerçek Three.js/LOD kontrolü.

| İzole sabit kamera | Görünen mesh | Çizim çağrısı | Üçgen |
| --- | ---: | ---: | ---: |
| Asker, 5 model | 680 | 681 | 207.144 |
| Milis, 5 model | 505 | 506 | 151.932 |
| Asker, 15 model | 2.040 | 2.041 | 621.428 |
| Milis, 15 model | 1.516 | 1.517 | 456.342 |

Bu ölçümler *gerçek oyunun FPS'si değildir*. Takım donanımları da farklı olduğu için doğrudan eşit model karşılaştırması sayılmaz. Kare süreleri, düşük donanım ve gerçek maç FPS'i ayrıca ölçülmelidir. Oluşturulmuş görsellerin sanat yönetimi açısından yakın plan insan kontrolü henüz tamamlanmamıştır.

## Açık işler

- 5 sınıfın ek yakın plan yüz görüntülerinin QA koşusuyla tamamlanması.
- PC ve mobil hedef cihazlarda gerçek maç kare süreleri ve kalite incelemesi.
- GitHub PR #69 taslak durumda; test sonucu ve kullanıcı kabulü olmadan ana dala birleştirme yapılmaz.
