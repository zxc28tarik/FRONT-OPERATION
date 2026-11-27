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

## BOT02 / V348 — Bir defalık baskı hesaplama ve geçiş nedeni ayrıştırması (27 Kasım 2026)
- BOT02-KISS mevcut pure `botObservedPressure` sonucunu aynı frame içinde strafe ve görev önceliği kontrolünde tekrar çağırmak yerine önceden hesaplanan `pressure` değeriyle kullanır. Yeni agresiflik, state, hedef, cooldown, RNG veya atış kararı eklenmez. V344 byte-for-byte yeniden kurma guard'ına `pressure-cache-strafe` ve `pressure-cache-objective` etiketleri eklendi.
- QA-only 0.05 saniyelik bot telemetrisine: ilk yirmi geçiş çifti, ≤1 s A→B→A hızlı geri dönüşler, baskın kısa salınım çiftleri ve olay bağlamları (görünür, son görüş kaybı, ses, görev, diğer) eklendi. Ölüm sonrası önceki karar sıfırlanır. 60. saniye snapshot haritaları kopyalanarak ilerleyen maçın sayaçlarıyla karışması engellendi.
- BOT02 154 izole temel durum + 24 baskı senaryosu + kısa salınım/ölüm/bağlam testleri yerel PASS, 3/3 gömülü JS parse PASS. Bunlar gerçek 15 maçın oynanış kabulü değildir.
- GitHub BOT02 workflow'unda gereksiz çift tetiklenme önlendi: yalnız PR ve manuel çağrı; push tetikleyicisi kaldırıldı. Referans V344 sabit. Aday SHA artık checkout'taki HTML'nin Git blob SHA1'i olarak hesaplanır; test raporları birebir aynı oyun dosyasını kullanmak zorundadır. A/B kalite eşikleri hiç gevşetilmedi.
- BOT02 kalite kapısı **açık**. GitHub 15 maç / eski ve yeni davranış geçişleri henüz raporlanmadı. Kaldırılması istenen V346 hareket kuralı ve Medic ekleri geri eklenmedi. Main merge yok.


## BOT02 / V349 — Gözlem: karar değişiminde navigasyon sıfırlanması (27 Kasım 2026)
- V348 oynanış kodu aynen korundu: bu tur **`index.html` değiştirmedi**. GitHub 15 maçlık karşılaştırma (`45972034459`) bu kayıt sırasında hâlâ **queued**; sonuç yokken kararları rastgele değiştirmiyoruz.
- Üretim V54 `selectBotBehaviorPlan`, kind değiştiğinde `routeProgress`, `stuckTimer`, `unstuckTarget` ve `passageStepTarget` alanlarını sıfırlıyor. Bu güvenli ama gereksiz salınımda ilerleme ölçümlerini de bozabilir; nedensellik henüz kanıtlanmadı.
- Test tarayıcısında aynı gerçek fonksiyonun öncesinde nav-state snapshot'ı okunuyor, sonrasında sıfırlama sayılıyor. Sınıf/harita/mod bazında `navResetsOnKindChangePer100AliveSec`, `navResetPairs`, `routeProgressClears`, `stuckClockClears`, `unstuckClears` ve `passageClears` raporlanır. Test-only enstrümantasyon botların state'ine, RNG'ye, karar veya hareketlerine yazmaz.
- İzole nav reset testi hem aynı kind için saymama hem gerçek plan değişiminde sayma hem nav state boşsa saymama hem de üretim bot objesine dokunmama kontrollerinden geçti. Genel JS CI içinde de ayrı kısa test koşacak.
- Kalite kapısı hâlâ açık: sonuçlar görülmeden BOT03'e veya yeni şemaya geçilmez. Silah/karakter/map/SES/aim korunur. Geri alınan V346 görüş kaybı hareketi veya V345 Medic değişiklikleri yok.


## V350 — Squad formation salınımını gerçek hareket olarak düzeltme
- V349 gerçek A/B: 15/15 doğal maç teknik PASS; kalite REVIEW_REQUIRED. TDM geçişi 29.9164→39.0534 (hedef ≤23.9331), Heavy 50.0883→59.1559 (hedef ≤37.5662), Medic boşta 0.2025→0.2319 (hedef ≤0.162). Ateş fırsatı 0.8471→0.8524, TDM stuck 0.1186→0.0875. Bomba 4/5, iki esir 3/5.
- TDM'de ADVANCE>SUPPORT 2616 ve SUPPORT>ADVANCE 2620 kez. 4937 adet ≤1s A→B→A salınımı. Heavy'de 2048, Assault'ta 860 hızlı salınım: sorun Medic'e özel değil. V54 davranış türü değişiminde rota/takılma ilerlemesini sıfırlar.
- V350: yalnız sessiz manga formasyonu esnasında eski SUPPORT_ALLY yerine ADVANCE legacy state ve hareket planı. Bu değişiklik sadece etiketi güzelleştirmez; V54'ün **gereksiz plan türü değişimlerinde yaptığı rota/takılma sıfırlamasını önler**. Mevcut formasyon hedefi, hız, sınıf filtresi ve mesafe eşikleri değiştirilmedi. Gerçek Medic heal SUPPORT, düşman ENGAGE/RETREAT ve bomba/esir MISSION önceliği korunur.
- Kaldırılan V346 görüş kaybı hareket eklentisi veya V345 Medic cooldown davranışı geri getirilmedi. V344 tam kaynak restorasyonu etikete bağlı. Yeni 5 sınıf × 4 mesafe × 2 slot × 2 lider = 80 gerçek manga kod senaryosu ve 5 görev/savaş önceliği. 15 maçlık yeni V350 A/B henüz beklemede; kalite eşiği değiştirilmedi, main merge yok.


