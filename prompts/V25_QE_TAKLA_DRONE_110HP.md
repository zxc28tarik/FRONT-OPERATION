# WAR ROCK: CQC MODERN — V25 / YALNIZ Q-E TAKLA + DRONE 110 HP

## GÖREV / KAYNAK

**Kaynak:** `war_rock_cqc_v24_drone_ya_am_ba_na_tek_hak.html` (kullanıcının gönderdiği V24 tam oyun HTML'i).

Bu çalışmada sadece **iki** oyun kuralını değiştir. Kod değişikliklerini **Gemini yapacak**; ChatGPT yalnızca denetleyecek. Oyun sıfırdan yazılmayacak. Mevcut HTML'nin tüm geri kalan oynanışı, görselleri, silah/ADS sistemleri, drone kontrolleri ve BOT davranışları korunacak.

## 1) YANA YUVARLANMA (COMBAT ROLL): SADECE Q VE E

**Kesin karar:** Oyuncu masaüstünde **yalnızca Q'ya bilerek basarsa sola, E'ye bilerek basarsa sağa yuvarlansın.** Yan hareket veya sprint tuşlarının kombinasyonlarından takla çıkmasın.

Mevcut V24 `window.addEventListener('keydown', ...)` içinde şu tetikleyiciler bulunuyor:

- `KeyQ` → `triggerCombatRoll(-1)` — **koru**.
- `KeyE` → `triggerCombatRoll(1)` — **koru**.
- `KeyA` için `ShiftLeft/ShiftRight` veya 230 ms çift basış → `triggerCombatRoll(-1)` — **kaldır**.
- `KeyD` için `ShiftLeft/ShiftRight` veya 230 ms çift basış → `triggerCombatRoll(1)` — **kaldır**.

Yalnız `KeyA`, `KeyD`, `ShiftLeft`, `ShiftRight`, bunların kombinasyonları ve A/D hızlı çift basış **asla** `triggerCombatRoll` çağırmamalı. `lastTapA`/`lastTapD` değişkenleri artık kullanılmıyorsa kaldır. `e.repeat` ile Q/E tuşunu basılı tutmanın aynı basışta tekrar tekrar yuvarlanma oluşturmasını engelle; iki ayrı fiziksel basış arasında mevcut stamina/süre koşulları çalışmaya devam etsin.

- **Q = sola**, **E = sağa**.
- Mevcut roll süresi, SP maliyeti (25), hız, animasyon, kamera eğilmesi, hasar azaltma ve ses **değişmeyecek**.
- A/D normal sağ/sol hareketi, Shift normal deparı, W/S ileri/geri hareketi bozulmayacak.
- Drone FPV kontrolündeyken Q/E ile piyade yuvarlanması tetiklenmeyecek.
- Ölü/menüdeki oyuncunun yuvarlanması engellenecek; mevcut güvenlikleri koru.
- Mobildeki açık `TAKLA` dokunmatik düğmesi Q/E'nin bilinçli komut eşdeğeri olarak korunabilir; fakat dokunmatik sağ/sol hareket veya çift dokunuş otomatik takla üretmemeli.
- Oyunun ana menü kontrol açıklamasını `SHIFT+A/D | Q/E: Takla` yerine **`Q/E: Sola / Sağa Takla`** yap. İlgili diğer yanlış kontrol ipuçları varsa yalnızca bu konuda düzelt.

## 2) DRONE CANINI İKİ KATINA ÇIKAR: 55 → 110 HP

Mevcut V24 `DRONE_CONFIG.maxHp: 55`. Bunu **110** yap.

- Drone ilk üretildiğinde `hp` ve `maxHp` **110/110** olmalı. Hem oyuncu drone'u hem BOT drone'u aynı değerle başlamalı.
- Oyunun FPV HUD başlangıç etiketindeki sabit `55 / 55` metni varsa **`110 / 110`** yap.
- Hasar alan dronlarda gösterim ör. `74 / 110` olmalı ve can çubuğu `hp/maxHp` oranına göre doğru küçülmeli.
- Mevcut silah, roket, patlama ve mermi hasarlarını **değiştirme**. Yalnızca drone'un dayanıklılığı artsın.
- Drone HP sıfıra düşünce V24'te onaylanan **vurulunca patlama** aynen sürsün. Sağ tıkla anında patlama, tek patlama kilidi, dost ateşi ve alan hasarı **aynen korunacak**.
- Drone'un kendi kamikaze patlama **merkez hasarı 85**, yarıçapı **3 m** olarak kalacak. 110 HP sadece drone'un *dayanıklılığıdır*, patlama gücü değildir.
- **Her canlanmada yalnızca 1 drone**, W/S ileri-geri, A/D yana, Space yüksel, C alçal, normal hız 9.5 ve 20 saniye pil kuralları değişmeyecek.

## KORUMA SINIRLARI

Hiçbir şekilde bunları düzenleme/yeniden tasarlama: V17 nişan ve ADS, MRAD dürbün, silah değerleri, asker/silah modelleri, mevcut harita ve konteynerler, 3A algılama, 3B siper, 3C takım koordinasyonu, V24 drone keşif/işaretleme/kamikaze, ölüm ve yeniden doğuş, yeni maç temizliği, roket ve ekipman düzeltmeleri, HUD'un genel tasarımı, BOT hareketleri ve 6v6 maç sistemi. **Yeni özellik ekleme.**

## ZORUNLU TESTLER

1. A ve D'ye tek basış → **takla yok**; normal yana hareket var.
2. Shift+A ve Shift+D → **takla yok**; normal yan hareket/depar mantığı korunmuş.
3. A-A ve D-D hızlı çift basış → **takla yok**.
4. Q → yalnız sola takla; E → yalnız sağa takla.
5. Q/E basılı tutulduğunda klavye auto-repeat yeni takla zinciri oluşturmaz; ayrı basışlar mevcut stamina ve rollTimer koşullarına uyar.
6. Q/E sırasında drone kontrolündeyken piyade taklası olmaz.
7. Q/E haricinde herhangi bir klavye tuşundan `triggerCombatRoll` çağrısı kalmaz; mobilde isteğe bağlı açık TAKLA düğmesi ayrı değerlendirilir.
8. Hem oyuncu hem BOT drone'u ilk üretildiğinde `110/110 HP` ile başlar.
9. Drone hasar aldığında doğru HP çubuğu ve sayı görünür; 0 HP'de V24'teki tekil patlama korunur.
10. V24 sağ tık patlama, sol tık hızlı mod, her yaşamda tek drone, ölümde yenileme ve Space/C uçuş kontrolleri bozulmamış.
11. `node --check` ve mümkünse gerçek tarayıcı 6v6 testi çalıştır. Gerçekten yapılmayan testi PASS olarak sunma.

## TESLİM

- **Tam çalışan oyun HTML'i:** `WAR_ROCK_V25_QE_TAKLA_DRONE_110HP.html`
- **Uygulanabilir küçük yama:** `WAR_ROCK_V25_ONLY.patch` (V24 tabanına karşı `git apply --check` veya eşdeğeriyle doğrula).
- **Kısa karşılaştırma ve test raporu:** `WAR_ROCK_V25_TEST_RAPORU.md` (değişen fonksiyon/satırlar ve çalıştırılan testler).

**Yalnızca bu iki geliştirmeyi yap.** Kodda başka düzeltmeler görürsen değiştirme; raporda öneri olarak belirt. Eski V24 dosyasını üzerine yazma; V25'i ayrı yeni dosyada teslim et.
