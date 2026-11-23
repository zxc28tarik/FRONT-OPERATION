# FRONT OPERATION — V39 Akustik Algılama ve Şüpheli Bölge Araştırması

**Tarih:** 23 Kasım 2026  
**Temel:** `ai/v38-squad-tactics`  
**Geliştirme:** `ai/v39-acoustic-investigation`  
**Yaklaşım:** Görüş hattı doğrulanmadığı sürece ses, düşman konumu değil yalnızca yaklaşık bir bölge ipucudur.

## Uygulanan değişiklikler

### 1. Oyun içi ses olayları
`emitBotNoise(team, pos, kind, sourceId)` yalnız gerçek maçta gerçekleşen şu kaynaklardan çağrılır:
- Oyuncunun normal silah ve tabanca/uzun menzilli tüfek ateşi.
- Botların normal ateşi, drone karşıtı ateşi ve görsel baskı ateşi.
- Patlamalar (bomba, roket veya mayının mevcut patlama sistemi).
- Yürüyen/koşan oyuncu adımları; yürüyüşte yaklaşık 9 m, sprintte 14 m duyulma temel menzili.
- Gerçekte hareket eden botların belirli mesafelik koşu adımları.

Sınıflara göre ilk menzil varsayımları: tabanca ~31 m, tüfek ~47 m, sniper ~66 m, patlama ~62 m. Bu değerler gerçek maçlarla kalibre edilmeli; fiziksel ses simülasyonu iddiası yoktur.

Olaylar **en çok 40 adet** tutulur; aynı aktörün çok hızlı tekrarlayan atışları aynı anda tekrar tekrar duyurulmaz. Geçmiş kayıtlar kısa sürede sona erer; maç başlangıcında sıfırlanır. Tüm süreler oyunun simüle edilmiş zamanını kullanır.

### 2. Görüş üstünlüğü, duvar etkisi, aynı kat kontrolü
`considerBotHeardNoise` 0,24–0,31 sn aralıklarla görsel temas yoksa düşman takıma ait sesleri değerlendirir. Aynı takımdan gelen silah/adım gürültüsü takibe neden olmaz. Engel arkasında duyulma mesafesi azaltılır: patlama daha az, ayak sesi daha çok sönümlenir. Ayak seslerinde farklı katlardan gelen hatalı takibi azaltmak için dikey fark sınırlandırılır. Bot ağır yaralıysa ses soruşturması açılmaz.

**Önemli:** Ses sistemi `getLiveEntitySnapshot()` üzerinden düşman konumunu okumaz. `reportTeamVisualSighting()` oluşturmaz. Botun mevcut `targetId` değerini değiştirmez.

### 3. Hatalı ama anlaşılabilir konum tahmini
Bot sesin yaklaşık konumuna kontrollü rastgele sapma uygular. Silah kaynaklarında yaklaşık 3–5 metre, patlamada 4,5–7,5 metre, koşma/ayak seslerinde yaklaşık 1,6–2,6 metre tahmin hatası vardır. Gerçek hedef bu noktayla otomatik eşleşmez. Uygun yürünebilir nokta yoksa bot açık olmayan alana körlemesine gitmez.

### 4. Oyun davranışı ve A*
`getBotHearingWaypoint` doğrudan geçiş veya mevcut 50 düğümlü A* rota sistemiyle tahmin edilen bölgeye gider. A* geçersiz bir tek düğümlü fallback döndürürse bunu ulaşılabilir rota saymaz. Ses araştırması **mevcut görsel görüş / geçmiş doğrulanmış görüş / acil sıhhiye yardımı / siper / baskı ateşi** davranışlarının önüne geçmez. Sniper ve drone operatörü genelde konumunu koruyup sese döner, diğer uygun sınıflar dikkatli yaklaşabilir.

Ses için ayrılan `hearingPos`, `hearingTimer`, `hearingGoalNode`, `hearingRoute` hafızası, gerçek düşman görüş hafızası `lastKnownEnemyPos` ile karıştırılmaz. Ses araştırmasında **görünmeyen rakibe otomatik ateş, hasar veya el bombası atma yapılmaz**. Kısa görev bağlılığı ve süre sonu temizliği sürekli sağa-sola dönmeyi azaltır.

### 5. Korunan kullanıcı kararları
- Oyun 6v6, tek HTML, mevcut beş asker/ateşli silah sınıfı korunur.
- Her beş doğuşta **3 Normal + 2 Zor**; her **15. doğuşta** Normal yerine **1 Uzman**.
- Her üç seviyede **0,34 saniye orta nişan oturtma hızı**.
- Onaylı asker meshleri/karakter çizimleri, V31 KISS HUD, harita, drone, silah hasar/RPM dengesi, V32–V38 takım yapay zekâsı korunur.
- Ana `main` dalına kullanıcı onayı olmadan birleştirme yok.

## Kalite kontrolü
V32–V38 için önceki 207 test korunur. V39 için **46 yeni** deterministik kontrol: kaynak filtreleri, mesafe, engel ve kat etkileri, yaklaşık yer tahmini, kesin hedef bilgisinin sızmaması, acil davranışların üstünlüğü, ses belleği, A* geçerliliği, oyun olayı entegrasyonu ve bot yenilenmesi. Toplam **253/253** yerel/connector içi değerlendirme başarılı.

```bash
node scripts/check-inline-js.mjs
node scripts/check-best-components.mjs
node scripts/check-soldier-scene.mjs
node tests/bot_ai_v32_regression.cjs
node tests/bot_ai_v33_regression.cjs
node tests/bot_ai_v34_regression.cjs
node tests/bot_ai_v35_regression.cjs
node tests/bot_ai_v36_regression.cjs
node tests/bot_ai_v37_regression.cjs
node tests/bot_ai_v38_regression.cjs
node tests/bot_ai_v39_regression.cjs
node scripts/browser-webgl-smoke.mjs
```

Ek gerçek Chromium/WebGL testi, eski maç/menü/sınıf/drone smoke kontrolleri yanında **gerçek oyuncu ateşinden `BOT_NOISE_EVENTS` oluşmasını** lokal (yalnız `127.0.0.1`) salt okunur QA görüntüsüyle doğrular. Tarayıcı testi sonucu iş akışı çalıştığında ayrıca incelenmelidir.

## Sonraki aşama
V40: 6v6 uzun maç istatistikleri, sınıf ve zorluğa göre isabet/ölüm süresi, duvara takılma, takım yayılımı, sese verilen doğru/yanlış tepkiler ve görsel çizim süresi ölçümleri. Sınırlar gerçek oyuncu testlerinden sonra belirlenmelidir.
