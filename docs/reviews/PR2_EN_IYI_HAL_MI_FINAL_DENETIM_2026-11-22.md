# FRONT OPERATION — “Her şey en iyi ve en ileri sürümünde mi?” denetimi

**Tarih:** 22.11.2026  
**Kaynak:** restorasyon dalı `restore/v25-approved-components-20261122`, PR #2  
**Karar: HAYIR — en kapsamlı/restorasyonlu aday fakat henüz en iyi/üretime hazır sürüm olarak onaylanamaz.**

## GitHub ve gerçek CI

- `main` V24, commit `c029cb8999e3de1bf1cf12c38962926cf8433476`.
- PR #1 yalnız V25 adayı; PR #2 V25 üstüne geçmişte seçilen bileşenlerin restorasyonlarını içeriyor.
- PR #2, `main` tabanlı, **DRAFT**, açık ve birleştirilmemiş.
- Son PR #2 HEAD: `8bc336d338316c286482b3a1f6a901ac44b75a91`.
- GitHub Actions koşusu **45058158082**, sonuç **SUCCESS**. `js-syntax` işinde iki doğrulama adımı da başarıyla tamamlandı: `Check game JavaScript syntax`, `Verify best approved V5-V25 components`.
- **Önemli kapsam sınırı:** Bu CI, programın derlenmesi/kaynak koruma string ve fonksiyon eşleştirmelerini kontrol ediyor; gerçek 6v6/WebGL, ekran görüntüsü, BOT atış görselleri, temas/çarpışma, FPS ölçmüyor.

## KRİTİK / ÖNEMLİ denetim bulguları

### ÖNEMLİ 1 — Restorasyonlu V5 askerde kafa animasyonu parçalanmış

- `index.html` yaklaşık satır **4463–4484**: Kafa (head), kask (helmet), kask bandı, gözlük (goggles) ve kulaklar doğrudan `upperBody` içine **kardeş mesh'ler** olarak ekleniyor: `upperBody.add(neck, head, helmet, helmetBand, goggles, earL, earR)`.
- Geri dönen nesne `head` yalnız tek cilt/kafa mesh'i; altında kask/gözlük yok.
- Yaklaşık satır **9160**: `bot.mesh.head.rotation.x = -bot.aimPitch * 0.65`. Bu yalnız cilt/kafa mesh'ini döndürüyor; kask ve gözlük aynı eğimi almıyor.
- Orijinal V25 askerde `headGroup` vardı; kask ve gözlük de bu grubun içindeydi; onun dönüşü tutarlıydı.
- İzole Three.js benzeri grafik-sahne mock testinde beş sınıfın tamamında `head.children.length===0`, `head.parent===upperBody`, kafayla aynı düzeyde **7 kardeş parça** mevcut.
- **Öneri:** V5 kimliğini ve ölçeği koruyup bir kafa pivot grubu altında birlikte hareket etmelerini sağla; bot animasyonunun `head` referansını bu pivota bağla.

### ÖNEMLİ 2 — Kafa hedef bölgesi ile yeni modelin kafa merkezi farklı

- `upperBody.position.y` ayakta temel **0.93** (yaklaşık satır 4389), `head.position.y` **0.49** (yaklaşık satır 4465): görünür cilt/kafa mesh'inin merkez yüksekliği **1.42 m**.
- Mevcut hitscan kafa merkezi yaklaşık satır **8117**: `b.pos.y + 1.54 - crouchDrop`; yakın dövüşte referans kafa noktası `1.56`.
- Orijinal V25 `headGroup` pivot yerleşimi `0.93 + 0.61 = 1.54 m`; orijinal model/hitbox tutarlıydı.
- Restorasyonda oluşan **~0.12 m merkez hizası farkı**, kafa isabetinin görünen kafa üzerinde optimum hizalı olduğunu kanıtlamıyor. Bu, kafa isabetini tamamen bozduğunu **göstermez**, fakat A/B görsel ve atış testi gerektirir.
- **Öneri:** Model/hitbox kalibrasyonunu aynı seviyeye getir; yeni modelin görsel/nişan duyarlılığını doğrula.

### ÖNEMLİ 3 — BOT atış izinin çıkış yüksekliği ile V5 görsel namlu farklı

