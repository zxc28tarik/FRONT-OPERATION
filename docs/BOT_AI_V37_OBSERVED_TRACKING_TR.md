# FRONT OPERATION — V37 Görülen Hedef Takibi, Atış Geribildirimi ve Zorluk Koruma

Tarih: 23 Kasım 2026
Temel dal: `ai/v36-natural-movement-steering`
Yeni dal: `ai/v37-observed-target-tracking`

## Değişmeyen onaylı kararlar
- Oyun **6v6**, beş orijinal sınıf ve tek HTML/Three.js oynanışını korur.
- Her beş bot doğuşunda **3 Normal + 2 Zor**. Her **15. doğuşta** sıradaki Normal yerine 1 Uzman bulunur.
- Üç seviyenin de hedefe nişan oturtması **orta = 0,34 saniye**. Expert için instant aim veya ilave hasar yok.
- V31 sade menüler, silahlar ve sesler; V25/V26 asker modelleri; drone 110 HP; V32–V36 taktik, siper ve doğal hareket davranışları korunur.

## V37 uygulaması

### 1. Gözleme dayalı takip
`updateBotAimTracking(bot, observedEnemy, dt)`, yalnız `updateBotPerception` sonrasında **görüş hattı doğrulanmış `visibleEnemy.eye` anlık kopyalarını** kullanır. Hedef konumu yaklaşık 0,12 saniyelik aralıklarla örneklenir. Hareket hızı üstten 7 m/s ile sınırlanır; kısa maksimum 0,12 saniye ileri öngörü ve kontrollü interpolasyonla silah hedefe döner. Bu değerler oyun testleriyle kalibre edilebilecek ilk değerlerdir.

Görüş kaybı, hedef değişimi veya bot yeniden doğuşunda eski takip belleği sıfırlanır. Büyük gözlenmiş konum sıçraması (teleport/sahne geçişi) hız olarak yorumlanmaz; takip ve 0,34 saniyelik nişan oturtma yeniden başlar. Bu tasarım düşmanın duvar arkasındaki gerçek koordinatını takip etmekten kaçınır.

### 2. Görünen nişan ile hasarın tutarlılığı
Eski isabet hesabındaki **`classAcc * distFactor * targetEvasion`**, zorluk profili çarpanı ve sınıfa ait değişmeyen silah hasarı korunur. Yeni **takip hata çarpanı** (`trackingFactor`) en fazla %52 azaltma yapar. Çok hızlı yürüyerek ateş etme ve uzun seri için de mütevazı, sınırlı ceza vardır (`movementFactor >= 0.86`, `burstFactor >= 0.88`).

Başarılı bir atışın izi hedefe gider ve hasar uygulanır. Başarısız atışın izi hedefin yanından geçer; ekranın ortasından geçip hasarsız kalan bir mermi görüntüsü azaltılır. Görsel iz yerleşimi, hedefe ve botun o sıradaki gözlenen takip hatasına göre oluşturulur; izlerin hedefi sıfırdan bilmesine gerek duyulmaz.

### 3. Ateş disiplinini koruma
V33 `isBotFireLaneClear` dost ateş yolu kontrolü, `isBotAimAligned` yön kontrolü, V35 `isAimSettled` nişan kilidi ve V36 hareket fiziği olduğu gibi kullanılır. Nişan, görüş hattı, dost varlığı ve bekleme süresi uygunsuzsa bot ateş etmez. Drone hedefleri, keskin nişancı ve baskı ateşi için eski davranış korunur.

## Test
- V32: 15 PASS
- V33: 25 PASS
- V34: 31 PASS
- V35: 41 PASS
- V36: 30 PASS
- V37: 31 PASS
**Toplam: 173/173 deterministik regresyon kontrolü** (güncel kod üzerinde).

```bash
node tests/bot_ai_v32_regression.cjs
node tests/bot_ai_v33_regression.cjs
node tests/bot_ai_v34_regression.cjs
node tests/bot_ai_v35_regression.cjs
node tests/bot_ai_v36_regression.cjs
node tests/bot_ai_v37_regression.cjs
```

Ek olarak CI'da JS syntax, V5–V25 onaylı bileşen kontrolleri, asker görsel doğrulaması ve Chromium/WebGL 6v6 kabulü yürütülür. Gerçek maçta oyuncuya karşı adil isabet oranı ve uzun süreli davranışlar **oynanış gözlemi ile ayrıca kalibre edilmelidir**; yalnız deterministik test yeterli değildir.

## Sonraki öneri
V38: takım planı koordinasyonu (konum koruma, hücum/baskı/destek/kanat rolleri), ancak görünmeyen rakibi bilme, haksız zorluk veya menü kirliliği eklemeden. Önce V37'nin oyuncu başına TTK, bot isabeti ve 10 dakikalık maç hareketi ölçülmeli.

Kod V37 dalında tutulur. Kullanıcı onayı olmadan `main` ile birleştirilmez.
