# FRONT OPERATION — V241–V290 kalite programı
## Başlangıç noktası
Kullanıcının V240 oyun incelemesinde üç ana sorun: karakter kalitesi hedefin altında; bot davranışları ve yetenekleri yetersiz/tutarsız; silah görselleri geliştirilmeli.
Temel: V240 commit 19a0ab256d7e6f4200cb1121f61e7627efeebac0. Inline 45601063627 ve WebGL 45601063548 başarılı. Opt-in canlı test: 11 bot, 150 simülasyon adımı/7.5 s, 5 aktif rig, sıfır hata; normal açılışta rig yok. p95 boyuna oran 1.02845, maksimum 1.28631; yazılım A/B sınırları geçti. Bu sonuçlar gerçek oyuncu deneyimi/görsel kabul/donanım FPS anlamına gelmez.
Önerilen sıra: bot davranışlarının temel nedenleri, karakter üretimi, silah üretimi, ortak kabul. Üç bağımsız iş hattı; tek seferde büyük anlamlı paketler, her pakette kod ve test, kullanıcı onayı olmadan main birleştirilmez. HTML tek dosya yapısı, mevcut haritalar, modlar, onaylanmış HUD/menü, silah istatistikleri ve oyun kuralları korunur; gerekçeli oynanış değişiklikleri ayrı raporlanır.
## A — V241–255 Bot zekâsı
| Sürüm | İş | Somut çıktı ve kabul |
|---|---|---|
| V241 | Sorun analizi | Sabit seed senaryolar, gerçek maç karar izleri, geçiş nedeni, hedef, görünürlük, rota, ateş engeli, siper, sıkışma; mevcut kalite tabanı |
| V242 | Çelişen sahiplik | Tek hareket/nişan/ateş yetki zinciri, birbirini geçersiz kılan legacy durumların envanteri; hedef/rota titreşimi ölçümü |
| V243 | Algılama | Görüş, ses, hatırlanan son temas, görülemeyen hedefe canlı koordinat yok; ses ile gerçek hedef ayrımı |
| V244 | Tehdit seçimi | Yakın/tehlikeli/görünür hedefin sürekliliği, hedef değiştirme gerekçesi, ölü hedef temizliği |
| V245 | Nişan | Görünür hedefe tepki ve yönelme, sınıf/zorluğa göre doğal hız, namlu/baş/hedef uyumu; kapalı görüşe ateş yok |
| V246 | Saldırı | Uygun ateş fırsatını kaçırmama, ilerleme-dur-çatışma kararı; anlamsız hareket kesilmesi yok |
| V247 | Savunma | Bölgeye göre aktif savunma, görüş sektörleri, yerinde anlamsız dönme ve boş bekleme ölçümü |
| V248 | Siper | Gerçek siper ve atış hattı, geçiş sürekliliği, gereksiz kaçınma; kaçış döngüleri |
| V249 | Navigasyon | Merdiven/kapı/köşe/koridor ve engel senaryoları, takım çarpışması, sıkışma ve geri kazanım |
| V250 | Silah mantığı | HK416/MP7/MRAD/Minimi/P320/Glock için oyun içi menzil, cephane, yeniden doldurma, atış temposu, silah değişimi; mevcut istatistikler korunur |
| V251 | Sınıf | Assault dengeli ilerleme, medic destek, engineer drone fırsatı ve güvenli operatör durumu, sniper mesafe ve yan silah, heavy alan kontrolü; sınıf görevleri bağlamlı |
| V252 | Takım | İlerleyen/savunan/destekleyen roller, takım sıkışması, ateş hattı engelleme, gereksiz yığılma |
| V253 | Mod | Marien ölüm maçı, Tersane bomba ve kurtarma modu için görev önceliği, bomba kurma/çözme, esir kurtarma davranışları |
| V254 | Zorluk | Normal/zor/uzman tepki, nişan, karar ve kişilik farklılığı; 5 botta 3 normal 2 zor, 15 botta 1 uzman; orta hızda nişan yerleşmesi |
| V255 | Kabul | Her mod için çoklu seed maçlar, eşit rol dağılımı, replay/karar izleri; temel sorunlara göre sayısal iyileşme ve kullanıcı oynanış kabulü |
Önerilen hedefler: kontrollü açık atış hattında geçerli fırsatların >=%90'ında uygun tepki/ateş veya gerekçeli alternatif; duvar arkasına doğrulanmış illegal atış 0, ölü/yanlış takım hedefi 0, rota kaynaklı uzun sıkışma ve gereksiz davranış değişimi tabana göre >=%50 azaltma. Tepki/nişan aralıkları V241 tabanında kalibre edilir; botların her fırsatta ateş etmesi veya her maçı kazanması hedef değildir. Testlerde gerçek AI saati ve aksiyonlar doğrulanır; sadece kısa başlatma testi kabul değildir. Her ana modda en az 10 sabit seed hedefi, 6v6 ve desteklenen kapasite doğrultusunda 15+ bot stres testi. Zorlukta hileli algılama yok.
## B — V256–270 Karakter görselleri
| Sürüm | İş |
|---|---|
| V256 | 5 sınıf × 2 takım, ön/yan/arka/çapraz, ayakta/koşu/çömelme ekran görüntüsü denetimi; V240 görsel taban |
| V257 | İnsan anatomisi, vücut oranları ve silüet |
| V258 | Göğüs, bel, kalça ve omuz geometrisi |
| V259 | Kol, bacak, el, bot bağlantıları, parça ayrıklığını azaltma |
| V260 | Yüz, kafa, maske ve göz |
| V261 | Kask ve koruma ekipmanı |
| V262 | Kumaş kesimi, dikiş, panel, kıvrım, aşınma |
| V263 | Zırh, cepler, kemer, ekipman oturuşu |
| V264 | Doku ve malzeme; metal/kumaş/lastik ayrımı, kontrollü renk/gölge |
| V265 | Assault ve Medic görsel revizyon |
| V266 | Engineer ve Sniper görsel revizyon |
| V267 | Heavy görsel revizyon |
| V268 | Yürüme, koşma, çömelme, yön değiştirme; kayma ve zemin teması |
| V269 | Silah tutuşu, şarjör değişimi, ölüm pozları |
| V270 | 5 sınıf bütünlüklü görsel karşılaştırma, LOD, kabul |
Mevcut geometriyi yalnızca yoğunlaştırmak kabul edilmez. Hedef, tutarlı stil, okunabilir sınıf silüeti, birleşik anatomi, gerçekçi ağırlık hissi. V240 opt-in rig ayrı bir adaydır; tüm görsel pozları karşılaştır, daha kötü yüzey veya performans varsa eski model korunur. En az 30 model, 0/45/90 derece pozlar, eş kamera/ışık, 3 mesafe, yürüyüş ve çömelme animasyonu. Yeni hitbox veya silah mantığı değişikliği yok. Yakın detayda eklem çevresi oranı 0.98–1.02, p95 boyuna <1.10, maksimum <1.45; gerçek görüntü incelemesi şart.
## C — V271–285 Silah görselleri
Mevcut kod: buildViewmodel(weaponId) ilk kişi; bot üçüncü kişi modelleri ayrı ve V131 yüzey revizyonu var. Görsel fark ve animasyon tutarlılığı esas; gerçek silah üretimi değil oyun içi görsel varlıklar.
| Sürüm | İş |
|---|---|
| V271 | Tüm silahları ilk ve üçüncü kişi, normal/ADS/reload pozlarında görsel envanter ve kusur tabanı |
| V272 | Ortak görsel parça ve malzeme sistemi, modellerde orantı/kenar/yüzey standardı |
| V273 | HK416A5 görsel model yenilemesi |
| V274 | MP7A1 görsel model yenilemesi |
| V275 | Barrett MRAD görsel model yenilemesi |
| V276 | FN Minimi Mk3 görsel model yenilemesi |
| V277 | P320 ve Glock 18C görsel yenilemesi |
| V278 | Carl Gustaf M4 ve mevcut yardımcı ekipman görsel yenilemesi |
| V279 | İlk kişi el/kol/eldiven ve silah oturuşu |
| V280 | Metal/polimer/lastik malzeme, kontrollü aşınma, gölge |
| V281 | ADS, optik görünümü ve nişangâh hizası |
| V282 | Şarjör değiştirme, kurma ve silah geçişi görsel animasyonu |
| V283 | Geri tepme görseli, namlu alevi, iz, kovan ve atış geri bildirimi; hasar/RPM/recoil oynanış sabit |
| V284 | Üçüncü kişi silah modelleri ve bot el tutuşu; silah tanınabilirliği |
| V285 | Tüm silah görsel kabulü, LOD ve kaynak kullanımı |
Tüm silahlar aynı ışık ve kamera; normal, ADS, atış ve reload pozları. Silah görüş alanını gereksiz kapatmayacak, nişangâh hizası değişmeyecek, el/şarjör çakışmaları kontrol edilecek. Model ölçeği oyun içi görsel amaçlıdır. Mevcut hasar, atış hızı, cephane ve kontrol hissi ayrı kullanıcı onayı olmadan değiştirilmez. Claymore ve diğer mevcut yardımcı ekipman yalnız mevcut kullanım kapsamına göre.
## D — V286–290 Birleşik kabul
V286 karakter/silah animasyon uyumu; V287 bot davranışı ve görünür animasyon eşleşmesi; V288 6v6, 15+ bot desteklenen stres, tüm modlar ve kaynak sızıntısı; V289 V240 karşılaştırmalı regresyon ve görsel/donanım performans kabulü; V290 kullanıcıya doğrudan indirilebilir HTML ve kabul raporu.
Her büyük paket sonunda commit/test, önce-sonra görüntüleri, açık kusurlar, yanlış poz/karar örnekleri. %10 yazılım WebGL karşılaştırma bütçesi başlangıç hedefi, gerçek donanım FPS ayrı ölçülür. Sınır geçilemezse kalite/LOD optimizasyonu ya da eski sürüme dönüş. Main otomatik birleştirilmez. Kod tamamlandı ve kullanıcı onayı tamamlandı birbirinden ayrı statüler.
