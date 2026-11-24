# FRONT OPERATION — V48: Gerçek A* Siper İlerlemesi ve Güvenli Alternatif

**24 Kasım 2026** — temel `ai/v47-cover-lifecycle-reliability`, yeni dal `ai/v48-cover-route-recovery`.

## V47'den doğrulanan sorun

V47 son 3×600 simüle saniyelik eşleştirilmiş testte siper seçim kararsızlığını belirgin azalttı. Ancak `coverStalledApproaches` eski 59'dan 91'e arttı. Kaynak incelemesi iki nedeni ayırıyor:

- V47'nin siper ilerleme günlüğü, botun **sipere kuş uçuşu** mesafesini kullanıyordu. Duvar çevresindeki doğru A* manevrasında bu mesafe artabildiği için yanlış `no_progress` teşhisi mümkündü.
- Geçerli bir siper hedefine A* mesafesi boyunca gerçekten ilerleyemeyen bot mevcut sıkışma kurtarma döngüsüne fazlaca bağımlıydı. Her kurtarmada aynı siper amacı tekrar seçilebiliyordu.

## V48'in uygulanan işlevleri

**Rota uzaklığını hesaplama:** `getBotCoverRemainingDistance(bot,node)`, mevcut yolun hedef siper düğümüne ait olması şartıyla botun bir sonraki A* waypoint'e kalan uzaklığını ve sonraki kenarların gerçek uzunluklarını birleştirir. Geçerli siper rotası yoksa önceki mesafe ölçümüne düşer. Siperin varış koşulu aynı fiziksel mesafeyi kullanır: botun siper düğümüne **1,45 m** içinde ulaşması.

**Gerçekten duraksayan botun kurtarılması:** `recoverBotStalledCover`, aynı siper için son **4,2 simüle saniyedir** anlamlı A* rota ilerlemesi olmayan ve ayrıca **en az bir gerçek fiziksel sıkışma tespiti** bulunan botu gözden geçirir. Ancak botun canlı olması, gerçekten görünür bir düşmanı bulunması, siper yaklaşma evresinde olması ve bir kanat komutunu izlemiyor olması gerekir. Süre sınırı ve kurtarma soğuması tekrar tekrar rota değiştirmeyi önler.

**Alternatif siperin güvenlik filtresi:** `selectAlternativeReachableCover`, sorunlu siper düğümünü dışlar. Adayın çömelmiş asker için gerçek fiziksel görüş engeli sunmasını, sınıfın kat/yükseklik sınırını, kısa/orta mesafesini, V45 ile yürünebilir başlangıç düğümünü ve V42 doğrulanmış A* yolu şart koşar. Çok büyük duvar dolanma yolları elenir. En fazla 50 nav düğümü taranır. Uygun alternatif bulursa bot mevcut A* rotasını değiştirir; bulamazsa kapalı siperi bırakıp mevcut çatışma hareketine döner. Duvarın içinden hareket veya görünmeyen düşmana atış uygulanmaz.

**V20 koruması:** Önceden onaylanmış `findBestCoverNode` fonksiyonunun gövdesi ve imzası değiştirilmedi. Acil kurtarma ayrı fonksiyonda tutuldu. Silah hasarı, ses, karakter çizimi, takım görevleri, drone, HUD, nişan ve zorluk profili değiştirilmedi.

**Yeni QA sayaçları:** `coverRouteRejected`, `coverAlternativeSelected`, `coverStallReroutes`, `coverStallFallbacks` önceki telemetriye eklendi. Ekrana gösterilmez; localhost test raporuna dahildir.

## Test kapsamı

- `tests/bot_ai_v48_regression.cjs`: 28 deterministik kontrol: duvar çevresinde kuş uçuşu uzaklığın artmasına rağmen A* ilerleme ölçülmesi; gerçek yaklaşma; başka düğüme A* yol doğrulaması; görünür düşman ve kanat emri güvenlik kapıları; alternatif yoksa normal çatışmaya dönme; cooldown; onaylı V20 seçici imzası.
- V32–V47: **583 önceki kontrol**, toplam **611** bot regresyonu.
- `scripts/check-best-components.mjs`: 12 onaylı bileşen için kesin kaynak eşleştirmeleri.
- Gerçek Chromium/WebGL 6v6 oyuna giriş kabulü.
- `scripts/browser-bot-ai-stress.mjs` ve `scripts/compare-bot-cover-stress.mjs` kullanılarak **471001, 471002, 471003** aynı başlangıç tohumlarında V47 bazına karşı V48 adayı koşulur. Kontrol commit'i `5356db87317340a02e88ef65db7ee6c73e7581a8`'dir. Karşılaştırma ayrı tarayıcı oturumlarında gerçek `updateBots` ile simüle saniyeyi çalıştırır.

