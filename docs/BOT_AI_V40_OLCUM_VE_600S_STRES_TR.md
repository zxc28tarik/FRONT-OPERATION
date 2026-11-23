# FRONT OPERATION — V40 Ölçülebilir Bot Kalitesi ve 600 Saniyelik Stres

**Tarih:** 23 Kasım 2026  
**Temel sürüm:** V39 — `ai/v39-acoustic-investigation`  
**Geliştirme dalı:** `ai/v40-bot-telemetry-balance`  
**İlk gerçek motor stres çalışması:** [GitHub Actions 45249983080](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45249983080)

## 1. Uygulanan V40 geliştirmesi

V40 yeni silah/asker davranışı üretmek yerine mevcut yapay zekânın **gerçek oyun olaylarından** ölçülmesini sağlar. Veri hiçbir yere gönderilmez, localStorage'a yazılmaz, oyuncu HUD'ı ve KISS menülerine yeni panel eklenmez. Yalnızca `127.0.0.1` üzerinde başlatılan kalite kontrolüne salt okunur `window.__frontOperationAiQaSnapshot()` sunulur.

**Ölçülenler:** bot doğuşları; piyade/drone ayrı ateş-isabet sayaçları; öldürme/ölme; algılanan görsel hedefler; ses araştırması başlatma/varış/yarıda kesilme; kanat görevi; tıkanma kurtarma sayısı; takımda biriken yakın çiftler ve ekip merkezinden ortalama uzaklık; gözlenen hayatta kalma süresi; görevde hedef görme süresi; gerçek tarayıcı kare aralıkları, yaklaşık FPS ve 33,3 ms'yi aşan kare yüzdesi.

Raporlar **zorluk (Normal/Zor/Uzman), asker sınıfı, takım ve bot kimliği** ekseninde ayrı tutulur. İsabet oranı yalnız gerçekleşmiş atışların yüzdesi, K/D yalnız gerçekleşen eleme/ölüm ilişkisidir. Hiç veri yoksa alan `null` olur; sıfırdan veri uydurulmaz. Son 20 saniyelik örnek tutulur, eski veriler toplamlarda kalır.

Botların 50 civarı A* düğümünde tekrar tekrar tıkanmasını inceleyebilmek için her yeniden rota kurtarmasında **tıkanan düğüm ID'si**, takım ve asker sınıfı ayrıca sayılır. `unknown` ayrı kategoridir; harita konumu uydurulmaz. **V40 bu tıkanmaların nedenini henüz değiştirmez**; sonraki navigasyon revizyonu için tanıyı oluşturur.

