# FRONT OPERATION — V47: Siper Kararı Sürekliliği, Gerçek Ulaşma Ölçümü ve Kontrollü Karşılaştırma

**24 Kasım 2026**. Taban: `ai/v46-target-cover-consistency`. Dal: `ai/v47-cover-lifecycle-reliability`.

## Amaç ve V46'dan gelen gerekçe

V46 hızlandırılmış 600 simülasyon saniyesi testinde 2.518 bot-saniye `MOVE_TO_COVER` yaklaşma, yalnız 243 bot-saniye siper tutma zamanı görüldü. Bu zamanlar botların gerçek siper seçme/ulaşma oranını tek başına göstermiyordu. V47 bunu olay düzeyinde ölçüp gereksiz yeniden karar verme davranışını düzeltiyor.

## Uygulanan üç iyileştirme

**1. Gerçek siper yaşam döngüsü ölçümü (oynanışı değiştirmeyen kayıt).** `observeBotCoverLifecycle` aşağıdaki olayları izler:

- `coverAssignments`: seçilen yeni siper
- `coverArrivals`: gerçek bot pozisyonu A* siper düğümüne 1,45 metreden yakın
- `coverAbandons`: önceki sipere varmadan hedefi terk etme
- `coverReassignments`: doğrudan başka siper düğümüne geçiş
- `coverStalledApproaches`: sipere yönelik mesafe 6 saniye anlamlı azalmadı
- `coverOrphanSeconds`: `MOVE_TO_COVER` evresi var ama geçerli siper düğümü/audit yok
- `coverAbandonReasons`: görev değişikliği, yeniden seçim, kanat, ölüm, yakın çatışma ve diğerleri.

Kayıt yalnız RAM'de; en son **90 olay** korunur, localhost QA dışında HUD veya haricî iletişim yoktur. Ölçüm bot doğuşu/ölüm, drone kontrolü, hareket güncellemesi gibi erken-çıkış dallarını kapsar.

**2. İlerleyen siper yaklaşmasının kararlı tutulması.** `shouldKeepApproachingCover` ile botun yakın zamanda anlamlı mesafe kapattığı, tehlikenin en az 9 metre uzakta bulunduğu ve ilk yaklaşmanın tahminî süresi dolmadığı durumda siper değiştirme girişimi geçici olarak ertelenir. Koruma **3,4–6,2 simülasyon saniyesi** ve **son 2,25 saniyede ilerleme** şartlarıyla sınırlıdır. Yakın düşman, ilerleme kaybı veya süre sonu, mevcut A* siper yenileme yolunu derhal serbest bırakır. Mevcut 2,6 s temel cover commitment, silah ve hasar kuralları değiştirilmedi.

**3. Yeni hedef edinildiğinde güvenli siperin korunması.** Eski kod her yeni görünür hedefte mevcut siper düğümünü koşulsuz sıfırlıyordu. `isCoverSafeForNewVisibleTarget`, yalnız yeni düşmanın **siper düğümündeki çömelmiş askeri fiziksel olarak görememesi** ve düşmanın en az 9 m uzak olması hâlinde mevcut siperi korur. `MOVE_TO_COVER` durumu için, son **2,25 s ilerleme kaybı** veya **6,2 s yaklaşma süresi** üzerindeyse siper tekrar seçilebilir. Yakın düşman, açığa çıkan siper, hatalı veri ya da düğüm durumunda eski güvenli sıfırlama ve yeni siper seçimi uygulanır. Hedef değişince **0,34 s nişan oturma** ve tepki sayaçlarının sıfırlanması korunur.

## Kanıt: İlk siper yaşam döngüsü testi