## Korunan kullanıcı kararları

3 Normal + 2 Zor bot, her 15. doğuşta Normal yerine 1 Uzman; tüm botlarda 0,34 saniyelik orta nişan oturma; 5 asker sınıfı, 6v6, onaylı V25/V11 görseller, silah hasar ve RPM, drone, minimal KISS HUD ve V22 takım taktikleri korunur.

**Limit:** 600 simülasyon saniyelik hızlandırılmış bot motor testi, 600 saniyelik gerçek zamanlı/render edilmiş insan oyunu değildir. Aynı tohumlarda AI kararlarının ayrışması rastgele çağrı sırasını değiştirebildiğinden tüm sonuçlar birebir deterministik maç eşleşmesi değildir. Karar kalitesi için hem sıkışma hem gerçek siper varış/tutma hem atış ölçümleri birlikte okunmalıdır. `main` dalına kullanıcı onayı olmadan merge yapılmaz.


## İlk A/B denemesinden sonra uygulanan güvenlik sıkılaştırması

İlk V48 acil kurtarma eşiği yalnız 3,6 saniyelik rota ilerleme kaybına dayanıyordu. [İlk A/B #45380250159](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45380250159) PASS ile bot motorunun doğru çalıştığını fakat oyun davranışı açısından olumsuz tabloyu doğruladı:

| Ölçüm — 3 × 600 saniye | V47 | İlk V48 |
|---|---:|---:|
| 6 saniye ilerlemeden yaklaşma | 99 | **31** |
| Sıkışma kurtarma | 97 | **117** |
| Sipere ulaşma | 1.330 | **1.203** |
| Siperde kalma bot-saniyesi | 889 | **741** |
| Siper acil reroute | 0 | 154 |

**Bu ilk ayar reddedildi:** İlerlemeden yaklaşma sayısını azaltırken gereğinden fazla acil rota değiştirme oluşturmuş, çarpışma kurtarma ve siperde kalma değerlerini kötüleştirmiştir.

Son kodda acil rota değiştirmek için aynı siper rotasında **en az 4,2 saniyedir rota ilerlemesi olmaması VE mevcut fiziksel sıkışma sayacının en az 1 olması** şartı getirildi. Alternatif hedefler, ayrıca keskin yakın mesafe sınırına (çoğu sınıf için **18 m**, sniper için **24 m**) ve azami **32 m A*** yol mesafesine tabidir. Böylece siperin etrafında taktik hareket eden bot yerine gerçekten fiziksel olarak takılan bot için kurtarma çalışır. Karşılaştırma bu yeni ayarla tekrarlanır.

**Önemli:** Sayılardaki erken iyileşme iddiası son ayara aktarılmaz; doğrulama son sürümün kendi A/B testlerinden alınmalıdır.


## V48 son revizyon: karar saati ve rota teşhisi ayrıldı

İkinci A/B koşusunda ([#45380759895](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45380759895)), iki fiziksel takılma + 5,4 saniyelik sıkı koşul altında **hiç kurtarma tetiklenmedi**; buna rağmen davranıştaki küçük farklar ve çatışma etkinliği kaybı sürdü. İncelemede sorun, yeni rota-ilerleme zamanının V47'nin asıl siper-tutma kararındaki `lastProgressAt` saatiyle **aynı değişkeni paylaşması** olarak belirlendi.

Bu nedenle son kaynak kodunda:

- `bestDistance` ve `lastProgressAt` **V47'nin eski kuş uçuşu karar saati** olarak korunur. Bu, daha önce onaylanan siper-tutma ve hedef değiştirme temposunu muhafaza eder.
- `routeBestDistance` ve `routeLastProgressAt` **yeni A* gerçekte kalan yol ölçümü** olarak ayrıca saklanır. `no_progress` tanısı ve V48 acil kurtarma kapısı yalnız bu sayaca bakar.
- Gereksiz yeniden seçim yaratmamak için fiziksel sıkışma kapısı en az **bir gerçek kurtarma olayı + 4,2 saniye A* ilerlemesi kaybı** ister. Değişiklikler yalnızca `coverPhase=MOVE_TO_COVER` ve gerçek görünür düşman varken uygulanır.

Böylece V47'nin karar hissiyatı ile V48'in daha doğru fiziksel teşhis sistemi birbirine karışmaz. Bu revizyonun sonuçları ayrıca aynı üç başlangıç tohumu üzerinden değerlendirilir; 3,6 saniyelik ilk kötü ayarın sonuçları yeni sürüm için geçerli sayılmaz.


## Gecikmeli kurtarma ve eşit başlangıçlı karşılaştırma

İlk tutarlı üç-tohumlu A/B koşusunda ([#45381718407](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45381718407)), maçların başlatılması ve 600 saniyelik hızlandırma aynı tarayıcı çağrısına alındı; PRNG yeni maç başlamadan hemen önce aynı tohumdan sıfırlandı. Baseline ve adayda *atış, isabet, siper seçimi, varış ve sıkışma sayıları tamamen eşit*, yalnız `coverStalledApproaches` **42→26** çıktı. Bu, yeni A* teşhisinin oyunun davranışını bozmadığını, fakat kurtarma koşulunun hiç tetiklenmediğini kanıtlıyor.

Bunun üzerine **iki kademeli acil kurtarma** eklendi: (1) 4,2 saniye gerçek A* ilerleme kaybı ve en az bir fiziksel sıkışma; **veya** (2) fiziksel sıkışma sayacı olmasa bile aynı siper hedefi için **7,2 saniyelik uzun ve kesintisiz gerçek rota ilerleme kaybı**. Yakın taktik duraksamalar ve kanat emirleri korunur. Testin son sürümdeki davranışı doğrulaması ayrıca gereklidir; gecikmeli kurtarmanın daha iyi olduğu henüz varsayılmaz. Çift hedefli bu sınır için 28. deterministik V48 kontrolü eklenmiştir.


## V48 son üç eşleştirmeli doğrulama — tamamlandı

**GitHub Actions:** [V48 3-tohumlu Chromium karşılaştırma #45382035507](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45382035507) — **PASS**. V47 kontrol kodu `5356db87317340a02e88ef65db7ee6c73e7581a8`, V48 oyun kodu `a6f836d5c3c3198c4faf28f200eff190704fc046`. İki sürümün maç başlangıcı aynı rastgele tohumdan yeniden kurulup start + 600s simülasyon *tek* sayfa işlemi içinde çalıştırıldı.

| Karşılaştırma (3 × 600 simüle saniye) | V47 | V48 | Fark |
|---|---:|---:|---:|
| Bot sıkışma kurtarması | 132 | **116** | −16 (−%12,1) |
| Siper yaklaşmasında 6s ilerleyememe | 42 | **29** | −13 (−%31,0) |
| Gerçek sipere ulaşma | 1.949 | **1.980** | +31 (+%1,6) |
| Sipere ulaşmadan vazgeçme | 1.757 | 1.835 | +78 (+%4,4) |
| Siper yeniden atama | 948 | 1.039 | +91 (+%9,6) |
| Siper tutma, bot-saniye | 1.085 | 1.078 | −7 (−%0,6) |
| Atış | 6.766 | 6.779 | +13 (+%0,2) |
| İsabet | 997 | 965 | −32 (−%3,2) |

**V48 yeni kurtarma sayaçları:** 17 gerçek A* siper yeniden rota seçimi, 1 güvenli siperden vazgeçme, 121 alternatif rota adayı güvenlik/rota nedeniyle elendi. Bu ölçümler, değişikliğin artık yalnızca telemetri olmadığına; gerçek davranışa da sınırlı ve denetlenebilir biçimde uygulandığına işaret eder.

**Sınırlama / açık kalan hedef:** Sıkışma ve uzun duraksama azaldı ve gerçekleşen varış sayısı arttı. Ancak gereksiz olabilecek siper atamaları %9,6 çoğaldı; isabet sayısı %3,2 azaldı. Bu nedenle V48 tüm çatışma davranışlarını üstün hâle getirmiş kabul edilemez. V49'da güvenli siper değiştirme sonrası kısa görev kararlılığı, siperden çıkma nedeni ve nişan süresi üzerindeki dolaylı etkiler incelenmelidir; 0,34 s kullanıcı nişan ayarı değişmez.

**QA doğruluğu:** [Bir önceki deterministik eşleştirme #45381718407](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45381718407) yeni rota-ilerleme teşhisini gerçek siper kurtarması devreye girmeden sınadı; V47/V48 tüm ateş/siper/sıkışma sayıları **birebir eşit** çıktı, yalnız yanlış uzun-ilerlememe tespitleri 42→26 indi. Bu, test altyapısının farklı gerçek-tarayıcı karelerinden kaynaklanan eski rastgele gürültüsünü büyük ölçüde kaldırdığını doğrular.

`main` dalına merge yapılmadı. Taslak [PR #10](https://github.com/zxc28tarik/FRONT-OPERATION/pull/10) üzerinden inceleme mümkündür.
