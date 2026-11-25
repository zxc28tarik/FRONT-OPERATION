# FRONT OPERATION — V25 onaylı parça geri yüklemesi

Tarih: 22 Kasım 2026  
Kaynak: V25 taslak dalı `gemini/v25-qe-roll-drone-110hp`  
Çalışma dalı: `restore/v25-approved-components-20261122`  
**`main` ve önceki V25 dalı değiştirilmedi; bu çalışma ayrı bir adaydır.**

## Geri yüklenenler

| Sistem | Korunan en iyi referans | V25'e uygulanan |
|---|---|---|
| Marien görseli / asker | **V5** | V5 orijinal asker mesh'i geri alındı; V25'in `leftHip/rightHip/weaponPivot` animasyon API'sine adaptör eklendi. Beş sınıf × iki takım için oluşturma mock testi yapıldı |
| Marien görsel ayrıntısı | **V5** | Özgün tel-çit kanvas dokusu ve üç çit paneli; iki eski karargâh tabelası yeni haritaya görsel-only eklendi |
| Harita / beton / konteyner dokuları | **V12 1C** | Onaylı `makeProceduralTextureSet` doğrudan taşındı. V25 harita çarpışmaları ve koordinatları değiştirilmedi |
| Silah, nişan, ADS, MRAD | **V17** | V25'te zaten mevcut temel sistem korundu, diğer silah parametrelerine dokunulmadı |
| Manuel recoil telafisi | **V17** | V17 `applyManualRecoilCompensation` fonksiyonu tekrar kullanıldı |
| BOT görüş | **V18 3A** | Algı çekirdeği olduğu gibi bırakıldı |
| BOT siper | **V20 3B** | Gerçek örtüsü olmayan aday düğümü reddeden eski kontrol geri alındı |
| Manga liderliği | **V22 3C** | `buildSquadLeadership` ve lider odaklı toplanma noktası hesaplaması geri alındı |
| Takım istihbaratı | **V22 3C** | Canlı düşman, geçerli takım ve sonlu konum kontrolleri geri geldi |
| Drone çekirdeği | **V24** | İleri/geri eksenine ait `horizAlpha` geri alındı. FPV, tek hak, Space/C, RMB ve kamikaze sistemleri değişmedi |
| V25 | **Q/E + 110 HP** | Q/E takla ve 110 HP korunuyor; yere basma koşulu V17 kuralına geri döndü, drone kontrol engeli korundu |

V5'in bozulmamış asıl kaynağı depoya **`references/V5_MARIEN_GORSEL_ORIJINAL.html`** adıyla ayrıca kaydedildi.

## Açık görsel kapsam

V5 **`buildMarienCQCMap` fonksiyonu bütünüyle üzerine yazılmadı.** V5 eski `addBox/addRamp` fizik/çarpışma veri düzenini kullanır; V25 ise `addSolidBox/addWalkableRamp` ve yeni bot yol bulma/geometri mantığına dayanıyor. Doğrudan bütün V5 haritasını kopyalamak oyuncuyu görünmez duvarlarda tutabilir veya yol bulmayı bozabilir. Bu nedenle V5'in asker mesh'i ve sahneye çarpışmasız uygulanabilen özgün görsel ayrıntıları alındı; kalan özgün harita geometrisinin birebir yeniden kurulması ayrı uyarlama gerektirir. V5'in kaynak dosyası korunmuştur.

**V10 1A, V11 1B, V13 2A, V14 2B, V15 2C:** Bunların hepsi kullanıcı tarafından nihai seçilmiş "en iyi" modüller olarak kabul edilmediği için daha yeni onaylı modüllerin üzerine körlemesine yazılmadı. V17 silah/nişan ve ses motoru ana kaynaklar olarak korundu. V14'ün ayrı kan/kafa parçacıkları hâlâ eklenmedi.

## Kaynak ve test sınırları

- V25 güncel tek HTML kaynak; inline JS sözdizimi: **PASS** (V8 parser)
- 11 temel koruma koşulu: **11/11 doğru**
- Lider seçimi pozisyon testi: **PASS** (lider x=0; başka BOT x=10)
- V5 asker mesh oluşturma: **10/10** (5 sınıf × 2 takım, taklit Three.js ortamı)
- V17 recoil telafi fonksiyon testi: **PASS**
- V25 BOT görüş, MRAD kapsamlı yöntem ve drone hum kaynakları: önceki V25 ile **aynı**
- **Gerçek Chromium/WebGL 6v6 maç testi: YAPILMADI.** Görsel karşılaştırma/FPS testi: **YAPILMADI**. Bu rapor oyunun canlı tarayıcı testini geçtiğini iddia etmez.

## Birleştirme kararı

`main` hâlâ V24. Bu dal V25 + geri yüklemeleri içerir, **taslak PR olarak** tutulur. Kullanıcı onayı ve tarayıcı QA olmadan ana dala birleştirilmesin.
