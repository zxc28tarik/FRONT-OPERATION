# FRONT OPERATION — V36 Doğal Bot Hareketi
Tarih: 23.11.2026
Başlangıç: `ai/v35-difficulty-mix-medium-aim`; bu doküman `ai/v36-natural-movement-steering` dalındaki gerçek değişiklikleri açıklar.

## Sabit kalan kararlar
- 6v6 oyunun tamamı ve beş mevcut asker sınıfı korunuyor.
- Her beş doğuş: **3 Normal + 2 Zor**. Her **15. doğuş** Normal'in yerini **Uzman** alıyor.
- Tüm botlarda **orta nişan oturtma süresi = 0,34 sn**.
- Silah istatistikleri, asker çizimleri, drone (110 HP), onaylı V31 KISS menüler, önceki V32–V35 taktik sistemleri korunuyor.

## Uygulanan V36 hareket iyileştirmeleri

### 1. İvmelenme, frenleme, ters yöne dönme
`computeBotSteeringVelocity()` botların arzu edilen yerel hızını ve önceki kareden taşınan gerçek hızını kontrollü birleştiriyor. Hız değişimine sınır uygulanır: normal hızlanma 12,5 m/s², yavaşlama 18 m/s², duruş/ters yön frenlemesi 22 m/s². Fiziksel adım sırasında maksimum zaman 0,08 saniyeye sınırlandırılır. Bunlar ilk ayar değerleridir; uzun oynanış testleriyle kalibre edilmeleri önerilir.

### 2. Hedefe kontrollü yaklaşma
Hedef noktaya çok yakınken hız `sqrt(2*a*distance)` yaklaşımıyla azalır. Mevcut A* güzergâhının ara düğümlerinde bu ek frenleme uygulanmaz; böylece botlar koridorun her düğümünde dur-kalk yapmaz. Siper, doktor yardımı ve takım formasyonu hareketi aynı yerel kontrollü hareketten geçer.

### 3. Sabit, yürünebilir çatışma yan adımları
`chooseBotCombatStrafeGoal()` botun 1,55–2,35 m yanal konuma geçişini harita geometri örnekleri ve aynı katta bulunan dost asker/oyuncu konumuyla kontrol eder. Uygun hedef bulunamazsa bot duvardan geçmeye çalışmak yerine bekleyebilir. Yan adım hedefi, her kare yeniden oluşturulmaz; hedefe yaklaşma, tehdit değişimi veya hareket zamanlayıcısı dolana kadar korunur.

### 4. Görüntü / fizik tutarlılığı
`resolveHorizontalCollision` sistemi aynen kullanılıyor. Çarpışma sonrası botun gerçekten kat ettiği mesafe ile istenen hız tutarsızsa eski hız belleği düzeltiliyor; böylece duvara bastırılıp sonra gereksiz fırlama riski azalır. Bacak yönü yeni hareket hız vektörüne bağlı. Yürüyüş başlayınca üst gövdenin boşta nefes alma pozisyonu sıfırlanıyor.

### 5. Yaşam döngüsü ve drone
Yeni botlar ve yeniden doğanlar yatay hareket hızını sıfırdan alır; eski çatışma yan adımı hafızasını taşımaz. Drone operatörü kontrol süresince yürüyüş hızını sıfırlar.

## Testler
Aşağıdaki regresyon testleri V36 üzerinde çalıştırıldı:
- V32: 15/15
- V33: 25/25
- V34: 31/31
- V35: 41/41
- V36: 30/30
**Toplam: 142/142** deterministik kontrol.

```bash
node tests/bot_ai_v32_regression.cjs
node tests/bot_ai_v33_regression.cjs
node tests/bot_ai_v34_regression.cjs
node tests/bot_ai_v35_regression.cjs
node tests/bot_ai_v36_regression.cjs
```

GitHub Actions iki ayrı hattı çalıştırır: onaylı bileşen/syntax/bot testleri ve gerçek Chromium/WebGL 6v6 arayüz/karakter testi. Bu dokümanda tarayıcı koşusu sonucu iddia edilmez; ilgili Actions çalışma sonucuna bakılmalıdır.

## Oyun içinde gözlenmesi gereken durumlar
- Dar kapıda üst üste gelen üç botun ani hareketleri;
- Siper düğümü çevresinde yavaşlamanın hedefe ulaşmayı engellememesi;
- Medic'in hareketsiz yaralıya ulaşması;
- Geniş alanda yan hareketin sık yön değiştiren robota dönüşmemesi;
- 10 dakikalık 6v6 turda sıkışma ve silah vuruş dengesinin bozulmaması.

Bu sürüm bir animasyon/silah/soldier model görsel revizyonu değildir. Temel oyun aynen kalır. Kullanıcı onayı olmadan `main`e merge yapılmaz.
