# FRONT OPERATION — V49: Rota ilerlerken siper kararının korunması

**24 Kasım 2026.** Taban: `ai/v48-cover-route-recovery` (`625b79c00cad85be1716af1b3d834b72836ef9df`). V49: `ai/v49-cover-route-hysteresis`. `main` değiştirilmez.

## Kök neden

V48 A* üzerinde kalan gerçek siper mesafesini `routeLastProgressAt` ile kaydetse de V47'nin `isCoverSafeForNewVisibleTarget` denetimi yalnız `lastProgressAt` (kuş uçuşu yaklaşma) ve 6,2 saniyelik katı süre kullanıyordu. Bot duvarın etrafında doğru yürüdüğü hâlde yeni bir düşmanı görürse hedef siperini erken kaybedebiliyordu. Bu, V48'deki fazla siper yeniden atamasının **olası** kaynaklarından biridir; toplam 91 fazladan atamayı yalnız bu durumun ürettiği kanıtlanmış değildir.

## V49 uygulaması

- Yeni bir **gerçekten görünür** hedef edinildiğinde, mevcut düğümün yeni düşmana karşı çömelmiş askeri fiziksel olarak gizlemesi, hedefin en az 9 m uzakta bulunması ve mevcut coverPhase'in geçerli olması hâlâ şarttır.
- Bir önceki direkt-mesafe saatinin ilerlemediği veya 6,2 saniyelik limitin dolduğu durumlarda V48'in **A* ilerleme saati** okunur. Son 1,6 saniyede gerçekten bu siper düğümüne bağlı bir A* rotasında ilerleme varsa 6,2 saniyelik normal süre içinde ve yalnız sipere A* yolunda 9 metreden az mesafe kalmışsa 7,2 saniyelik sert üst sınıra kadar mevcut siper korunabilir.
- `routeLastProgressAt` geçersiz, geçmişe göre durağan veya oyun saatine göre gelecek bir değer ise uzatma uygulanmaz. Yeni düşmana göre siper açıkta kalmışsa veya düşman 9 m içindeyse kesinlikle uzatma yoktur. Sınır dolunca önceki V47 yeniden değerlendirmesi devam eder.
- `coverRouteRetentions`: V47 kuralına göre iptal edilecek ama V49 rota ve fiziksel siper güvenliği sayesinde korunan hedef değişimleri.
- `coverTargetReevaluations`: Yeni görünür hedef karşısında mevcut siperin yenilenmesini gerektiren kararlar. Sadece RAM/localhost QA; yeni HUD yoktur.
- Onaylı V20 siper düğümü seçicisi, V48 acil A* kurtarma, takım kanadı, sınıflar, silahlar, asker çizimleri, WebGL, drone ve 0,34 s nişan profilleri değiştirilmez.

## Doğrulama

`tests/bot_ai_v49_regression.cjs` testine fiziksel görünürlük, yakın düşman, 7,2 s sert sınır, gerçek rota saati, geçersiz/gelecek zaman, eski test uyumu ve V20/V35 koruma denetimleri eklendi. `.github/workflows/check.yml` içindeki V32–V48 zincirinin sonunda çalışır. Chromium/WebGL smoke testi ayrıca koşulur.

**Eşleşme yöntemi:** GitHub Actions `bot-ai-stress.yml` aynı 471001, 471002, 471003 tohumlarında V48'den sabitlenen HTML'yi ve V49 adayını ayrı maçlarda 600'er **hızlandırılmış bot motoru saniyesi** koşturur. `scripts/compare-bot-cover-stress.mjs` sıkışma, siper atamaları, gerçek siper varışları, terk etme, siper süresi, atış/isabet, yeni rota koruma ve yeniden değerlendirme sayaçlarını karşılaştırır.

**İlk V49 denemesi (reddedildi):** V48'e göre yeniden atamalar 1039→860, isabetler 965→1026; ancak gerçek varışlar 1980→1845 ve uzun süre ilerleyememe 29→50 oldu. Bu nedenle 8,4 s cömert uzatma reddedildi. İkinci aday yalnız geçerli siper yolu üzerindeki son 1,6 s ilerlemeyi tanır; normal 6,2 s süreyi aşması için sipere A* yolunda 9 m'den yakın olma şartı getirir ve en geç 7,2 s'de bitirir. **İkinci adayın sonucu henüz birinci denemeden çıkarılamaz.**

**V48 başlangıç referansı (önceki V47–V48 karşılaştırması, 3×600s):** yeniden atamalar 1039; siper varışları 1980; uzun ilerleyememe 29; sıkışma kurtarması 116; isabet 965; atış 6779. Yeni koşu tamamlanmadan bu sayılarla V49 için iyileşme iddia edilmez; farklı koşuların birebir aynı veriyi vermesi garanti değildir.

**Kabul ilkesi:** Sadece daha az siper ataması yeterli değildir. V48'in nav güvenilirliği ve gerçek varış/tutma süreleri korunmalı; isabet/atış ve hedef edinimi belirgin kötüleşmemelidir. Başarısızsa bu dalda geri ayarlanır, `main` birleştirilmez.

**Sınırlama:** 600 saniye gerçek insan oynanışı değildir. A/B tohumları başlangıcı eşitler; farklı bot kararları devamındaki RNG akışını değiştirebilir.


## İkinci A/B sonucu ve üçüncü güvenlik kapısı

**İkinci ayarın üç-tohum A/B çalışması:** [GitHub Actions #45384047772](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45384047772) PASS.

| Ölçüm (3×600 simüle saniye) | V48 | V49 ikinci ayar |
|---|---:|---:|
| Doğrudan siper yeniden atama | 1.039 | 825 |
| Rota ilerleyememe (6 s) | 29 | 20 |
| Fiziksel sıkışma kurtarması | 116 | 130 |
| Siper seçimi | 3.826 | 3.490 |
| Gerçek siper varışı | 1.980 | 1.842 |
| Siper tutma bot-saniyesi | 1.078 | 1.109 |
| Atış / isabet | 6.779 / 965 | 6.597 / 996 |

**Değerlendirme:** Atama başına varış oranı %51,8→%52,8 artsa da toplam gerçek varış −%7 ve fiziksel sıkışma kurtarması +%12 yükseldi. Bu nedenle ikinci ayarı da son onay olarak işaretlemiyoruz.

**Üçüncü ayar:** V49 rota-koruma istisnası fiziksel bir sıkışma/yandan kaçış hâlinde çalışmayacak. `stuckFailures>0`, aktif `unstuckTimer` veya süresi dolmamış `blockedNodeTimer` bulunan botlar mevcut güvenli taktik yeniden seçim yoluna döner. Bu sürüme dört ilave deterministik kontrol eklendi (**toplam 640 bot regresyonu**). Üçüncü ayarın stres ve WebGL sonuçları, kendi CI koşusundan ayrı doğrulanmalıdır.
