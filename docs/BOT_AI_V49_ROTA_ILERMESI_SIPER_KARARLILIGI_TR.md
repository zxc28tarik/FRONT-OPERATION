# FRONT OPERATION — V49: Rota ilerlerken siper kararının korunması

**24 Kasım 2026.** Taban: `ai/v48-cover-route-recovery` (`625b79c00cad85be1716af1b3d834b72836ef9df`). V49: `ai/v49-cover-route-hysteresis`. `main` değiştirilmez.

## Kök neden

V48 A* üzerinde kalan gerçek siper mesafesini `routeLastProgressAt` ile kaydetse de V47'nin `isCoverSafeForNewVisibleTarget` denetimi yalnız `lastProgressAt` (kuş uçuşu yaklaşma) ve 6,2 saniyelik katı süre kullanıyordu. Bot duvarın etrafında doğru yürüdüğü hâlde yeni bir düşmanı görürse hedef siperini erken kaybedebiliyordu. Bu, V48'deki fazla siper yeniden atamasının **olası** kaynaklarından biridir; toplam 91 fazladan atamayı yalnız bu durumun ürettiği kanıtlanmış değildir.

## V49 uygulaması

- Yeni bir **gerçekten görünür** hedef edinildiğinde, mevcut düğümün yeni düşmana karşı çömelmiş askeri fiziksel olarak gizlemesi, hedefin en az 9 m uzakta bulunması ve mevcut coverPhase'in geçerli olması hâlâ şarttır.
- Bir önceki direkt-mesafe saatinin ilerlemediği veya 6,2 saniyelik limitin dolduğu durumlarda V48'in **A* ilerleme saati** okunur. Son 2,25 saniyede gerçek rota ilerlemesi varsa en fazla 8,4 s yaş sınırına kadar mevcut siper korunabilir.
- `routeLastProgressAt` geçersiz, geçmişe göre durağan veya oyun saatine göre gelecek bir değer ise uzatma uygulanmaz. Yeni düşmana göre siper açıkta kalmışsa veya düşman 9 m içindeyse kesinlikle uzatma yoktur. Sınır dolunca önceki V47 yeniden değerlendirmesi devam eder.
- `coverRouteRetentions`: V47 kuralına göre iptal edilecek ama V49 rota ve fiziksel siper güvenliği sayesinde korunan hedef değişimleri.
- `coverTargetReevaluations`: Yeni görünür hedef karşısında mevcut siperin yenilenmesini gerektiren kararlar. Sadece RAM/localhost QA; yeni HUD yoktur.
- Onaylı V20 siper düğümü seçicisi, V48 acil A* kurtarma, takım kanadı, sınıflar, silahlar, asker çizimleri, WebGL, drone ve 0,34 s nişan profilleri değiştirilmez.

## Doğrulama

`tests/bot_ai_v49_regression.cjs` testine fiziksel görünürlük, yakın düşman, 8,4 s sert sınır, gerçek rota saati, geçersiz/gelecek zaman, eski test uyumu ve V20/V35 koruma denetimleri eklendi. `.github/workflows/check.yml` içindeki V32–V48 zincirinin sonunda çalışır. Chromium/WebGL smoke testi ayrıca koşulur.

**Eşleşme yöntemi:** GitHub Actions `bot-ai-stress.yml` aynı 471001, 471002, 471003 tohumlarında V48'den sabitlenen HTML'yi ve V49 adayını ayrı maçlarda 600'er **hızlandırılmış bot motoru saniyesi** koşturur. `scripts/compare-bot-cover-stress.mjs` sıkışma, siper atamaları, gerçek siper varışları, terk etme, siper süresi, atış/isabet, yeni rota koruma ve yeniden değerlendirme sayaçlarını karşılaştırır.

**V48 başlangıç referansı (önceki V47–V48 karşılaştırması, 3×600s):** yeniden atamalar 1039; siper varışları 1980; uzun ilerleyememe 29; sıkışma kurtarması 116; isabet 965; atış 6779. Yeni koşu tamamlanmadan bu sayılarla V49 için iyileşme iddia edilmez; farklı koşuların birebir aynı veriyi vermesi garanti değildir.

**Kabul ilkesi:** Sadece daha az siper ataması yeterli değildir. V48'in nav güvenilirliği ve gerçek varış/tutma süreleri korunmalı; isabet/atış ve hedef edinimi belirgin kötüleşmemelidir. Başarısızsa bu dalda geri ayarlanır, `main` birleştirilmez.

**Sınırlama:** 600 saniye gerçek insan oynanışı değildir. A/B tohumları başlangıcı eşitler; farklı bot kararları devamındaki RNG akışını değiştirebilir.