## 2. Kabul ve regresyon testleri

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
node tests/bot_ai_v40_regression.cjs
```

V32–V39: **253** önceki test.  
V40: **51** yeni test.  
**Toplam: 304 deterministik kontrol**. V40 testlerinden bazıları yalnız telemetri yapısını **600 saniyelik sahte gözlem verisiyle** sınar. Bu, gerçek oyun mantığı veya FPS testi sayılmaz.

Gerçek tarayıcı kabulü: `node scripts/browser-webgl-smoke.mjs`; 6v6 sahnesi, sınıflar, onaylı asker çizimleri, oyuncu silah sesi, bot rol/zorluk dağılımı ve canlı FPS/AI sayaçlarının uygunluğunu doğrular. Yazılımsal WebGL FPS sonuçları oyuncunun grafik kartı için FPS tahmini değildir.

## 3. Gerçek bot motoru ile hızlandırılmış 600 saniyelik stres

`scripts/browser-bot-ai-stress.mjs`, Chromium üzerinde gerçekten başlatılan 6v6 oyunun **`updateBots()`, `droneSystem.update()`, `updateEntitiesAndFX()` fonksiyonlarını** 0,05 sn oyun adımlarında 12.000 kez işletir. Bu ayrı, otomatik CI hattında `.github/workflows/bot-ai-stress.yml` tarafından çalıştırılır.

**Kısıtlar:** Zaman 600 *simüle edilmiş oyun saniyesidir*; 10 dakika boyunca gerçek zamanlı oynanan/rendere edilen maç değildir. Bu testte oyuncu etkin biçimde oynamaz; WebAudio sentezleme susturulur (V39 yapay zekâ ses olayları yine oluşturulur); skor limiti dolarsa çalışma devam etsin diye test ortamında sıfırlanır. Bu nedenle veriler istatistiksel denge kanıtı veya gerçek oyuncu TTK ölçümü değildir.

### İlk başarılı stres koşusundan ölçümler
Kaynak: [Actions 45249983080](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45249983080), Chromium, 600 simüle saniye, gerçek bot mantığı.

| Profil | Doğuş | Atış | İsabet | Eleme | Ölüm | Tıkanma kurtarma |
|---|---:|---:|---:|---:|---:|---:|
| Normal | 24 | 691 | 86 | 15 | 19 | 839 |
| Zor | 17 | 830 | 94 | 13 | 11 | 348 |
| Uzman | 2 | 121 | 23 | 4 | 2 | 2 |
| **Toplam** | **43** | **1.642** | **203** | **32** | **32** | **1.189** |

**Sınıflara göre tıkanma kurtarma:** Ağır 610, Hücum 354, Sıhhiye 125, Mühendis 98, Keskin Nişancı 2. Ağır sınıf navigasyonu özellikle incelenmelidir. Yeni düğüm bazlı sıcak nokta raporu bunu hangi A* konumlarında yaptığını gösterecektir.

Bu koşuda Zor'un ham isabet oranının Normal'den daha yüksek çıkması *garanti edilmedi*: Karışık silah sınıfları, konumlar, rastlantı ve az sayıdaki Uzman örneği (yalnız iki yaşam) sonuçları etkiler. **Bu tabloya bakarak zorluk hasarı, canı veya nişan oturtma hızı değiştirilmemiştir.** Sağlıklı denge ayarı için çoklu koşu ve aynı sınıf/eşit şart karşılaştırması gerekir.

## 4. Kesin korunan kullanıcı kuralları

- Oyun **6v6**, tek HTML; beş mevcut asker sınıfı.
- **Her beş doğuşta 3 Normal + 2 Zor**, **her 15. doğuşta Normal yerine bir Uzman**.
- Tüm zorluklarda **0,34 sn orta nişan oturtma süresi**.
- V31 KISS HUD/menü, onaylı V5–V25 silah ve asker görselleri, orijinal hasar/RPM, drone, V32–V39 takım/siper/ses davranışları korunur.
- `main` dalına kullanıcı onayı olmadan merge yapılmaz.

## 5. Sıradaki teknik karar

**Öncelik: A* tıkanma kurtarmalarını azaltmak.** V40'daki `stuckNodes` ve `actors` raporu hangi düğümün, sınıfın ve botun sorun yarattığını gösterecek. V41'de körlemesine hız artırmak yerine o düğümlerde yol seçimi, siper kapısı, ağırlık/sınıf geçişi ve dar alan bekleme davranışları ölçümle karşılaştırılarak düzeltilebilir. Önce/sonra 600 sim saniye ve gerçek 6v6 Chromium QA tekrarlanmalıdır.

## 6. Düğüm bazlı ikinci stres ölçümü — bulgu kesinleşiyor

V40'a eklenen `stuckNodes` verisiyle yapılan **ikinci, bağımsız** hızlandırılmış 600 saniye bot motoru çalışmasında şu sonuçlar alındı:

[GitHub Actions — 45250513668](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45250513668)

- 600 simüle saniye / 600 bir saniyelik ölçüm örneği
- 1.421 bot atışı, 222 isabet
- 754 takılma kurtarma olayı
- **Ağır sınıfta 461** kurtarma olayı
- 20 örneklik son pencere sınırına uyuldu; tarayıcıda yakalanmamış JavaScript hatası: 0

| Yol düğümü | Harita noktası | Kurtarma | Ana kaynak |
|---|---|---:|---|
| **39** | Kırmızı üs kapısı `red_gate`, (x: 0, z: -45) | **264** | 260 Ağır, 4 Sıhhiye — tamamı Kırmızı takım |
| **3** | Mavi üs kapısı `blue_gate`, (x: 0, z: 45) | **259** | 168 Ağır, 56 Mühendis, 33 Hücum, 2 Sıhhiye — tamamı Mavi takım |
| 40 | Kırmızı doğuş (x: -12, z: -50) | 49 | Sıhhiye |
| 34 | Doğu giriş (x: 22, z: -10) | 44 | Mühendis, Hücum |

Tek başına **Kırmızı takımın ağır botu `red_4` 286 kez takılma kurtarması yapmış, buna karşılık bu simülasyonda hiç normal hedef atışı yapamamıştır.** Bu büyük bir arıza sinyalidir. Ancak nedenin kapı çarpışması, yanlış A* kenarı, dar geçit geçiş önceliği veya başka bir mekanizma olduğu, yalnız sayaca bakarak kesinleşmez.

**Navigasyonun sonraki sürümde ilk incelenecek iki yeri, 39 ve 3 numaralı üs kapısı düğümleridir.** Orijinal `NAV_EDGES` grafiğinde bu noktaların yakınındaki fiziksel geçit uygunluğu, bot yarıçapı, komşu düğümlerin yürünebilirliği ve yavaş hareket eden ağır botun `movedDist < 0.55` eşiğiyle ilişkisi kontrol edilmelidir.

İki bağımsız stres koşusunda da Ağır sınıf tıkanma kurtarmalarına büyük ölçüde katkıda bulunmuştur (ilk koşu 610, ikinci koşu 461). Bu tekrar, problemi **V41'de önceliklendirir**; fakat otomatik olarak başka tüm bot davranışlarının bozuk olduğu sonucunu vermez.

### Denge konusunda sınır

İkinci koşuda Normal 503 atış/111 isabet, Zor 794/101, Uzman 124/10 üretmiştir. Ham sonuçlar basit, monoton bir zorluk sıralaması göstermiyor. Üç grubun harita konumu, asker silahları, hedef mesafesi ve hayat sayıları eşitlenmeden "Uzman zayıf" veya "Zor daha az isabetli" sonucuna varılamaz. **Nişan oturtma hızı ve mevcut beceri profilleri bu nedenle değiştirilmemiştir.**
