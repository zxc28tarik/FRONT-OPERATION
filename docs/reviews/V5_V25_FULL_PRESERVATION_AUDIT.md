# FRONT OPERATION — Tüm korunan kaynakların V25 ile kapsamlı karşılaştırması

**Tarih:** 22 Kasım 2026  
**Son genel oyun:** `war_rock_cqc_v25_q_e_takla_ve_110_hp_drone.html`  
**GitHub'daki korunan ana sürüm:** `main/index.html` = V24  
**GitHub V25:** `gemini/v25-qe-roll-drone-110hp` dalı, taslak PR #1  
**Karar:** V25 henüz ana dala birleştirilmemeli. Oyun koduna bu denetimde dokunulmadı.

## 1. Yöntem ve sınırlar

Doğrudan **15 tam HTML kaynak** incelendi: V5 görsel referans, V9; 1A V10, 1B V11, 1C V12, 2A V13, 2B V14, 2C V15, 2D V17; 3A V18, 3B V20, V21, 3C V22; V24 ve V25. V5+Gunplay 3.0 ek kaynağı da kontrol edildi. Eski modül karar/koruma raporlarıyla çapraz denetim yapıldı.

- HTML içerisindeki gerçek JavaScript, TypeScript sözdizimi ayrıştırıcısıyla fonksiyon/sınıf/metot düzeyinde analiz edildi.
- Token tabanlı eşitlik kontrolünde yalnız yorum/biçimlendirme kaynaklı farklar ayrıldı; ayrıca önemli değişiklikler doğrudan satır-satır incelendi.
- `WEAPONS`, `CLASSES`, `WEAPON_MATS`, `DRONE_CONFIG` nesneleri özellik düzeyinde karşılaştırıldı.
- **15/15 kaynakta `node --check` PASS**. Bu yalnız sözdizimi kontrolüdür, oynanışın doğru olduğu anlamına gelmez.
- **Tam 6v6 Chromium/WebGL oynanış testi ve yan yana görsel/FPS testi bu denetimde yapılmadı.** Bu nedenle görünüş veya oynanış hissi hakkında kesin iyileşme/bozulma iddiası yok.
- Eski 1A, 1B, 2A, 2B, 2C modüllerinin bir kısmı **ayrı aday** olarak korunmuştu; kullanıcı tarafından tamamı nihai olarak onaylanmış sayılmaz. **V5 harita/asker görselleri**, **V12 duvar/konteyner dokuları**, **V17 nişan/ADS** ve **V21 drone oynanışı** özel olarak korunması gereken başlıca referanslardır.

## 2. Korunmuş modüller: genel tablo

