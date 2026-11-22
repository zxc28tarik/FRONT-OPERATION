# FRONT OPERATION — Nihai QA kontrol listesi

## Kritik koruma

- [ ] V17 ADS/hip-fire/MRAD iki kademeli dürbün hizası aynı.
- [ ] Beş sınıf, silahlar, mermi/hasar/RPM, animasyonlar, sesler ve Marien CQC haritası aynı.
- [ ] 3A görüş hattı, 3B siper, 3C takım istihbaratı ve BOT-BOT çatışmaları çalışıyor.

## Drone V24

- [ ] Her doğuşta 1 drone; fırlatılınca hak tüketiliyor; geri çağırma hakkı yenilemiyor.
- [ ] Ölüm, respawn ve yeni maç drone hakkını doğru sıfırlıyor.
- [ ] W/S ileri/geri; A/D yana; Space/C yüksel/alçal; Shift hızlanma.
- [ ] Sağ tıkta tek patlama ve tek hasar; sol tık hızlı mod.
- [ ] Drone vurulunca patlıyor; dost ateşi kapalı; 85 HP merkez hasarı / 3 metre yarıçap.
- [ ] Kamera/HUD, drone bitiminde veya operatör öldüğünde doğru normale dönüyor.
- [ ] BOT dronları depo tavanı ve kapı açıklıklarında takılmıyor.

## Maç ve ekipman

- [ ] 6v6 skor/süre/ölüm/respawn/yeni maç doğru işliyor.
- [ ] Önceki maçın atış/medkit/claymore kalıntıları yeni maça taşınmıyor.
- [ ] Roket oyuncu/BOT/drone'a çarpıyor; tek patlamada çift hasar yok.
- [ ] Duvar dibinde medkit/claymore yerleştirilemiyorsa haksız tüketim yok.
- [ ] V25 uygulandığında yalnız Q/E ile takla; Shift+A/D ve çift A/D takla yaratmıyor.
- [ ] V25 uygulandığında oyuncu ve BOT dronları 110 HP ile başlıyor.

## Test kanıtı

- [ ] `node scripts/check-inline-js.mjs` PASS (yalnız syntax).
- [ ] Tarayıcı Chromium/WebGL testi, konsol ve gerçek 6v6 maç sonuçları ayrı kayıtlı.
- [ ] Eski/yeni HTML SHA256 karşılaştırması ve PR diff'i incelendi.
- [ ] Bulgular KRİTİK, ÖNEMLİ, İSTEĞE BAĞLI olarak ayrıldı.
