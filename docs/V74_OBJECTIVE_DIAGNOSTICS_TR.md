# V74 — Geniş kalite sonuçları ve görev teşhisi
## V72: teknik kabul tamamlandı (45446575492 / 45446575268)
60 maç, 5 sürüm, 6 tohum, iki harita. Genel CI ve gerçek WebGL/arayüz, bomba smoke ve karakter görsel testleri PASS. Pasif insan slotu, hızlandırılmış oyun zamanı; insan oynanış kabulü değil.
| Marien | V53 | V65 | V70 | V71E | V72 |
|---|---:|---:|---:|---:|---:|
| Sıkışma | 238 | 126 | 110 | 139 | 112 |
| Hedef değiştirme | 712 | 517 | 608 | 430 | 476 |
| İsabet | .1294 | .1108 | .1069 | .1080 | .1002 |
| Yakın çift | .2108 | .2300 | .2242 | .2408 | .2483 |
| Siper varış | .6472 | .6191 | .6470 | .6336 | .6312 |
| Tersane kurulum | 1/6 | 6/6 | 6/6 | 5/6 | 5/6 |
| Tersane sıkışma | 2 | 4 | 9 | 1 | 1 |
| Tersane yakın çift | .7825 | .0383 | .0533 | .0283 | .0283 |
V72'nin Marien navigasyonu geçici kabul: yeni 3 tohumda 50 sıkışma, V71E 69, V70 54. V72 bütün tohumlarda V70 ile yakın, V71E'den daha az sıkışma. Buna rağmen V70'e göre kümelenme artışı, V53/V65'e göre isabet gerilemesi ve V65/V70'e göre eksik doğal kurulum açık. V72 nihai sürüm değil.
## Teşhis edilen 831047
V72 B operatörü blue_3 yaklaşık 60–135 simülasyon saniyelerinde aynı konumda ENGAGE, görünür hedef var; 150s civarında bölgeye ulaşmış fakat süre dolmuş. Mevcut rapor nedeni ayırt edemiyor. Mühimmat, ateş kapısı, hedef veya görev kararı neden olabilir; henüz kök neden iddiası yok.
## V74 (yalnız QA)
V73 üzerinde 3 yeni tohum için 1 saniye aralıklı sınıf/rol/görev ve envanter, nişan/tepki sayacı, ateş bekleme, mevcut davranış, hareket ve rota örnekleri alınır. Hiçbir karar fonksiyonu tekrar çağrılmaz; oyun kodu, RNG ve dt değişmez. Tanı kayıtları yalnız test çıktısında, normal oyun HUD'ında yok. Bütün canlı botlar örneklenir; envanter ve sonlu sayı sınırları doğrulanır. Sonuçlar oluşmadan davranış düzeltmesi kabul edilmez. V73 genel CI PASS; V73 eşlenik test ve V74 teşhis ayrı doğrulanır. Ana dal değiştirilmez.