| Kaynak / modül | V25'teki durum | Kanıt / yorum | Öncelik |
|---|---|---|---|
| **V5 altın görsel temel: Marien harita** | **Birebir korunmamış** | V5 `buildMarienCQCMap` (17.299 karakter) ile V25 (22.327 karakter) farklı işlevsel içerik. `detailShippingContainer`, `detailSniperBuilding`, `detailSandbagWall`, `detailJerseyBarrier` yerine yeni yapı yordamları kullanılıyor. Daha iyi/kötü olduğu görüntüsüz bilinemez. | **Yüksek görsel denetim** |
| **V5 altın görsel temel: asker modeli** | **Birebir korunmamış** | V5 `createBotSoldierMesh` 12.199 karakter, V25 12.731; token içerikleri farklı. Modelin tamamen kaybolduğu değil, yeniden kurgulandığı kesin. | **Yüksek görsel denetim** |
| **1A V10 gelişmiş silah görselleri** | **Yeniden yazılmış / farklı aday** | V10 `buildViewmodel` 434 satır, V25 718 satır. Sonraki V17'deki gelişmiş silah yapısı ise V25'te korunmuş; yalnız drone kumandası eklenmiş. V10'a birebir eşdeğer değil. | Orta |
| **1B V11 asker görsel adayı** | **Yeniden yazılmış / farklı aday** | V11 `createBotSoldierMesh` 369 satır, V25 323 satır. V17'deki asker geometri mantığı V25'te aynı; V11 adayıyla eşdeğerliği kanıtlanmış değil. | Orta |
| **1C V12 beğenilen duvar/konteyner dokusu** | **Birebir korunmamış** | V12 `makeProceduralTextureSet` 589 satır / 4.982 token, V25 450 satır / 4.748 token. Her ikisinde detaylı yüzey üretimi var ama yöntem, parametreler ve çizim sırası farklı. | **Yüksek görsel denetim** |
| **2A V13 recoil adayı** | **Birebir korunmamış** | V13 ile V25 farklı recoil akışları kullanıyor. V17'de sabitlenen recoil telafi fonksiyonu da V21 sırasında değiştirilmiş. Silahların V17'deki `recoilProfile` değerleri V25'te aynı. | **Önemli oynanış** |
| **2B V14 isabet efektleri** | **Kısmen var, bir özellik eksik** | VFX limitleri hâlâ 28 tracer / 145 parçacık / 38 iz / 32 kovan. V25'te kıvılcım, toz ve metal/zemin izi mevcut; **V14'ün ayrı kan ve kafa isabet parçacıkları bulunmuyor**. Bu adayın tamamı son sürüme aktarılmamış. | Görsel tercih |
| **2C V15 ses adayı** | **Sonradan yeniden uygulanmış** | V15 ve V25 `SoundEngine` metotları birebir aynı değil. Ancak **V17'deki 16 temel ses metodu V25'te token düzeyinde aynı**; V21'de eklenen 4 drone ses metodu da korunmuş. | Düşük/işitsel QA |
| **2D V17 nişangâh, ADS, MRAD** | **Ana hesaplar korunmuş** | V17'nin 11 silah tanımı **11/11 eşit**; 20 ortak materyal tanımı **20/20 eşit**, `droneCyan` eklenmiş. `buildViewmodel` eski silah dalları aynı, yalnız drone kumandası eklenmiş. `updateSniperScopeUI` yalnız FPV'de dürbünü kapatan beklenen koşulu ekliyor. | **Korumaya devam** |
| **3A V18 BOT algılama / görüş** | **Çekirdek korunmuş, takım paylaşımı eklendi** | `hasLineOfSight`, `evaluateCandidatePerception`, `computeReactionDelay`, `scoreEnemyCandidate` token-eşit. `updateBotPerception` takım paylaşımı nedeniyle değişmiş; temel hedef algısı kaldırılmamış. | İyi ama oyun testi gerekli |
| **3B V20 BOT siper** | **KANITLANMIŞ GERİLEME** | `findBestCoverNode`'dan gerçek örtü yoksa adayı reddeden tek satır kaldırılmış. Siper doluluk hesabı ve `setBotState` korunmuş. | **Önemli** |
| **V21 oyuncu/BOT drone** | **Kasti V24 yenilikleriyle korunmuş** | FPV, işaretleme, kamera, kamikaze, BOT drone ve tekil imha sistemleri bulunuyor. V24'te yaşam başına tek hak, RMB anında patlama, 9,5 hız ve Space/C kontrolü bilinçli geliştirildi. | Korumaya devam |
| **3C V22 manga liderliği** | **KANITLANMIŞ GERİLEME** | V22'nin `buildSquadLeadership()` fonksiyonu V24 ve V25'te yok. `updateBots` tekrar görünür düşmanı olan her BOT'un manga toplanma noktasını yeniden yazmasına izin veriyor. | **Önemli** |
| **3C V22 güvenli hedef paylaşımı** | **KANITLANMIŞ GERİLEME** | `reportTeamVisualSighting` içinde takım varlığı, hedefin canlılığı, dost-hedef reddi ve sonlu koordinat kontrolleri kaldırılmış. | **Önemli** |
| **V24 ana drone ve hata düzeltmeleri** | **Büyük ölçüde korunmuş** | V24'teki 33 drone nesnesi metodundan **32'si V25'te birebir aynı**; V25'in tek farklı drone metodu `update`. `getSafeDeployPosition`, `distSqPointToSegment`, `clearAllMatchEntities` de korunuyor. | İyi |
| **V25 Q/E + drone 110 HP** | **İstekler mevcut, ek fark var** | Q/E takla, 110 HP ve HUD doğru. Fakat ileri-geri drone sürüşünde `horizAlpha` yanlışlıkla `vertAlpha` yapılmış. | **Önemli** |

