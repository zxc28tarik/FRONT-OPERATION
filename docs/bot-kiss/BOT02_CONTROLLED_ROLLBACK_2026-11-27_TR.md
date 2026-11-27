# BOT-KISS / BOT02 — Kontrollü geri alma ve yeniden ölçüm (27 Kasım 2026)

## Bağlayıcı amaç
Proje sahibi: önceki BOT01–BOT07 KISS planına devam et, son eklenen bot davranışı bu hedefle çakışabileceğinden kaldır. Yeni yapay karar katmanları ekleme. Önce BOT02'yi basitleştir ve kabul et; BOT03–06 sonra.

## Kaynaklar ve açık sonuçlar
- Korunan V344 baz: 5fd037e83cb0aa77a5ff997b610e1b17c04f0486 / oyun blob 969432fb88c61b824ee6836df40006a64cdd3065.
- V345 BOT02 aday: 38abfe516fbbad7e8104517689f668ad1ac1bda9 / blob 86b5837a60a1072ed66d45e2c26af428503f627d.
- V345 15/15 hızlandırılmış doğal maç teknik olarak çalıştı; kalite kapısı KALDI. TDM geçiş 29.9164 → 38.8139 (hedef ≤23.93312); Heavy 50.0883 → 38.5287 (hedef ≤37.566225); TDM stuck .1186 → .1567 (hedef bazdan kötüleşmemek). Medic geçiş 33.356 → 75.7916; Medic idle proxy .2025 → .0488. Bu ölçümler birlikte incelenmelidir: sınıf bazlı sebep-sonuç kanıtı henüz yoktur.
- V346 `short-reacquisition` görsel temas kaybı hareket kuralı **kullanıcı isteğiyle tamamen kaldırıldı** (bc5ed941f6557ab7ad0d7f5c47b643522b50d3c4). Oyun kaynağı byte-for-byte V345'e döndü.
- BOT02 yeniden aday: V345 içindeki üç Medic değişikliği (cooldown kapısı, aktif medkit ile hasta veto, terk edilen hasta rota yeniden kurma) geri alındı. Medic mantığı V344 ile birebir. *Sadece* eski Heavy temas kararı eklentisi izolasyonda. Commit 46316e1bbfad32b7d52da55d610a5f5c55ec47ed; index blob **4a5d2ec9c9016b61ebc17abbfe3d3cd8469318ab**.
- Güncel oyun HTML'sinde yalnız `FO_BOT02_BEGIN heavy-helper` ve `heavy-commit` blokları bulunur. Bunlar çıkarılıp `let directCombat` tekrar `const` yapılınca V344 HTML *birebir* elde edilir. Önceki V346 ve geri alınan Medic eklentileri aktif değildir.
- Yerel izole doğrulama: 60 Heavy + 30 orijinal Medic hasta seçim senaryosu PASS; V33 regresyon 27/27 PASS; 3/3 inline JS parse PASS. Bu sonuçlar gerçek maç performansı kanıtı değildir.
- QA-only geçiş çifti enstrümantasyonu (`eski>yeni`) ve sınıf bazlı toplamlar duruyor; bot koduna, RNG'ye, nişan ve fizik kurallarına dokunmuyor. V344 ile aynı seed/roster/maç modu/.05 s simülasyon adımı kullanılıyor.
- CI karşılaştırıcı **değiştirilmemiş** kalite eşiklerini kullanır. 15 doğal maçlık yeni aday karşılaştırması henüz sonuçlanmadı; bu aday kabul edilmedi. Genel syntax ve WebGL CI sonuçları da ayrıca doğrulanacak.
- `main` değiştirilmedi, PR #68 draft kalır; onaysız merge yok.

## Sonraki adım (BOT02)
1. Geçiş çiftlerinden ağır basan salınımları ve sınıf bazlı sapmayı belirle.
2. Birbiriyle çakışan aynı işi yapan mevcut `directCombat/openingPriority/followThrough/holdContact` kararlarını basitleştir; ancak görüş, dost hat, ammo, hasar/RPM, 0.34 s aim ve görev kuralları korunacak.
3. A/B: TDM transitions/100s ≤23.93312, Heavy ≤37.566225, Medic idle proxy ≤.162, lane contact fire ≥baz-.02, first shot median ≤baz+.05, bomb doğal plant ≥4/5, rescue iki esir kurtarma ≥3/5, stuck artmayacak.
4. Teknik ve kullanıcı kabulü ayrıdır. Gerileyen adayı geri al; BOT03'e geçmeden BOT02'yi doğrula.

Not: Bu rapor geriye dönük zafer iddiası değil; ölçümler tamamlanana kadar kontrollü deneyi açık tutar.


## BOT02 / V347 — Aynı kararı tekrar hesaplamayı kaldırma (27 Kasım 2026)
- Eski Heavy-only kaynak blob `4a5d2ec9c9016b61ebc17abbfe3d3cd8469318ab`; yeni **BOT02-KISS aday blob `5ebd89aec73be13e9988c094becf3385f1cd6725`**. Üretim commit `740886d3d4ae6cf70c1670add4b01274e743c765`.
- Mevcut `openingPriority` ve `followThrough` yardımcı kararları, `directCombat` zaten true iken tekrar değerlendirilmez. `openingPriority` true iken `followThrough` ayrı çağrılmaz. İki yardımcı fonksiyonun hiçbir yan etkisi yoktur; `holdContact`, flank iptali, ateş, gerçek görüş, dost hattı, aim, reload ve görev sonucunun seçili değerleri değişmez. Yeni davranış veya nişan yeteneği eklenmedi.
- Karar kombinasyonlarında 64/64 `holdContact` ve flank parity doğrulandı; bu sentetik örneklerde öncesine göre **80 gereksiz yardımcı çağrı** kaldırıldı. Bu sayı oyun FPS kazancı ya da gerçek maç karar geçişi azalması anlamına gelmez.
- Toplam BOT02 izole durum **154/154**: Heavy 60, orijinal Medic 30, karar kombinasyonları 64. V54 23 kontrol, V83–V86 tarihsel temas regresyonları, V33 önceki 27 kontrol ve 3/3 inline JS parse başarılı. Eski V344 tam kaynak eşleşmesi: `heavy-helper`, `heavy-commit` ve `contact-shortcircuit` blokları etiketleriyle geri alındığında ve `directCombat` `const` yapıldığında byte-for-byte eşleşir.
- Güncel QA harness sınıf bazında `eski davranış > yeni davranış` frekanslarını raporlar. 15 maçlık gerçek bot simülasyonu karşılaştırması ve kalite kabulü bu kayıt anında **henüz sonuçlanmadı**. Eşikler gevşetilmedi. Sonuç gelene kadar BOT02 ve BOT03 geçişi açık tutulur.
- Korunan temel: V344 oyun, silah ve ses kodları; ana dala merge yok; PR #68 draft olarak devam eder. Kullanıcının kaldırılmasını istediği kısa görüş-kaybı hareketi ve Medic ekleri geri getirilmedi.
