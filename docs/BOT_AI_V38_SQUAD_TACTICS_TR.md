# FRONT OPERATION — V38 Takım Koordinasyonu ve Güvenli Taktik Roller

**Tarih:** 23 Kasım 2026  
**Temel oyun:** `ai/v37-observed-target-tracking`  
**Geliştirme dalı:** `ai/v38-squad-tactics`  
**Durum:** Oynanış kodunda uygulandı; otomatik davranış ve Chromium/WebGL doğrulamaları CI üzerinden izlenir.

## V38 — Teknik değişiklikler
1. **Takımın rol paylaşımı:** Her takımda, sağlıklı hücum botlarından en fazla **birisi FLANK** (kanat), diğer hücumcular **POINT** (ileri hat). Ağır sınıf **PIN** (baskı), sıhhiye **SUPPORT**, sniper **OVERWATCH**, mühendis/drone operatörü **RECON** görevini alır. Roller, ölümler ve yeniden doğuşlar sonrasında yaşayan askerlerden yeniden oluşturulur. Sınıfın silahını değiştirmez.
2. **Doğrulanmış taktik hedef:** `refreshTeamBattlePlans(nowSec)` var olan V32 `TEAM_INTEL` raporlarını kullanır; yalnız yaşayan düşmanın yakın zamanda görülüp dondurulmuş konumuna göre takım hedefi belirlenir. Botların görmediği hedefin güncel dünya konumları **kullanılmaz**. Rapor ömrü ve 1,5 sn hedef bağlılığı sürekli karar değişimini azaltır; takım değerlendirmesi 0,75 saniyede bir.
3. **Navigasyonlu kanat hareketi:** `findTeamFlankRoute` 50 düğümlü A* haritasında takım hattından yanal uzak, düşmana çok yakın olmayan, güvenli bir hedef seçer. Bot doğrudan duvardan geçmez. Kendi `teamFlankRoute` verisini tutar; diğer destek/siper rotalarını bozmamaya çalışır. Sağlık azalınca veya düşman artık görünmüyorsa kanat manevrası öncelik kaybeder. Ulaşınca kısa yeniden konumlandırma beklemesi uygulanır.
4. **Baskı görevi:** Ağır sınıf, kendi önünde görünmeyen fakat bir takım arkadaşının **çok yakın zamanda doğruladığı** düşman noktasına yalnızca çevre görüş hattı uygunsa baskı ateşi gösterebilir. Bu baskı atışları mevcut sistemde **görsel amaçlıdır, doğrudan hasar vermez** ve V33 dost ateş hattı kontrolünden geçer.
5. **Takılma/çarpışma:** V34’ün dar geçit yönetimi ve V36’nın doğal hız kontrolü korunur. V38 kanat görevinde sıkışılırsa engellenen doğru A* düğümü belirlenerek alternatif rota aranır, üst üste başarısızlıktan sonra görev geçici olarak bırakılır.
6. **Görev çatışmasını azaltma:** Kanat görevi etkinse bot tekrar tekrar siper arayıp kendi kanat güzergâhını değiştirmez. Acil geri çekilme ve düşük can bu görevin önündedir.

## Bilerek korunmuş kullanıcı kararları
- Oyun **6v6**, mevcut **5 asker/silah sınıfı** ve tek HTML'dir. Yeni bir oyun modu veya görsel HUD paneli oluşturulmaz.
- Her **5 bot doğuşunda 3 Normal + 2 Zor**; her **15. doğuşta** bir Normal bot yerine **Uzman** gelir.
- Normal, Zor ve Uzman'ın hepsinde nişan oturtma hızı **orta = 0,34 sn** kalır.
- Orijinal silah hasarı/RPM, asker meshleri, sınıf menüsü, KISS HUD, siper, drone 110 HP ve görsel kalite değiştirilmedi.
- `main` dalına kullanıcı onayı olmadan birleştirilmez.

## Testler
Güncel sürümde deterministik testler:
- V32: 15/15
- V33: 25/25
- V34: 31/31
- V35: 41/41
- V36: 30/30
- V37: 31/31
- **V38: 34/34**
- **Toplam: 207/207**

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
node scripts/browser-webgl-smoke.mjs
```

## Oynanışta özel gözlemlenecek sorunlar
- Aynı ekibin 5 botu tek hedefe akın etmek yerine seçilen kanat/hat rollerini koruyor mu?
- Kanat görevindeki bot hasar aldığında gereksiz riske girmeden sipere dönebiliyor mu?
- Düşman öldüğünde veya görüşü kaybolduğunda, kayıtlı konumdan dolayı haksız takip var mı?
- Sıhhiye yaralıya yardımı ve drone operatörü savunma konumunu sürdürürken takım rolleri çakışıyor mu?
- Kapı/köprü gibi dar alanlarda takılma ve A* yeniden rota sayısı nasıl değişiyor?
- 10 dakikalık 6v6 maçta ekran/çizim FPS ve takım ilerlemesi önceki V37 ile karşılaştırıldığında nasıl?

Automated smoke testi gerçek WebGL maçının açılmasını ve UI/karakter fonksiyonlarının çalışmasını doğrular; uzun maçta doğal taktik davranışların kalitesi için gözleme dayalı test ayrıca gereklidir.

## Geliştirme sonrası öneri
V39: Silah sesini, patlamayı ve ayak seslerini **yaklaşık konumsal ipucu** olarak kullanan, duvar arkasını göremeyen ses/şüphe/araştırma sistemi. Uzun 6v6 maçlarla ölçümlemek gerekir.