- V5 modelinde `weaponGroup.position.y=0.03`, `muzzleFlash.position.y=0.012`; bot `upperBody.y=0.93`. Düz/ayakta görsel namlu efekti yaklaşık **0.972 m**.
- Mevcut bot ateşi yaklaşık satır **8751** `botEye` noktasını `bot.pos.y + 1.45` seviyesinde kuruyor; yaklaşık satır **8799** tracer başlangıcı bu göz noktasından ileri 0.55 m.
- Düz yatay hedeflemede başlangıç yükseklik farkı **~0.48 m**. Animasyon/eğim değiştikçe farklılaşabilir. Bu, namludan değil karakterin üstünden ateş çıkması gibi görülebilir.
- **Öneri:** V5 modelin elle/omuzla tutuşunu ve görsel namlu dünya koordinatını mevcut atış grafiğiyle hizala; AI isabet/LOS kurallarını körlemesine değiştirme.

## Kısmen uyarlanmış, “birebir en iyi” denemeyecek alanlar

| Bölüm | Sonuç |
|---|---|
| **V5 harita** | Özgün konteyner detayları, kum torbaları, bariyer dikişleri, çit/tabela ve sniper bina örtü/cepheleri **uyarlandı**; V5'in bütün eski `buildMarienCQCMap` yerleşimi **birebir aynı değil**. Bu yeni yerleşimin daha iyi/çirkin olduğunu görmeden söylemeyelim |
| **V12 1C dokular** | Ana doku üretici fonksiyonu birebir korunuyor. Beton/konteyner malzemesi birebir uyarlanmış; ancak örn. V12 `matWood` roughness 0.78 / güncel 0.84, `matSandbag` bump 0.06 / güncel 0.08, `matHazard` metalness 0.15 / güncel 0.25, `matWindowGlass` opacity 0.38 / güncel 0.68. **Malzeme görüntüsü tam birebir değil**, hangisi iyi A/B gerek |
| **V14 2B efektler** | V14 gövde/kafa 5/7 parçacığı geri geldi, ancak V14'ün eski metal-kıvılcım toz/chip oluşturucu fonksiyonu tek parça halinde aktarılmadı. O adayın tümü nihai onaylı olmak zorunda da değil |
| **V17 silah ve nişan** | Kod kaynak karşılaştırmasında nişan/recoil ve 11 silah dengesi korunuyor; gerçek ADS/tetik/sniper nişangâhı oyun ekranında test edilmedi |
| **V18–V22 BOT zekâsı** | Esas fonksiyon kaynakları eşleşiyor; ancak gerçek 6v6 hedef/cover/engel durumlarında davranış henüz test edilmedi |
| **V24/V25 drone** | V24 çekirdeği ve 110 HP korunuyor, kaynak testleri geçiyor. Gerçek FPV, çarpışma, kullanıcı/BOT drone maç testi yapılmadı |
| **HUD / oyun arayüzü** | Oyun adı FRONT OPERATION, temel HUD mevcut. Önceki tüm görsel arayüz sürümleriyle ekran kalitesi karşılaştırması yok |
| **Performans** | FPS, yükleme, parça sayısı render etkisi ölçülmedi; performansın en iyi halinde olduğu savunulamaz |

## Doğrulanmış iyi alanlar

- GitHub Actions son koşusu yeşil (kaynak test + syntax).
- V5 asker kaynağının kimlik kodu adaptör hariç korunuyor (yalnız animasyon/hizalama kusurları var).
- V12 doku üretici fonksiyonu onaylı kaynakla aynı.
- V17 manuel recoil fonksiyonu aynı; eski silah değerleri korunuyor.
- V20 üç siper ve V22 yedi takım fonksiyonu kaynak düzeyinde aynı.
- V24 drone yatay kontrolünün düzeltilmesi, V25 Q/E + 110 HP mevcut.
- `main` dalı bozulmamış ve PR #2 draft durumda.

## Önerilen düzeltme / onay sırası

1. V5 askerin **kafa pivot, kask/gözlük eş hareketi** ve kafa hitbox hizası düzeltilecek.
2. **Görsel namlu/iz** hizası düzeltilecek; BOT atış/LOS/damage fiziği korunacak.
3. 1C malzeme A/B ve V5/son harita görsel A/B; kabul edilen görünümler kilitlenecek.
4. Gerçek Chromium/WebGL'de 6v6, MRAD, recoil, BOT siper, drone/FPV, çatı erişimi, VFX animasyonları test edilecek.
5. Bunlardan sonra kullanıcı onayıyla merge kararı. **PR #2 merge edilmemeli**.

**Kod değişikliği yapılmadı**: Bu belge QA bulgularını içerir. Proje kararı gereği oyun kodunda düzeltmeyi Gemini uygular, ChatGPT inceler.
