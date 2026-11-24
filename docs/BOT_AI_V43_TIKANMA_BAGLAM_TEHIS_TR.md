# FRONT OPERATION — V43 Sıkışma Bağlamı Teşhis Sistemi

**24 Kasım 2026** — V42 `ai/v42-collider-aware-nav-edges` üzerine.

## Neden?

V42, fiziksel olarak geçilemeyen 16 A* kenarını çıkarıp 50/50 düğüm bağlantısını korudu. Ancak 600 simüle saniyelik üç bağımsız Chromium motoru testi 54, 56 ve 149 sıkışma kurtarma üretti. En yüksek koşuda kırmızı Sıhhiye botu `red_1` 113 kurtarmaya neden oldu, 108'i 9 numaralı batı-depo düğümüne atfedildi. Sadece V40 telemetrisindeki 'düğüm 9' etiketi botun gerçek zamanlı hareket komutunun düğüm 9'a yönelik olduğunu **kanıtlamaz**.

## V43 eklemesi

Bot sıkışma kurtarma anında `recordBotStuckContext(bot, moveTargetPos, obstructedWp, nowSec)` çağrısıyla **gerçek hareket hedefi**, pozisyon, A* işaretlenen düğüm, davranış `state`, `coverPhase`, hedef/yardım/rally/siper düğümü, görüş/duyma ve kurtarma/yana kaçma durumu kaydedilir. İlk 4 olay ve ardından her 4. olay örneklenir, toplam tampon **100 kayıtla sınırlandırılmıştır**.

Gerçek aktör konumundan hareket hedefi yönünde **ilk 8 metre**, `isPositionWalkable` kullanılarak 0,25 m aralıklı fiziksel engel kontrolleriyle `probeClear` ölçülür. Bu, 'duvara yürümeye mi çalışıyor, yoksa tıkanma sebebi aktör çarpışması / taktik değişimi mi?' sorusuna pratik bir ayrım sağlar.

Veri yalnız maç içi RAM'de tutulur, oyuncu HUD'ına eklenmez ve localhost dışında QA dışa aktarımı yapılmaz; kalıcı depolama veya ağ aktarımı yoktur.

## Doğrulama ve sınırlamalar

- `tests/bot_ai_v43_regression.cjs`: **16 yeni deterministik kontrol**; örnekleme, 100 olaylık tampon, gerçek hedef/rota ayrımı, bellek sıfırlaması, snapshot savunmacı kopyası.
- Önceki V32–V42 kontrolleri korunur.
- Gerçek Chromium `browser-bot-ai-stress.mjs` çıktısına `stuckContextSamples` eklenmiştir; kontrol edilecek veri görüntülenir.
- V43 **henüz bir botun oynanış davranışını değiştirmez**. Yeni hız, hasar, nişan ayarı veya görsel uygulanmaz; tanı aşamasıdır.
- Test yine 600 saniyelik hızlandırılmış gerçek bot motoru simülasyonudur; 10 dakikalık interaktif oynanış değildir.

Bir sonraki karar: Kırmızı Sıhhiye botunun 9 numaralı düğümdeki kayıtlarından hareket hedefinin gerçekten yürünebilir olup olmadığını belirleyip yalnız doğrulanan mekanizmayı düzeltmek.

`main` dalına merge yapılmaz.
