# FRONT OPERATION — V32 BOT davranış tutarlılığı

## Amaç
V31'deki onaylı beş sekmeli KISS arayüzünü, V9–V25'ten korunan asker/silah/harita model kalitesini ve mevcut savaş dengesini bozmadan BOT davranışlarını daha anlaşılır, adil ve kararlı hale getirmek.

## Uygulanan iyileştirmeler

1. **Görüş kaybı ve son görülen konum:** Görünür düşmanın anlık konumu yalnızca görüş koşulları sağlandığında kaydedilir. Görüş bozulduğunda hafızadaki son gözlenen konum sabit kalır; güncel düşman konumu sızdırılmaz.
2. **Görüş tutarlılığı:** BOT yalnızca tam taramada değil, iki tarama arasındaki takipte de görüş açısı/mesafe/görüş hattı koşullarını yeniden doğrular.
3. **Hedef kararlılığı:** Görülen eski hedef küçük skor farklarında korunur; yakın/ani tehdit mevcut hedef kilidini geçebilir. Hedef gerçekten değiştiğinde eski hedefe göre seçilmiş siper sıfırlanır.
4. **Takım istihbaratı ve oyun saati:** Görüldü raporları oyun içi saniyeye bağlıdır; duraklatma ekranındayken takım bilgisinin süresi akmaz. Maç yeniden başladığında istihbarat saati sıfırlanır.
5. **Sıkışma kurtarma:** Sıkışan asker artık rastgele konum sıçraması yapmaz. Önce 50 düğümlü A* üzerinde alternatif yol hesaplar, engel içinden geçmeyen kısa yan geçişi dener; dört sonuçsuz kurtarma döngüsünde taktik görevi yeniler. Engelli düğüm cezası 4,5 saniyeyle sınırlıdır.
6. **Gerçek yürüyüş animasyonu:** Adım temposu verilen hız komutundan değil, çarpışma çözümlendikten sonraki gerçek ilerlemeden alınır. Duvara yürüyüp yerinde ayak oynatma azaltılır.
7. **Araştırma/son konuma gitme:** Düşman görünmez olduğunda eski konuma dümdüz duvar üzerinden gitmek yerine A* geçiş noktaları kullanılır.
8. **Sıhhiye desteği:** Yaralı takım arkadaşına doğrudan erişim kapalıysa navigasyon yolu aranır. Medkit yakın ve görüş hattı açıkken bırakılır; duvar arkasına yakın görünerek destek verme engellenir.

## Korunan sınırlar
- BOT silah türleri, silah RPM/hasar ve rol dağılımı korunmuştur.
- Asker, silah, map, malzeme ve ortam grafikleri değiştirilmemiştir.
- V31 yatay sınıf sekmeleri, V29 duraklatma ve diğer HUD işlevleri korunmuştur.
- Geliştirmeler `ai/v32-bot-consistency` dalındadır; ana dala birleştirme yapılmamıştır.

## Otomatik doğrulama
Tek dosyada Node.js ile tekrar çalıştırılabilir:

```bash
node tests/bot_ai_v32_regression.cjs
```

15 kontrol: HTML içi JS sözdizimi, rastgele sıçramanın yokluğu, A* engel çevresi, yan geçiş yönü/engel reddi, duraklama saati ve TTL, son görülen hafıza, hedef değiştirme kararlılığı, yakın tehdit önceliği, siper sıfırlama, BOT'un düşman oyuncuyu görebilmesi ve dost ateşi hedef engeli.

## Gerçek tarayıcı kontrolü — henüz tamamlanmadı
Bunlar otomatik senaryoların yerine geçmez. Chromium/WebGL ile aşağıdakiler gözle kontrol edilmelidir:
- 6v6 oyunu açılışı; iki takımın birbirini ve oyuncuyu görüp çatışması
- Kapalı depo/konteyner arkasında görüşün kesilmesi; görüşten kaçana duvar arkasından doğrudan ateş edilmemesi
- Engelde takılan BOT'un ışınlanmadan çevresinden dolaşması; siper/merdiven geçişi
- Görüş kesilince son görülen noktaya navigasyonla yaklaşılması
- Yaralı dostun duvar arkasındayken medkit bırakılmaması; açık görüşte tedavi
- Drone kontrolü, oyuncu ölümü, BOT respawn ve duraklatma dönüşü davranışı

**Not:** Test scriptinin başarıyla çalışması, gerçek tarayıcıda oynanış testi yapıldığı anlamına gelmez.
