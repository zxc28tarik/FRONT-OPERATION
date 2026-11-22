# FRONT OPERATION — PR #2 En iyi korunan sürüm kontrolü

**Tarih:** 22.11.2026  
**Denetlenen dal:** `restore/v25-approved-components-20261122` (PR #2, DRAFT)  
**Ana dal:** `main` (V24)  
**Hüküm:** **TAM DEĞİL.** En güçlü kaynaklar büyük ölçüde korunuyor, ancak V5'in eski harita ayrıntıları tamamen aktarılmadı; V14 isabet VFX adayının bazı parçaları hâlâ yok. Canlı görsel/oynanış testi yapılmadan “tüm özellikler en iyi sürüm” denemez.

## A. Gerçek kod karşılaştırması

| Modül | Tercih edilen kaynak | Kaynak karşılaştırması | Karar |
|---|---|---|---|
| 1A — Silah geometrisi | V17 (V10 eski aday) | V17 `buildViewmodel` içindeki **8 mevcut silah/eşya koşul dalının 8'i aynı** (yorum/biçim farkları hariç), drone dalı yeni | KORUNMUŞ |
| 1B — Asker modeli | V5 altın görsel kaynak (V11 başka aday) | V5 `createBotSoldierMesh` gövdesi, V25 malzeme ve `leftHip/rightHip/weaponPivot` animasyon bağlantısı adaptörleri haricinde aynı | **UYARLANDI; görsel QA bekliyor** |
| 1C — Doku üretimi | V12 onaylı | `makeProceduralTextureSet` birebir aynı, 10/10 oyunda kullanılan türler Canvas taklit testinden geçti. V25 malzemelerinde `bumpMap` mevcut fakat V12 ile bütün roughness/metalness/bumpScale sayıları aynı değil | **KAYNAK KORUNDU; render QA bekliyor** |
| 2A/2D — Recoil & nişan | V17 nişan/recoil referansı | `applyManualRecoilCompensation` birebir. ADS ve MRAD temel çizim dalları korunmuş; FPV için dürbünü gizleyen ek kontrol var | KORUNMUŞ |
| 2B — VFX | V14 aday | `spawnImpactFX` V14 5.179 karakter, PR2 3.757. V14'teki ayrı kan/kafa parçacıkları PR2'de yok. HUD headshot işareti mevcut | **EKSİK ADAY ÖZELLİĞİ** |
| 2C — Ses | V17 sabitlenmiş kaynak | V17'nin 16 temel ses metodu eşleşiyor; V24'ün mevcut 21 ses metodu PR2'de eşleşiyor | KORUNMUŞ |
| 3A — Algılama | V18 | `hasLineOfSight`, `evaluateCandidatePerception`, `computeReactionDelay`, `scoreEnemyCandidate` birebir. `updateBotPerception` V22 takım bilgisi genişlemeleri nedeniyle farklı | ÇEKİRDEK KORUNMUŞ |
| 3B — Siper | V20 | `findBestCoverNode`, `getCoverOccupancyCount`, `setBotState` 3/3 eşleşiyor (yorum farkları hariç) | KORUNMUŞ |
| 3C — Takım AI | V22 | `buildSquadLeadership`, `reportTeamVisualSighting`, `getSharedTeamSighting`, `broadcastRetreatCoverRequest`, `findCoveringFireOpportunity`, `getTeamLaneCounts`, `assignBotTacticalGoal` 7/7 eşleşiyor | KORUNMUŞ |
| 4A/4B — Drone | V24 üzerinde V25 geliştirmesi | V24'teki **33/33 drone metodu** PR2 ile eşleşiyor (yorum farkları hariç); Q/E ve 110 HP yeni özellikleri korundu. `DRONE_CONFIG.maxHp` bilinçli 55→110 | KORUNMUŞ |
| Oyun HUD ve menüler | Birleşik V24/V25 | Temel menu, scoreboard, crosshair DOM alanları var; görsel kalite için önceki sürümlerle gerçek ekran görüntüsü karşılaştırması yok | **DOĞRULANMADI** |

Not: V10 (1A), V11 (1B), V13 (2A), V14 (2B), V15 (2C) arşivlerin tamamı kullanıcıca nihai “en iyi” olarak seçilmiş sürümler değildir. Kaynaklarının farklı oluşu tek başına regresyon kanıtı değildir. V14 VFX'nin geri eklenmesi görsel karar gerektirir.

## B. V5 Marien görsel kayıpları

- **V5 orijinal** harita `buildMarienCQCMap` uzunluğu 17.299 karakter; PR2 güncel haritası 24.497 karakter ve farklı nesne yordamları kullanıyor. Uzunluk görsel kaliteyi kanıtlamaz.
- Eski `detailShippingContainer`, `detailSniperBuilding`, `detailSandbagWall`, `detailJerseyBarrier` PR2'de bulunmuyor. Yerlerine V17 mimarisinden gelen `buildDetailedContainer`, `buildDetailedSandbagWall`, `buildJerseyBarrier` ve farklı bina düzenleri var.
- V5 özgün asker kodu V25'e adaptörle alındı; özgün `makeFenceAlphaTexture` birebir. Ayrıca tel-çit panelleri ve taktik karargâh tabelaları eklendi. Ama **V5 haritanın bütün detayları ve geometri dengesi aktarılmış değil**.
- Korunan V5 dosyasının Git blob SHA'sı `7b320454b1e58f552803f10cae107047d036f504`; yerel V5 aslıyla `git hash-object` değeri birebir eşleşti.

## C. Doğrulama düzeyleri

- V25 PR2 HTML inline JavaScript sözdizimi: PASS
- V5 asker kurulum: 5 sınıf × 2 takım = 10/10, Three.js taklit nesneleriyle (gerçek WebGL değil)
- V12 512×512 texture: Oyunda çağrılan 10/10 tür taklit Canvas ile üretildi; diffuse+bump ve UV/anizotropi alanları kontrol edildi
- V22 lider seçimi: İzole davranış testi liderin konumunu korudu
- V17 recoil işlevi: İzole davranış testi tamamlandı
- 3B siper filtre ve 3C bildirimi: Kaynak fonksiyonu eşlemesi PASS
- V24 drone 33 metot ve ses motoru kaynak karşılaştırması PASS
- **Gerçek WebGL 6v6 oyuncu/BOT maç testi, görsel karşılaştırma ve performans ölçümü: YAPILMADI**

## D. Birleştirme kararı

PR #2 **DRAFT kalmalı.** Kaynak açısından restore edilenler iyi durumda; ama V5'in kalan harita ayrıntılarının görsel denetimi, animasyon/silah hizalaması, sonradan eklenen VFX tercihleri ve gerçek Chromium/WebGL testleri tamamlanmadan **her şey en iyi sürüm** onayı verilmemeli. `main` hâlâ V24'tür; PR #2'nin onarımları varsayılan oyunda henüz yoktur.

Ek not: HTML başlığı hâlâ `WAR ROCK: CQC MODERN — MARIEN`. FRONT OPERATION isim değişikliği ayrıca ele alınmalı; bu kontrol oyunun adını değiştirmedi.