## 3. Kanıtlanan kapsam dışı davranış sapmaları

### A — 3B: Gerçek siper olmayan noktanın seçilebilmesi (önemli)

**Korunan V20:** `.../3B/V20_3B_SIPER_IZOLE_V17_3A_TABANLI.html`, **satır ~4660**.  
**V25:** `findBestCoverNode`, **satır 5958**.

V20'de bulunan ve V25'te bulunmayan satır:

```js
if (!isFullCover && !isPartialCover) continue;
```

Siper örtüsü sağlamayan konum artık +24 skor cezasıyla yine de seçilebiliyor. İhlal, başlangıçta V21'in kodu yeniden düzenlenirken ortaya çıkmış; V24/V25'e taşınmış. `getCoverOccupancyCount()` ve `setBotState()` ise korunmuş.

### B — 3C: Manga liderliğinin V22'den eski davranışa dönmesi (önemli)

**V22:** `buildSquadLeadership()` **satır 6099**, `updateBots()` **satır 8176**.  
**V25:** `updateBots()` **satır 8179–8206**.

V22 toplanma noktası için yalnızca canlı manga liderinin konumunu esas alıyordu. V25 ise öncelikli lideri belirlese bile şu kodla başka bir BOT'un toplanma noktasını üzerine yazabiliyor:

```js
if (b.visibleEnemy) {
  squadRallyPos[key] = b.pos.clone();
}
```

Bu satır, V22'de giderilen “rastgele BOT'a kayan toplanma noktası” hatasını geri getiriyor.

### C — 3C: Takım istihbarat doğrulamasının kaybı (önemli)

**V22:** `reportTeamVisualSighting` **satır 6152**.  
**V25:** aynı fonksiyon **satır 6111**.

V22 yalnız canlı rakip hedefleri, geçerli takımları ve sonlu koordinatları kabul ediyordu. V25 sadece `!team || !targetId || !frozenPos` kontrolünü yapıyor. Böylece sistem yanlış takım/ölü hedef/geçersiz konumu girişte reddetmiyor. Doğal oyun akışında her zaman tetikleneceği kanıtlanmadı, ancak güvenlik/kararlılık garantisi geri alınmış.

### D — 2A / V17: Recoil telafisi değişmiş (oynanış hissi riski)

**V17:** `applyManualRecoilCompensation`, **satır 5738**.  
**V25:** aynı fonksiyon **satır 7506**.

V17 fare aşağı çekişinin önce kalan `recoilVelPitch`'i karşılamasını, yalnız artan çekiş varsa `recoilRecoveryPitch`'e işlemesini sağlıyordu. V25 ise hız azaltımı yapsa da `recoilRecoveryPitch`'ten **tam çekiş miktarını** ayrıca düşürüyor. Yatay telafi hesabı da farklı. Bu eşdeğer olmayan davranışın iyi/kötü hissedilmesi oyun testi gerektirir; onaylı V17'nin birebir korunduğu söylenemez.

### E — V17: Havada takla engeli kaldırılmış (oynanış kuralı değişmiş)

**V17:** `triggerCombatRoll`, **satır 5483**: `!player.grounded` koruması var.  
**V25:** aynı fonksiyon **satır 7846**: `!player.grounded` yok.

Q/E tuş kısıtı doğru olsa da oyuncu hava durumundayken SP yetiyorsa takla başlatabilme ihtimali oluşuyor. Kuralın değişmesi istenmemişti. V21–V25 arasında taşınmış bir fark.

### F — V25: Drone ileri/geri hızlanması kapsam dışında değiştirilmiş (önemli)

**V24 satır 5564:**

```js
drone.vel.z += (targetVel.z - drone.vel.z) * horizAlpha;
```

**V25 satır 5563:**

```js
drone.vel.z += (targetVel.z - drone.vel.z) * vertAlpha;
```

`horizAlpha = 1 - exp(-(11.5 ya da 7.2) × dt)`, `vertAlpha = 1 - exp(-(13 ya da 11) × dt)` olduğundan ileri/geri ekseninin ivme ve frenlemesi sağ/sol ile ayrışıyor. İstenmeyen V25 değişikliği; V24'e geri döndürülmeli.

## 4. Eski görsel kalite neden otomatik “korunmuş” sayılmaz?

