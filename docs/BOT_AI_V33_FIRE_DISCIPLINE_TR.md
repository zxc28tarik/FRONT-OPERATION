# FRONT OPERATION — V33 Bot atış disiplini ve rol tutarlılığı

## Kapsam
Kaynak: `ai/v32-bot-consistency` (V31 KISS menüler, V25 görsel/oynanış iyileştirmeleri ve 6v6 ana döngü korunur).

V32 algılama/son görülen konum/A* kaçış/takım bilgisi iyileştirmelerinin üstüne, ateş kararlarının görsel hareketlerle çelişmesini ve yaralı destek hedefinin sürekli değişmesini azaltan iyileştirmeler getirildi.

## Gerçek kod değişiklikleri

1. **Dönüş bitmeden atış yok:** BOT, hedefe bakış açısını gerçek `upperYaw` yönünden kontrol ediyor. Yeni hedefe ani 90–180 derece dönüp ateş etmek yerine önce gövdesini hizalıyor. Eşik yaklaşık 0,34 radyan.
2. **Dost atış hattı kontrolü:** Atıcının gözü–hedef arasında canlı dost oyuncu veya asker bulunuyorsa ateş yapılmıyor. Koruma yatay yakınlık, öndeki mesafe ve düşey yükseklik kontrolleri içeriyor; başka kattaki/arkadaki dost gereksiz ateş engeli oluşturmuyor.
3. **Bloke atışta yan pozisyon:** 0,38 saniyeden uzun süren dost hattı tıkanmasında BOT, her iki yanda çarpışmasız 2,45 m'lik bir hareket yolu arıyor. Yeni noktada da dostun atış hattını kesmediğini doğruluyor. Yol yoksa ışınlanmıyor ve dostun üzerinden ateş etmiyor.
4. **Tüm atış kaynaklarına aynı kural:** Ana silah, düşman drone'a ateş ve takım arkadaşını korumak için atılan baskı ateşi aynı yön/hattı kısıtlamasına uyuyor. Yetenek kullanımı da rastgele ters yöne veya dost arasından başlamıyor.
5. **Sıhhiye hasta kararlılığı:** Sıhhiye, yakınlık ile yaralanma ağırlığını birlikte puanlıyor ve aktif hastasına küçük farklarda öncelik tanıyor. Hasta ölür veya iyileşirse öncelik bırakılıyor. Hasta değişince yolu tekrar değerlendiriyor.
6. **Yaşam döngüsü temizliği:** Atış hattı tıkanıklığı ve hasta hafızası başlangıçta/respawn'da sıfırlanıyor.

## Özellikle değiştirilmedi

- Hasar, atış hızı, silah türleri ve skor sistemi.
- Asker mesh/silah/harita görselleri.
- Kontroller, 5 sınıfın seçimi, V31 yatay KISS sınıf sekmeleri, HUD ve duraklatma.
- 6v6 oyun döngüsü, drone 110 HP ve V32 görüş kaybı hafızası.

## Doğrulama

```bash
node tests/bot_ai_v32_regression.cjs
node tests/bot_ai_v33_regression.cjs
node scripts/check-inline-js.mjs
node scripts/check-best-components.mjs
node scripts/check-soldier-scene.mjs
```

- V32 regresyon: **15/15** test senaryosu çalıştırıldı, geçti.
- V33 regresyon: **25/25** test senaryosu çalıştırıldı, geçti (oyun içi JS de derlendi).
- GitHub Actions `check.yml` dosyasına her iki BOT testi eklendi.
- Chromium/WebGL smoke testleri V33 dalı pushlarında otomatik tetiklenecek şekilde yapılandırıldı.

**Açık QA:** Gerçek oynanışta iki dostun aynı dar kapıyı kullanması, farklı yüksekliklerde çapraz ateş, drone, sıhhiye ve respawn sonrası 6v6 davranışlarının ekran görüntüsü/kayıtla doğrulanması gerekiyor. Otomatik birim/regresyon testlerinin geçmesi, gerçek WebGL tarayıcı kabul testinin tamamlandığı anlamına gelmez.

**Entegrasyon:** Kod `ai/v33-fire-lane-discipline` dalındadır. `main` dalına veya onaylı V31/V32 görsel referanslarına merge yapılmadı.