[Günlük #45375970991](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45375970991) — 600 simüle saniye, sadece tanılama: **1.224 seçim, 444 gerçek ulaşma, 774 yarıda bırakma**. Terk etme nedenlerinde yeniden seçim 430, rol değişikliği 221, kanat 77, ölüm 36. Bu sayılar, V46'daki uzun yaklaşma süresinin rastgele görsel gösterim değil, gerçek rota kararsızlığıyla ilişkili olduğunu destekliyor.

## Aynı tohumlu kontrollü karşılaştırma altyapısı

Testte eski sürüm olarak V47'nin *tanılama içeren ama karar düzeltmesi olmayan* `ccdcea335908b060506fb2aa4d8f5e58adf0678d:index.html` anlık kaydı kullanılır. Yeni aday aynı telemetri ile V47'nin siper karar değişikliklerini uygular. Aynı `471001`, `471002`, `471003` tohumları, aynı Chromium stres harness'ı ve her eşleşmede 600 simüle oyun saniyesi kullanılır. Oyun içinde rastgeleliği değiştiren kod yoktur; tohum yalnız Playwright test ortamına enjekte edilir.

İlk eşleştirilmiş varyantta ([A/B çalışma #45377036045](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45377036045)):

| Ölçüm (3 x 600 simüle saniye) | Önce | İlk V47 koruma adayı |
|---|---:|---:|
| Siper seçimi | 4.147 | 2.178 |
| Gerçek siper ulaşımı | 1.555 | 1.063 |
| Yarıda bırakılan siper | 2.589 | 1.111 |
| Doğrudan siper yeniden atama | 1.918 | 372 |
| Uzun süre ilerlemeden yaklaşma | 65 | 108 |
| Yaklaşma bot-saniye | 8.081 | 6.104 |
| Siperde kalma bot-saniye | 698 | 556 |
| Sıkışma kurtarma | 109 | 101 |

Yarıda bırakmalar **yaklaşık %57** ve yeniden atamalar **yaklaşık %81** azaldı; fakat gerçekleşen varışlar ve siper tutma süresi de azaldı, ilerlemeden yaklaşma sayısı arttı. Bunlar kritik **karşılaştırma sınırlamalarıdır**; yalnız daha az siper değişiminin her bakımdan daha iyi AI olduğunu ileri sürmemek gerekir.

Bu sonuca dayanarak **ilerlemesi durmuş yaklaşma** hâlinde yeni hedef üzerinden siper kararının yeniden değerlendirilmesini ekledik. Bu son güvenlik şartının A/B testleri aynı üç tohumla tekrar edilir.

## Koruma ve testler

- V32–V46 önceki bot regresyonları korunur.
- `tests/bot_ai_v47_regression.cjs`: **28** yaşam döngüsü testi.
- `tests/bot_ai_v47_cover_commit_regression.cjs`: **21** siper ilerleme/tehlike kaçış testi.
- `tests/bot_ai_v47_target_cover_regression.cjs`: **24** yeni hedefte güvenli siper koruma/ilerleme sınırı testi.
- Toplam **583/583 bot regresyon kontrolü** hedefi ve ayrıca 12 kaynak-koruma kontrolü; CI başarılı sonuçlarıyla doğrulanır.
- V32 ve V34 izole testlerine yalnız dış çağrıların etkisiz mock/kontrol saati eklendi; gerçek oyunun ses, nişan, siper geometrisi ve haritaları değiştirilmedi.
- Onaylı 5 sınıf, **3 Normal + 2 Zor / 15 doğuşta 1 Uzman**, ortak **0,34 s nişan**, silah RPM/hasar, 6v6, HUD/KISS, drone, V25/V11 asker modelleri ve V42–V45 navigasyon korunur.

**Sınır:** 600 saniyelik hızlandırılmış *gerçek bot mantığı* Chromium motor testidir. 10 dakika canlı oynanan/render edilen, gerçek oyunculu performans/denge testi değildir. Aynı tohum, kararların değişmesiyle ileride random tüketim dizisinin farklılaşmasını tümüyle engellemez; çoklu koşu karşılaştırması da insan oynanışı doğrulamasının yerine geçmez.

**Merge politikası:** `main` kullanıcı onayı olmadan değişmez. V47, V46'ya hedeflenen taslak PR olarak saklanır.


## Son V47 kodu — aynı 3 tohumda yeniden ölçüm

Son V47 kodunu (güvenli siper koruma + ilerlemesi duran yaklaşmada tekrar değerlendirme) içeren [GitHub run #45377724934](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45377724934) **PASS** verdi.

| Ölçüm — 3 × 600 simüle saniye | Tanılama-only kontrol | Son V47 |
|---|---:|---:|
| Siper seçimi | 3.947 | **3.030** |
| Gerçek siper ulaşımı | 1.551 | 1.329 |
| Ulaşmadan terk | 2.389 | **1.689** |
| Doğrudan siper yeniden atama | 1.591 | **832** |
| Yeni görünür hedefte güvenli siper koruma | 0 | **1.277** |
| Yaklaşırken uzun süre ilerleyememe | 59 | **91** |
| Sipere yaklaşma bot-saniyeleri | 7.743 | 7.262 |
| Siper tutma bot-saniyeleri | 700 | **883** |
| Sıkışma kurtarma | 137 | **96** |
| Atış | 6.407 | 7.087 |
| İsabet | 944 | 1.054 |

Son V47 ile *sipere ulaşmadan terk* yaklaşık **%29,3**, *doğrudan siper değiştirme* **%47,7**, *sıkışma kurtarma* **%29,9** azalırken *siperde kalma zamanı* **%26,1** arttı. Ulaşma sayısı 1.551'den 1.329'a düştü; fakat seçime göre ulaşma oranı yaklaşık **%39,3'ten %43,9'a** yükseldi. Yaklaşmada uzun süre ilerleyememe ise **59'dan 91'e arttı**: V48'de doğrudan takip edilmesi gereken açık regresyon riskidir.

Bu üç eşleştirme aynı rastgele başlangıç tohumlarını kullanır fakat gerçek tarayıcıdaki olay/animasyon sıralaması ve farklı AI kararları RNG akışını ayrıştırabildiğinden kusursuz istatistiksel A/B değildir. İyileşmenin yönü güven verici; bütün siper ve bot davranışlarının tamamlandığı sonucu çıkarılmamalıdır.

Kritik bağlantılar: [Güncel V47 karşılaştırması](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45377724934) · [PR #9](https://github.com/zxc28tarik/FRONT-OPERATION/pull/9).