**V5** kaynak `buildMarienCQCMap` ve `createBotSoldierMesh` fonksiyonları V25 ile token eşit değil. V5'te ayrıntılı konteyner/kum torbası/bariyer/sniper binası yordamları ayrı iken V25 farklı fonksiyon ve şekiller kullanıyor. V5 ve V25'in aynı ayrıntı düzeyini, görüş çizgilerini, ışığı ve harita siluetini sunduğu **kanıtlanmadı**.

**V12'nin kullanıcı tarafından beğenilen duvar/konteyner kodu** V25'te doğrudan kullanılmıyor. V25 yine ayrıntılı 512×512 dokular, pas/derz/darbe çizimleri kullanıyor; fakat V12 piksel çizimleriyle aynı değil. Yan yana sahne/nesne ekran görüntüsü ve gerçek WebGL değerlendirmesi gereklidir. **Görsel kaliteyi iyileştirme bahanesiyle V25'in tamamını V5/V12 ile otomatik değiştirmek de doğru olmaz.**

**V14 2B adayı:** Kafa/gövde kan isabet parçacıkları V14'te var; V25'te `spawnImpactFX` metal/beton ile sınırlı; bununla birlikte HUD'da kafa isabet hitmarker'ı korunuyor. Eksikliğin geri eklenip eklenmemesi görsel tercih olarak ayrıca kararlaştırılmalı.

## 5. Gerçekten aynı kalan çok önemli sistemler

- **Silah dengesi:** V17'deki 11 silahın tanımları V25'te özellik/token bazında **11/11 aynı**, sadece `drone` ilavesi var. Beş sınıftan yalnız `engineer` artık Drone Operator olarak değişmiş.
- **Silah materyalleri:** V17 `WEAPON_MATS` içindeki **20/20 mevcut alan aynı**, yeni `droneCyan` eklenmiş.
- **Gelişmiş silah çizimi:** V17'nin eski silahları için `buildViewmodel()` bloklarında yapılan değişiklikler yorum silinmesinden ibaret; yeni `drone` kontrolcüsü eklendi. V17 nişan geometrisi korunmuş.
- **MRAD dürbünü:** V17 `updateSniperScopeUI()` yalnız aktif FPV sırasında dürbünü gizleyen erken çıkışla genişletilmiş.
- **Harita ve dokular:** V17 `makeProceduralTextureSet`, `buildMarienCQCMap` ve `NAV_NODES`, V25'te token düzeyinde **aynı**. *Bu, eski V5/V12 ile aynı oldukları anlamına gelmez.*
- **Asker:** V17'nin `createBotSoldierMesh` modeli V25'te kod tokenları açısından **aynı**; V21'den itibaren içerik aynı kalmış.
- **Ses:** V17'nin **16/16 SoundEngine metodu** V25'te aynen korunuyor. V21'de eklenen drone bip/hum kontrolü de korunmuş.
- **3A algılama:** `hasLineOfSight`, `evaluateCandidatePerception`, `computeReactionDelay`, `scoreEnemyCandidate` V18 ile aynı. Görülen hedefin timle paylaşılması 3C genişlemesi.
- **3B'nin kalanları:** Siper doluluğu ve durum kilidi fonksiyonları V20 ile aynı. *Gerçek siper reddi kaybı bunun istisnası.*
- **3C'nin kalanları:** `TEAM_INTEL`, `getSharedTeamSighting`, takım kapsamlı hafıza ve zaman aşımı kontrolleri mevcut. *V22 lider ve bildirim doğrulaması bunun istisnası.*
- **V24 drone:** 33 metodun **32/33'ü V25'te aynı**. Bir yöntem olan `update` içindeki tek hareket katsayısı kapsam dışı fark. V25 `maxHp` 55→110 doğru.
- **V23–V24 onarım yordamları:** `getSafeDeployPosition`, `distSqPointToSegment`, `clearAllMatchEntities` V25'te korunmuş. Tam maç testi yapılmadan bunların tüm uç durumları doğrulandı denmez.

## 6. En güvenli düzeltme sırası (Gemini kod yazacak, ChatGPT denetleyecek)

