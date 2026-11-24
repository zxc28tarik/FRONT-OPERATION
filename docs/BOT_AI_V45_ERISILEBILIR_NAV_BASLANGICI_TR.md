# FRONT OPERATION — V45: Erişilebilir A* Başlangıç Düğümü

**24 Kasım 2026**, temel `ai/v44-medic-walkable-support`, geliştirme dalı `ai/v45-reachable-nav-origin`.

## V43/V44 ölçümüyle ortaya çıkan hata

V44 stres çalışmasında `red_4` Ağır botunun `(-16.98, 0)` koordinatında, depo duvarının **dışında** olduğu hâlde `9` numaralı `(-24,0)` depo-içi düğümü A* başlangıcı seçildi. Tanılama `probeClear: false` gösterdi. Aradaki `x=-18` depo duvarı asker için geçilmez. Bu olay `TAKE_COVER`, `ADVANCE` ve `INVESTIGATE` davranışlarında aynı hedefi tekrar tekrar denemesine yol açmıştı; bir V44 koşusunda `red_4` için 64 kurtarma, düğüm 9 için 70 kaydedildi.

Sorun *kenar değil, aktörün A* grafiğine girişidir*: V42, grafiğin 16 geçersiz düğüm bağlantısını engellemişti ancak aktör başlangıçta duvarın karşı tarafındaki en yakın düğümü seçebiliyordu.

## V45 değişikliği

`findNearestNavNode(pos, verifyApproach=false)`:

- Varsayılan çağrılar eski en yakın düğüm davranışını **korur**; hedef/telemetri sorguları değişmez.
- A* **botun mevcut konumundan** oluşturuluyorsa `verifyApproach=true` kullanılır (oyun içindeki 11 aktör başlangıç çağrısı).
- Zemin katta (yükseklik ≤ 0,65 m) ilk adayın fiziksel geçişi aynı `isPositionWalkable` üzerinden **0,25 m** aralıklarla sınanır.
- İlk aday duvar arkasındaysa, fiziksel erişilebilir alternatiflerden en yakını seçilir; tüm adaylar kapalıysa eski adayla orijinal kurtarma mekanizması korunur.
- Üst kat/rampa başlangıçları eski yol seçim kurallarında bırakılır.

Bu yalnız A* rota başlangıç kararını iyileştirir; görsel mesafe/hitbox, bot hızları, silahlar, HUD veya zorluk kuralları değiştirilmedi.

## Koruma ve test

`tests/bot_ai_v45_regression.cjs` **21 yeni deterministik kontrol**: orijinal depo cephesi, gerçek duvar ölçüsü, açık taraftan 19 numaralı düğümün seçilmesi, depo içinden 9 numaralı düğümün korunması, alternatif yolun A* grafiğinde bulunması, zemin/üst kat ayrımı, V42/V43/V44 kurallarının korunması.

`scripts/check-best-components.mjs` koruma testi V22'nin `assignBotTacticalGoal` fonksiyonunda yalnızca **tek açıkça izin verilen** `findNearestNavNode(bot.pos)` → `findNearestNavNode(bot.pos,true)` değişikliğini kabul eder; diğer kod hâlâ birebir referansla karşılaştırılır.

## İlk gerçek motor stres testleri

Her biri gerçek Chromium altında **600 hızlandırılmış simüle oyun saniyesi**:

| GitHub çalıştırması | Kurtarma | Kırmızı Ağır bot (`red_4`) | Açıklama |
|---|---:|---:|---|
| [45372462626](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45372462626) | **50** | **2** | V45 başlangıç düzeltmesi |
| [45372484519](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45372484519) | **50** | **2** | Başka bağımsız koşu; 50/50 düğüm erişilebilir |

Her iki koşuda önceki `red_4` duvar dışı kilitlenmesi görünmüyor. Yine de bunlar rastgele testlerdir ve 10 dakika boyunca oyuncunun oynadığı/render edilen maç anlamına gelmez; daha çok tekrar ve insan oynanışı QA gerekir.

Önceki skorlar bağlam olarak: V40 754; V41 191; V42 54,56,149; V44 72,108. Test koşulları aynı rastgele tohuma sabitlenmediğinden yüzdeler kesin istatistiksel A/B bulgusu olarak sunulmaz.

`main` dalına kullanıcı izni olmadan birleştirme yapılmaz.
