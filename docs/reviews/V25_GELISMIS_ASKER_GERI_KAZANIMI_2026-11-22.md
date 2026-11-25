# FRONT OPERATION — V25 gelişmiş askerin geri kazanımı ve namlu hizası

**Dal:** `restore/v25-approved-components-20261122` — PR #2 taslak  
**Durum:** Daha önceki V5 askerinin son V25'e kopyalanmasının oluşturduğu görsel/animasyon gerilemesini düzeltme.

## Karar ve uygulama

1. **Asker:** `createBotSoldierMesh(team, classId)` eski V5 gövde kaynak uyarlamasından çıkarıldı; restorasyon öncesi `gemini/v25-qe-roll-drone-110hp` dalının **birebir V25 gövde ve ekipman modeli** geri yüklendi. Orijinal kaynağın yalnız fonksiyonu ayrıca `references/V25_3D_BOT_SOLDIER_APPROVED.js` olarak arşivlendi.
2. **V5 kalıcı referans:** `references/V5_MARIEN_GORSEL_ORIJINAL.html` ve V5'in onaylı harita/çit/tabela ayrıntıları olduğu gibi korunuyor. Eski V5 askerinin aktif oyuna geri getirilmesi **kalite düşüşüne sebep olduğundan** kaynak testi artık V25 askeri doğruluyor.
3. **Kafa pivot:** V25 `headGroup` içinde kafatası, çene, kask, kask bandı, gece görüş montajı, gözlük ve kulaklıklar birlikte hareket ediyor. Beş sınıfın hem mavi hem kırmızı versiyonu test edildi. V5 aktarmasında kafa mesh'i ayrı dönüyor ve gözlük/kask hareketi kopuyordu.
4. **Kafa geometrisi:** V25'te `upperBody.position.y=0.93`, `headGroup.position.y=0.61` ve bunların toplamı **1.54**. Bu, mevcut standart kafa hitscan merkezine eşit; V5 aktarmasındaki **1.42** kafa merkeziyle arasındaki 0.12 fark kapatıldı.
5. **BOT görsel mermi izi:** Yeni `getBotVisibleMuzzlePosition(bot, fallback)` yalnız çizim başlangıcını `muzzleFlash.getWorldPosition` ile gerçek silaha taşıyor. Üç atış biçimi: normal rakip, drone, siper baskı ateşi. **BOT göz/LOS, isabet şansı, yayılma, silah hasarı, drone hasarı korunuyor.**
6. **Silah birinci şahıs görünümü:** `buildViewmodel` ve V17 onaylı ADS/MRAD/manuel recoil'e dokunulmadı.
7. **Harita/dokular:** V5 çit, tabelalar, konteyner/kum torbası ve binalar, V12 dokular, V20 siper, V22 takım ve V25 Q/E 110 HP drone mevcut.

## Doğrulama

- V25 paylaşımlı asker geometrisi/asset fonksiyonu restorasyon öncesi kaynakla birebir kontrol edildi.
- 5 rol × 2 takım: **10/10** model oluşturma testi; parçalar ve kafa/namlu grup bağları olumlu.
- V25 kafa toplam yüksekliği: **1.54 m**; 8 kafa bağlı aksesuar/parça.
- Namlu dünya koordinatı görsel testi: geri dönüş/fallback ve çömelme yüksekliği olumlu.
- Güncel `scripts/check-best-components.mjs` kaynak eşdeğerliğini artık onaylı **V25** asker referansına göre doğruluyor (**12** kontrol).
- Yeni `scripts/check-soldier-scene.mjs`: gerçek Three.js yerine mock grafik sahnesiyle 10 sınıf/takım modelini, kafa parçalarını, hedef merkezini ve namlu çıkışını çalıştırır.
- `.github/workflows/check.yml` artık üç test adımı içeriyor: inline JS syntax, en iyi kaynak parçaları, karakter sahne grafiği.
- **Gerçek tarayıcı WebGL, FPS ve oyun içi animasyon testi henüz yapılmadı.** A/B görüntü onayı da bekliyor.

## Sıradaki görsel kalite değerlendirmesi

- V25 ve V11 asker modellerinin aynı poz, ışık, sınıf ve açıda gerçek karşılaştırması. V11'in iyi ayrıntıları seçilirse V25 ana gövdesine yalıtılmış şekilde uygulanmalı.
- Ellerle silah temasları, koşma/çömelme, namlu parlaması, hitbox ve HUD görünümü için gerçek 6v6 testleri.
- Başarılı CI tek başına görsel kalite garantisi değildir.

**Not:** Önceki `PR2_EN_IYI_HAL_MI_FINAL_DENETIM_2026-11-22.md` ve `V25_EKSIK_PARCA_GERI_YUKLEME_2026-11-22.md` raporlarının V5 askerin aktif olduğu yönündeki kısımları **tarihseldir**; bu belge daha güncel durumu temsil eder. `main` değiştirilmemiştir, PR #2 draft.
