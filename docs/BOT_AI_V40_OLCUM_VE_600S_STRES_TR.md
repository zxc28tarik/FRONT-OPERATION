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
