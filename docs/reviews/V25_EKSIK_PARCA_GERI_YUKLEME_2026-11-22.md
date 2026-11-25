# FRONT OPERATION — Eksik en iyi parçaların geri yüklenmesi

**Tarih:** 22 Kasım 2026  
**Dal:** `restore/v25-approved-components-20261122` (taslak PR #2)  
**Temel:** V25 Q/E takla ve 110 HP drone; `main` V24 değişmedi.

## Uygulanan eksik restorasyonlar

| Referans | Geri getirilen unsur | Uygulama ve koruma sınırı |
|---|---|---|
| V5 — Marien | Konteyner üst/alt ISO yapısal rayları, çift kapı açıklığı, kapı kolları/kilit parçaları | `detailShippingContainer` görsel-only yeniden uyarlanarak `buildDetailedContainer` içine bağlandı. Mevcut tek konteyner collider'ı korunuyor. |
| V5 — Marien | Döndürülmüş konteyner kapılarında koordinat onarımı | V25'te kapı çubukları yanlışlıkla `d/2` X ofsetine gidiyordu; gerçek gövde X yarı genişliği `w/2` kullanıldı. |
| V5 — Marien | Tek tek görünür, şaşırtmalı kum torbası kursları ve burlap dikiş/hem çizgileri | V25'teki eski küçük torbalar aynı solid kutunun içinde kalıyordu; `buildDetailedSandbagWall` yenilendi. Collider yalnız mevcut yekpare çekirdekte. |
| V5 — Marien | Jersey bariyer döküm/seam ayrıntıları | `detailJerseyBarrier`, mevcut `buildJerseyBarrier` üstüne görsel-only yüzey çizgileri ekliyor. |
| V5 — Marien | 2 katlı sniper binaları: cephe söveleri, mullion, üst çatı kanopisi, HVAC, vent, balkon rayı | `detailSniperBuilding` her iki V25 mevcut bina ayak izine uyarlanarak çağrılıyor. V5'in eski koordinatları ve fizik mimarisi kopyalanmadı. |
| V5 — Marien | Eksik dört sektör yön tabelası | V5'in özgün `addTacticalSign` sanatı (V25'te `addV5TacticalSign`) ile dört sektör tabelası eklendi; toplam V5 tarzı altı tabela. |
| V12 — 1C | Onaylı beton, eskimiş beton, konteyner boya/pas parlaklık ve normal kabarıklık ayarları | Önceden geri alınan V12 `makeProceduralTextureSet` yanında ilgili `bumpScale/roughness/metalness` V12 değerlerine yaklaştırıldı. |
| V14 — 2B | Gövde ve kafa isabet parçacıkları | V14'ün `bloodDropGeo`, `matBloodBody`, `matBloodHead` öğeleri ve 5/7 parçacık dengesi V25 VFX kuyruğuna uyarlandı. Oyuncu yakın dövüş/tüfek ve BOT-BOT direkt atış isabetlerine eklendi; patlama/hasar hesabı değişmedi. |
| Marka | Eski WAR ROCK oyun/tarayıcı başlığı | İstenilen yeni `FRONT OPERATION` adıyla değiştirildi. Harita adı Marien olarak kaldı. |

## Kaynak eşdeğerliği / koruma

- **V5 özgün asker modeli:** Mevcut V25 içinde, gereken malzeme eşlemeleri ve V25 animasyon alanları dışında orijinal V5 kimliğine eşdeğer.
- **V5 çit dokusu:** Orijinal `makeFenceAlphaTexture` kaynak eşdeğeri.
- **V12:** `makeProceduralTextureSet` birebir; kullanılan on doku türü Canvas taklit nesneleriyle oluşturulabiliyor.
- **V17:** `applyManualRecoilCompensation` birebir, silah ayarlarından V17'de bulunan 11 silah korunuyor, ADS/MRAD eski dalları korunuyor.
- **V18:** Temel görüş/algılama işlemleri korunuyor.
- **V20:** `findBestCoverNode`, `getCoverOccupancyCount`, `setBotState` birebir.
- **V22:** Yedi takım/koordinasyon temel fonksiyonu korunuyor.
- **V24/V25:** Drone kontrolü `horizAlpha` ile yatay olarak aynı; 110 HP, yalnız Q/E takla, yere basma koşulu ve tek drone/yaşam mantığı korunuyor. Kullanıcı/BOT drone hasar ve hareket kuralı değiştirilmedi.
- **Ses:** Daha önce V17'nin 16 çekirdek metodu ve V24'ün 21 ses metodu kontrol edilmişti; bu restorasyonda ses sınıfına dokunulmadı.

## Testler

- Güncel inline JavaScript sözdizimi: **PASS**
- Yeni `scripts/check-best-components.mjs`: **11/11 PASS** (kaynak, işlev eşleştirme, eski V5 asker adaptör doğrulaması, VFX/hareket kaynağı, adlandırma; sahte fs ile aynı script çalıştırılarak doğrulandı)
- V5 görsel helper'larının taklit sahne çağrıları: **PASS**
  - Normal konteyner 1 collider; dönmüş konteyner de 1 collider, yeni kapı donanımı gövde yakınında
  - Torbaların iki dış yüzünde 70 adet torba ve 70 hem görsel detayı oluşturulabildi
  - Bariyer 1 mevcut collider ve +4 görsel ek ayrıntı
  - İki sniper binasında +30 dekoratif parça ve 0 yeni collider
- V14 direkt isabet emiteri taklit testi: Gövde 5, kafa 7, toplam parçacık sınırı 145: **PASS**
- `.github/workflows/check.yml` yeni restorasyon kontrollerini CI adımı olarak çağıracak şekilde güncellendi. **GitHub Actions çalışmasının başarı sonucu henüz doğrulanmadı.**
- **Gerçek Chromium/WebGL tarayıcı yükleme, 6v6 maç, görsel A/B ve FPS testi yapılmadı.** Dolayısıyla son oyun çalışır ve her görsel kesinlikle daha iyi diye iddia edilmiyor.

## Hâlâ aynı olmayan / kararı bekleyen şeyler

1. V5 `buildMarienCQCMap` geometri/yerleşimi tümüyle V25'le birebir değil. Mevcut harita, çarpışma ve NAV planı korunarak eski görsel karakteristikler eklendi; tüm V5 sahnesinin birebir aktarılması **bilinçli olarak yapılmadı**.
2. V10 silah ve V11 asker adayları, nihai “en iyi” oldukları kanıtlanmadan V17 silah/V5 asker üzerine yazılmadı. V13 recoil adayı, onaylı V17 yerini almadı.
3. Yaşanan sahnede asker/eller, nişan görüşü, bina çatıları ve isabet efektlerinin gerçek görüntüsü A/B kontrol edilmedi.
4. Gerçek tarayıcı 6v6 maç, görünürlük, çarpışma, BOT siper kullanımı ve performans/fps kabul testleri yapılmadı.

**Birleştirme:** PR #2 DRAFT, `main` V24 korunuyor. Kullanıcı izni ve canlı QA olmadan merge yapılmamalı.

**Önceki denetim** `PR2_EN_IYI_SURUM_DOGRULAMA_2026-11-22.md` eksiklerin geri yüklenmesinden *önceki* anı temsil eder; mevcut durum için bu belge esas alınmalıdır.
