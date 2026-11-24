# FRONT OPERATION — V44: Sıhhiye Botlarının Geçilebilir Yardım Rotaları

**24 Kasım 2026**  
Taban: `ai/v43-stuck-context-diagnostics`  
Dal: `ai/v44-medic-walkable-support`

## Sorun

V42 sonrası farklı 600 simüle saniyelik Chromium stres koşularında 54, 56 ve 149 tıkanma kurtarma olayı kaydedildi. En kötü koşuda `red_1` Sıhhiye botu 113 olaya sebep oldu.

V43 tanı kayıtları Sıhhiye davranışının neden bazen yanıltıcı olabildiğini gösterdi. Örnek: `red_1`, `SUPPORT_ALLY` durumundayken `(-2.09,-15.93)` konumundan `(6,-19.72)` hedefine yönlendi. Hedefe yaklaşık 8.93 m mesafe olmasına rağmen, hedefe doğru **ilk 8 metrelik fiziki güzergâh testi engelli** çıktı (`probeClear: false`). Bu hareket komutu canlı `moveTargetPos` üzerinden kaydedildi; eski 9 numaralı düğüm atfına dayanmıyor.

V43 öncesinde Sıhhiye botu yardım edeceği arkadaşını *görebildiğinde*, bunu doğrudan yürünebilir yol sayabiliyordu. Göz hizasındaki görüş doğrusu ile bedenin fiziksel geçişi aynı şey değildir.

## Kod düzeltmesi

`isBotDirectWalkingLineClear(from,to)` yalnızca aynı kat için, her 0,22 metrede `isPositionWalkable` ile asker bedenine uygun geçişi denetler.

Artık doğrudan yaralıya gidebilmek için **hem** `hasLineOfSight(medicEye,allyEye)` **hem** `isBotDirectWalkingLineClear(bot.pos,injuredAlly.pos)` true olmalı. Kapalı yol durumunda önceki A* yol bulma/sıhhiye destek düzeni aynen kullanılır. Kısa mesafede medkit kullanma koşulu da yalnızca gerçekten erişilebilir hedefe bağlı kalır.

Bu, Sıhhiye hedef seçimini, tedavi değerlerini, cooldown'ları veya takımların koordinasyonunu değiştirmez. Diğer bot sınıflarının hareket kararı aynı kalır.

## Doğrulama

- `tests/bot_ai_v44_regression.cjs`: 18 yeni deterministik kontrol; iki yönlü engel tespiti, açık yoldan geçiş, farklı katta doğrudan yürüyüş reddi, hedef uç noktası, canlı yardım akışı, önceki davranış ve nişan sabitleri.
- V32–V43 regresyonları korunur.
- Gerçek Chromium/WebGL 6v6 kabulü ve 600 simüle saniyelik bot motoru stres testi GitHub CI'a bağlandı.
- V43 bağlam tanılama sistemi sürüyor, böylece iyileşme tekrar sınanabilir.
- Oyuncu HUD'ı, grafik, silah hasar/RPM, 6v6, beş sınıf, zorluk döngüsü ve 0.34 sn orta nişan sabit.

**Doğrulama sınırı:** farklı rastgele bot maçlarından çıkan tek bir koşu yüzdesi genel iyileşme garantisi değildir. Sonuçların değişkenliğine dikkat edilmelidir.

Ana dal `main` kullanıcı onayı olmadan değiştirilmez.