## V351 — Hareketli manga ve Medic: iki ölçülmüş gerilemeye kontrollü müdahale
- V350 15/15 maç teknik PASS, kalite REVIEW_REQUIRED. Genel TDM geçişleri 39.0534→19.8384; Heavy 59.1559→17.5181; ≤1 s hızlı karar geri dönüşü 20.6496→2.8069. Ancak TDM stuck 0.0875→0.2783 (V344 0.1186); Medic quiet idle .2319→.2413 (hedef <=.162). Ateş, bomba 4/5, esir 3/5 korunmuş. V350 sonucu: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45982260286
- TDM stuck sınıf dağılımı Heavy .7537, Assault .2774, Medic .2555; Sniper .0371, Engineer .0575. Yani sorun özellikle sıradan manga formasyonunu kovalayanlarda. V54 route resetini geri getirmek yerine gerçek blocked-route recovery sonrası `bot.stuckFailures>0` oldukça formasyon kovalamayı bırakıp mevcut bağımsız taktik rotayı dene. Başarılı gerçek rota ilerlemesi stuckFailures'ı doğal yoldan sıfırlar. Ek yeni cooldown/RNG yok.
- Medic: Önceki V345 yaklaşımını aynen yeniden yüklemek yerine, kitin yenilenmesine 1.5 saniye kalıncaya kadar yaralıyı sürekli kovalamaz; takım taktik hareketine devam eder. Hazır kitte hasta seçim algoritması ve gerçek SUPPORT medkit mesafesi korunur. Hedef uzun cooldown boyunca hareketsiz beklemeyi azaltmaktır.
- V351 iki küçük etiketli değişiklik (`rally-stuck-fallback`, `medic-ready-pursuit`) kontrollü A/B adayıdır. V344 tam kaynak geri kurma sağlandı. Yeni 240 manga senaryosu, 30 sınıf/cooldown Medic durumu, 5 görev/çatışma önceliği ve önceki 154+24 izole kontrol PASS. Kullanıcıdan kaldırılan V346 görüş-kaybı hareketi geri gelmedi. Kalite eşiği gevşetilmedi. Henüz V351 doğal A/B sonucunu bilmiyoruz.


## V352 — Fiziksel olarak engelli formasyon hedefine takılmayı ayırma (27 Kasım 2026)
- V351 15/15 doğal maç teknik PASS, kalite REVIEW_REQUIRED. Tek kalem gerileme: TDM stuck/100 canlı saniye V344 0.1186 -> V351 0.3029; Heavy 0.0589 -> 0.5559, Assault 0.1332 -> 0.3018, Medic 0.2330 -> 0.4051. V351 toplam geçiş 21.1599 (hedef <=23.9331), Heavy 16.9887 (<=37.5662), Medic sessiz boşta .0384 (<=.162), ateş fırsatı .8530 (> .8271), ilk atış .6 sn, bomba 4/5, esir 3/5 PASS. Kaynak: GitHub Actions BOT02 run 45983337109.
- V352 dar kapsamlı aday: yalnız sessiz TDM manga takip hareketinde, hareket eden formasyon slotu ile bot arasında **fiziksel yürüyüş çizgisi kapalıysa**, slotu takip eden dinamik navigasyona girilmez; botun var olan bağımsız taktik rotası yürür. Slot açıksa V351 davranışı aynen devam eder. Silah, sınıf, sıhhiyenin yaralı seçimi, görev, nişan/ateş ve savunma öncelikleri değişmez.
- Kaynak düzenleme `FO_BOT02_BEGIN rally-direct-clear` bloğuyla tek satır koşula sınırlıdır. İşaret kaldırılıp `if(slot){` geri konunca V351 oyun HTML'si byte-for-byte geri kurulur. V344 restorasyon kontrolüne yeni etiket eklendi. 5 sınıf x 4 mesafe x 2 slot x 2 lider x 3 önceki takılma x 2 fiziksel geçiş = 480 senaryo test edilir.
- **Kabul açık:** 15 maç A/B'nin tamamı ve eski kalite eşikleri geçmeden V352 başarı sayılmaz ve BOT03'e başlanmaz. Özellikle TDM stuck <=0.1186 ve bomba/esir görev sonuçları korunmalıdır. Main değiştirilmez, PR #68 draft kalır.
