# FRONT OPERATION — V48: Gerçek A* Siper İlerlemesi ve Güvenli Alternatif

**24 Kasım 2026** — temel `ai/v47-cover-lifecycle-reliability`, yeni dal `ai/v48-cover-route-recovery`.

## V47'den doğrulanan sorun

V47 son 3×600 simüle saniyelik eşleştirilmiş testte siper seçim kararsızlığını belirgin azalttı. Ancak `coverStalledApproaches` eski 59'dan 91'e arttı. Kaynak incelemesi iki nedeni ayırıyor:

- V47'nin siper ilerleme günlüğü, botun **sipere kuş uçuşu** mesafesini kullanıyordu. Duvar çevresindeki doğru A* manevrasında bu mesafe artabildiği için yanlış `no_progress` teşhisi mümkündü.
- Geçerli bir siper hedefine A* mesafesi boyunca gerçekten ilerleyemeyen bot mevcut sıkışma kurtarma döngüsüne fazlaca bağımlıydı. Her kurtarmada aynı siper amacı tekrar seçilebiliyordu.

## V48'in uygulanan işlevleri

**Rota uzaklığını hesaplama:** `getBotCoverRemainingDistance(bot,node)`, mevcut yolun hedef siper düğümüne ait olması şartıyla botun bir sonraki A* waypoint'e kalan uzaklığını ve sonraki kenarların gerçek uzunluklarını birleştirir. Geçerli siper rotası yoksa önceki mesafe ölçümüne düşer. Siperin varış koşulu aynı fiziksel mesafeyi kullanır: botun siper düğümüne **1,45 m** içinde ulaşması.

**Gerçekten duraksayan botun kurtarılması:** `recoverBotStalledCover`, aynı siper için son **3,6 simüle saniyedir** anlamlı rota ilerlemesi olmayan botu gözden geçirir. Ancak botun canlı olması, gerçekten görünür bir düşmanı bulunması, siper yaklaşma evresinde olması ve bir kanat komutunu izlemiyor olması gerekir. Süre sınırı ve kurtarma soğuması tekrar tekrar rota değiştirmeyi önler.

**Alternatif siperin güvenlik filtresi:** `selectAlternativeReachableCover`, sorunlu siper düğümünü dışlar. Adayın çömelmiş asker için gerçek fiziksel görüş engeli sunmasını, sınıfın kat/yükseklik sınırını, kısa/orta mesafesini, V45 ile yürünebilir başlangıç düğümünü ve V42 doğrulanmış A* yolu şart koşar. Çok büyük duvar dolanma yolları elenir. En fazla 50 nav düğümü taranır. Uygun alternatif bulursa bot mevcut A* rotasını değiştirir; bulamazsa kapalı siperi bırakıp mevcut çatışma hareketine döner. Duvarın içinden hareket veya görünmeyen düşmana atış uygulanmaz.

**V20 koruması:** Önceden onaylanmış `findBestCoverNode` fonksiyonunun gövdesi ve imzası değiştirilmedi. Acil kurtarma ayrı fonksiyonda tutuldu. Silah hasarı, ses, karakter çizimi, takım görevleri, drone, HUD, nişan ve zorluk profili değiştirilmedi.

**Yeni QA sayaçları:** `coverRouteRejected`, `coverAlternativeSelected`, `coverStallReroutes`, `coverStallFallbacks` önceki telemetriye eklendi. Ekrana gösterilmez; localhost test raporuna dahildir.

## Test kapsamı

- `tests/bot_ai_v48_regression.cjs`: 26 deterministik kontrol: duvar çevresinde kuş uçuşu uzaklığın artmasına rağmen A* ilerleme ölçülmesi; gerçek yaklaşma; başka düğüme A* yol doğrulaması; görünür düşman ve kanat emri güvenlik kapıları; alternatif yoksa normal çatışmaya dönme; cooldown; onaylı V20 seçici imzası.
- V32–V47: **583 önceki kontrol**, toplam **609** bot regresyonu.
- `scripts/check-best-components.mjs`: 12 onaylı bileşen için kesin kaynak eşleştirmeleri.
- Gerçek Chromium/WebGL 6v6 oyuna giriş kabulü.
- `scripts/browser-bot-ai-stress.mjs` ve `scripts/compare-bot-cover-stress.mjs` kullanılarak **471001, 471002, 471003** aynı başlangıç tohumlarında V47 bazına karşı V48 adayı koşulur. Kontrol commit'i `5356db87317340a02e88ef65db7ee6c73e7581a8`'dir. Karşılaştırma ayrı tarayıcı oturumlarında gerçek `updateBots` ile simüle saniyeyi çalıştırır.

## Korunan kullanıcı kararları

3 Normal + 2 Zor bot, her 15. doğuşta Normal yerine 1 Uzman; tüm botlarda 0,34 saniyelik orta nişan oturma; 5 asker sınıfı, 6v6, onaylı V25/V11 görseller, silah hasar ve RPM, drone, minimal KISS HUD ve V22 takım taktikleri korunur.

**Limit:** 600 simülasyon saniyelik hızlandırılmış bot motor testi, 600 saniyelik gerçek zamanlı/render edilmiş insan oyunu değildir. Aynı tohumlarda AI kararlarının ayrışması rastgele çağrı sırasını değiştirebildiğinden tüm sonuçlar birebir deterministik maç eşleşmesi değildir. Karar kalitesi için hem sıkışma hem gerçek siper varış/tutma hem atış ölçümleri birlikte okunmalıdır. `main` dalına kullanıcı onayı olmadan merge yapılmaz.