1. **P0 / minimal, zorunlu:** V25'in `drone.vel.z` satırını V24'teki `horizAlpha` hâline geri döndür; Q/E ve 110 HP'yi koru.
2. **P1 / 3B:** V20'deki örtüsüz siper reddi koşulunu, diğer siper mantığını değiştirmeden geri ekle; birim testleriyle örtüsüz düğümün seçilmediğini göster.
3. **P1 / 3C:** V22 `buildSquadLeadership` ve `reportTeamVisualSighting` doğrulamalarını V25'e **uyarlayarak** geri getir. V24'ün 1 drone/can, V23 güvenli spawn ve BOT drone koridor düzenlemelerini koru. V22 dosyasının tamamını V25 üzerine körü körüne kopyalama.
4. **P1 / onay gerektiren davranış:** V17'deki grounded takla şartını ve recoil telafisini ayrı karşılaştırmalı test et. Oyuncu hissi ve kontrol onayını almadan otomatik değiştirme.
5. **P2 / görsel kabul:** V5 harita ve asker, V12 konteyner/duvar, V10 silah modeli, V11 asker adayı, V14 VFX ile **V25'in gerçek sahnelerini** yan yana görüntüle. Sadece daha iyi bulunan alt sistemleri minimal ve kontrollü taşı; yeni görsel kodu bir bütün olarak eski sürümle değiştirme.
6. **Kayıt:** V5 görsel referans **yerel yedekte var fakat FRONT OPERATION GitHub'daki başlangıçtaki 28 dosya arasında yok**. Uzun vadeli koruma için bunu da ayrı, değiştirilmemiş kaynak arşivi olarak depoya eklemek uygundur. GitHub `main/index.html` ise şu anda V24 olarak korunmalıdır.

## 7. Hüküm

**Gemini her şeyi bozmadı.** V17 silah/nişan, V17 tabanlı harita ve asker kodu, ses sistemi, 3A görüş ve V24 drone çekirdeği önemli ölçüde doğru kalmış. Ancak **3B siper doğrulaması, 3C V22 lider/doğrulama düzeltmeleri** açıkça geri alınmış; **V17 recoil ve havada takla kuralı** değişmiş, **V25 drone ileri/geri kontrolünde** onaysız bir değişiklik var. **V5 altın görselleri ve V12 onaylı dokular** son oyunda birebir değil, bu nedenle görsel kalite farkı canlı karşılaştırılmadan güvenle onaylanamaz.

**Son karar:** V25 kodu korunacak, ancak PR #1 taslak kalacak; önce az sayıdaki kesin hata ayrı Gemini dalında düzeltilmeli ve görsel/oynanış kabul ayrı ele alınmalı.

## 8. Ek davranış doğrulaması — 5/5 hedefli izole test PASS

Yalnız satır farkına dayanmakla yetinilmedi: **eski ve yeni oyun dosyalarından ayrıştırılmış gerçek işlevler** küçük, açıkça tanımlanmış Node VM taklit nesneleri üzerinde karşılaştırıldı. Bu testler yapay senaryolardır, 6v6 WebGL oyunu değildir.

| Senaryo | Korunan referans davranışı | V25 gerçek kod davranışı | Sonuç |
|---|---|---|---|
| Tek adayın düşmana karşı hiç koruma sağlamadığı siper seçimi | V20: `-1` (siper yok) | V25: `0` (örtüsüz adayı seçiyor) | **Gerileme yeniden üretildi** |
| Aşağı fare çekişinde recoil telafisi | V17: recovery pitch `0,30` | V25: `0,28` | **Fark yeniden üretildi** |
| Oyuncu havadayken Q/E takla çağrısı | V17: takla başlamıyor | V25: rollTimer `0,42` | **Kural değişikliği yeniden üretildi** |
| Lider (x=0), düşman gören sıradan tim üyesi (x=10) | V22: manga toplanma x=`0` | V25: x=`10` | **Gerileme yeniden üretildi** |
| Dost asker yanlışlıkla görülmüş hedef olarak bildirilirse | V22: dost hedefi reddediyor | V25: istihbarata kaydediyor | **Doğrulama kaybı yeniden üretildi** |

Çalıştırılan yardımcı test betiği: `FRONT_OPERATION_AUDIT/test_regressions.js`. Diğer modüllerin gerçek oyun performansıyla ilgili sonuç çıkarılmaz.
