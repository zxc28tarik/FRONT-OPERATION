# FRONT OPERATION — V41: Üs Geçiş Rotaları ve Fiziksel Çarpışma Düzeltmesi

**Tarih:** 23 Kasım 2026  
**Başlangıç:** `ai/v40-bot-telemetry-balance`  
**Geliştirme:** `ai/v41-gate-navigation-fix`  
**PR:** https://github.com/zxc28tarik/FRONT-OPERATION/pull/3

## V40 teşhisi

İkinci bağımsız 600 **simüle saniyelik** bot motoru stresinde toplam 754 sıkışma kurtarma görüldü. Bunların 264'ü 39 numaralı kırmızı üs kapısı ve 259'u 3 numaralı mavi üs kapısı düğümünde gerçekleşti (523/754, yaklaşık %69,4).

Bu iki nokta yalnızca taktik açısından dar değildi: **yol noktaları fiziksel bariyerin içindeydi**. V40 navigasyon düğümleri `(0,0,+45)` ve `(0,0,-45)` konumundaydı. Gerçek oyun haritasında z=+44,5 ve -44,5'te orta bariyerler `6,5 x 1,3 x 1,2 m` olarak oluşturulmuştu. Bu iki nokta A* grafiğinde var ama `resolveHorizontalCollision` açısından erişilemezdi. Ek olarak üs yan duvarları z=±42'de geçişleri kısıtlıyordu.

## V41 çözümü

- Düğüm **3** mavi üste batı yan geçidine `(-26, 0, +44)` konumuna taşındı; etiketi `blue_west_exit`.
- Düğüm **39** kırmızı üste batı yan geçidine `(-26, 0, -44)` konumuna taşındı; etiketi `red_west_exit`.
- Yandaki katı üssü delen `3–15` ve `25–39` kenarları çıkarıldı.
- Yeni **3–4** ve **13–39** kenarları açık batı yolu üzerinden bağlandı.
- 50 mevcut navigasyon düğümü korundu; diğer rota kenarları, çarpışma geometrisi, tüm görsel modeller, silah ve takım kuralları değiştirilmedi.

## Testler

`tests/bot_ai_v41_regression.cjs` ile **82 deterministik kontrol**:

- Eski altı üs duvarı/bariyer `addSolidBox` geometrilerinden doğrulanır.
- Bot yatay çarpışma yarıçapı 0,42 metre kabul edilir.
- Yeni çıkış noktaları ve bağlantı segmentleri 0,2 m aralıklarla örneklenerek fiziksel bariyerleri kesmedikleri doğrulanır.
- Her iki takımın üçer doğuş noktasından orta alandaki üçer hedefe geçerli A* yolu aranır.
- Engellenen 3 veya 39 nolu düğümde alternatif yolların bulunabildiği doğrulanır.
- V40 telemetri, 3 Normal + 2 Zor, her 15 doğuşta Uzman ve 0,34 sn nişan korunur.

Başlangıçtaki 82/82 kontrol yerel JavaScript değerlendirme motorunda başarılı; GitHub CI `check.yml` içine V41 testi de eklendi. CI sonucu koşu sayfalarında ayrıca izlenir.

## Gerçek tarayıcı ve 600s sınırları

- `browser-webgl.yml` 6v6 Chromium/WebGL oyunu, asker modellerini ve oynanışı sınar.
- `bot-ai-stress.yml` gerçekten `updateBots()`, `droneSystem.update()` ve `updateEntitiesAndFX()` işlevlerini 600 simüle oyun saniyesi ilerletir.
- Bu test **600 saniye boyunca gerçek zamanlı, aktif oyunculu/render edilen maç** değildir.
- Rastgele bot sınıfları, taktik seçimleri ve hedefler nedeniyle tek koşu V40 karşısında istatistiksel denge garantisi vermez; sonuçlar koşu bağlantısı ve sayılarla ayrıca belirtilmelidir.

## Koruma kuralları

**Değiştirilmeyenler:** KISS HUD/menü, V5–V25 onaylı asker/silah görselleri, hasar/RPM, 6v6, beş sınıf, bot zorluk döngüsü, 0,34s nişan, drone, V32–V40 davranış ve telemetri. `main` dalına birleştirme yapılmaz.
