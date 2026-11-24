# FRONT OPERATION — V46: Bot hedef, siper ve takım odağı tutarlılık ölçümü

**24 Kasım 2026** — Taban: `ai/v45-reachable-nav-origin`; dal: `ai/v46-target-cover-consistency`.

## Kapsam

V45 ile depo dışındaki Ağır botun duvar arkasında kalan en yakın A* düğümüne kilitlenmesi düzeltildi. İki V45 hızlandırılmış 600 saniyelik Chromium bot motoru testinde sıkışma kurtarma 50 ve 50 oldu.

V46 **yeni davranış veya yapay zeka zorluğu getirmez**; mevcut botların hedefi ne sıklıkla değiştirdiğini, sipere gidip orada ne kadar kaldığını, gerçekten yürüdüğü zamanı ve aynı görünen hedefe kaç askerin odaklandığını ölçer. Tüm veriler oyun belleğindedir; localhost QA dışındaki oyuncuların HUD'ı değişmez.

### Yeni test sayaçları

- **targetAcquisitions**: Görünür hedef yokken ilk kez görünür düşman edinme (null → enemy)
- **targetSwitches**: Hâlen görünen bir düşmandan diğerine geçiş (enemy A → enemy B)
- **targetLosses**: Görünen hedefi kaybetme (enemy → null)
- **coverApproachSeconds**: Her saniyelik örneklemde `coverPhase === MOVE_TO_COVER`
- **coverHoldSeconds**: `PEEK_FIRE` veya `CROUCH_HOLD` evresinde geçirilen bot-saniyeler
- **movingSeconds**: Botun mevcut X/Z hızının 0,75 birim/s üzerinde olduğu bot-saniyeler
- **meanLargestFocus**: Gözle görünür düşmana en çok odaklanan asker sayısının hedef görülen saniyeler üzerindeki takım ortalaması (hedef görülmeyen saniyeler paydadan çıkarılır)

Bu sayılar oyunculu gerçek maçtaki FPS, kararlılık ya da isabet dengesini tek başına açıklamaz.

### İlk 600 saniyelik gerçek bot motoru testi

[GitHub run #45373944211](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45373944211) PASS:

| Ölçüm | Sonuç |
|---|---:|
| Sıkışma kurtarma | **48** |
| Gerçek bot atışı | 1.979 |
| Gerçek isabet | 318 |
| Yeni görünür hedef edinme | 1.509 |
| Görünür hedefler arasında geçiş | **131** |
| Hedefi kaybetme | 1.456 |
| Sipere yaklaşma | **2.518 bot-saniye** |
| Siperde tutunma / ateş | **243 bot-saniye** |
| Gerçek yürüyüş | 5.051 bot-saniye |
| Görünür düşmanla meşgul zaman | 1.352 bot-saniye |
| Mavi takım, en yoğun ortak hedef | 1,24 ortalama asker |
| Kırmızı takım, en yoğun ortak hedef | 1,31 ortalama asker |
| Mavi takım, yakın mesafeli çift | 0,32 ortalama |
| Kırmızı takım, yakın mesafeli çift | 0,23 ortalama |

**Önemli bulgu:** Sipere yaklaşma süresi, siperde kalma süresinin yaklaşık **10,4 katı**. Bunun nedeni yalnız siperin ulaşılamaz olması olmayabilir; bot çok sık düşmanı kaybediyor, hareket halindeyken yeni sipere yöneliyor veya siper ihtiyacı çatışma sırasında iptal ediliyor olabilir. V47'de *siper seçme → sipere ulaşma → siperden ayrılma nedeni* olaylarını ayrı ölçmeden daha fazla siper davranışı değiştirilmemeli.

Bir diğer bulgu: 1.509 edinme / 1.456 kaybetme ve sadece 131 doğrudan hedef geçişi. Hedef kalıcılığı ve görüş çizgisi kararları için araştırılmaya değer, ancak görüşün fiziksel engelle kapanması gerçekçi olabilir; körlemesine hedef kilitleme süresi uzatılmamalı.

## Koruma ve test

- `tests/bot_ai_v46_regression.cjs`: **25 yeni deterministik kontrol**.
- V32–V45 testleri, V22 taktik fonksiyonu ve önceki onaylı V5–V25 görsel/silah referansları korunur.
- V35'in yalnız nişan süresini sınayan izole test ortamına V46 yeni sayaç fonksiyonu için *etkisiz mock* ve geçmiş hedef değişkeni eklendi; oyunun nişan fonksiyonu değiştirilmedi.
- `scripts/browser-webgl-smoke.mjs` yeni telemetri şeması `version:46` için güncellendi. Eski kaynak koruma testleri hâlâ sürüyor.
- `scripts/browser-bot-ai-stress.mjs` telemetri için invariant doğrular: her botta `sightings = acquisitions + switches`, siper veya hareket zamanı canlı süreden fazla olamaz.
- Kullanıcı kararı: **3 Normal + 2 Zor**, her 15. doğuşta 1 Uzman; herkes için **0,34 s nişan oturma** sabit.
- Asker çizimleri, ses, harita, silah hasarı, RPM, HUD ve drone değiştirilmedi.

**Sınırlama:** Bu test 600 saniye hızlandırılmış `updateBots` motor simülasyonudur; 10 dakikalık gerçek zamanlı/render edilmiş insan maçına karşılık gelmez. Sonuçlar farklı rastgele maç koşuları arasında birebir A/B değildir.

**Sonraki önerilen hedef:** V47 siper davranışı kararlılığı. Kısa sürede çok sayıda siper seçimini ve sipere varmadan terk etme nedenini ölçecek ayrı olaylar; ardından sadece doğrulanan nedene müdahale.

`main` dalına merge yapılmaz.
