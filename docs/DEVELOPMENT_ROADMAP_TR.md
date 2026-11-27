# FRONT OPERATION — Bağlayıcı geliştirme yol haritası (TR)

Tarih: 25 Kasım 2026. Proje sahibinin talimatı: **Bot zekâsı ve davranışlarına ben açıkça izin verene kadar kesinlikle dokunma. Diğer işleri planla ve sıraya uy.**

## 0. Değiştirilemez çalışma sınırları (proje sahibi açıkça değiştirene kadar)

- Bot AI, kararlar, hedef seçimi, saldırı/savunma, takım koordinasyonu, nişan/isabet, algı, reaksiyon, yol bulma, siper, hareket komutları, görev davranışları, zorluk ve silah tercihleri dondurulmuştur. Önceki V271–V285 AI planı iptal değil, süresiz askıdadır; takvimde otomatik başlangıcı yoktur.
- "Devam", ".", "başla", test veya optimizasyon isteği AI izni değildir. Hata görülürse raporla, AI kodunu değiştirme. AI testleri salt okunur regresyon amaçlı çalıştırılabilir.
- Botun görünen animasyonu ve görsel efektleri yalnızca sunum katmanında değişebilir; AI girdileri, zamanlayıcıları, konumu, hitbox, algı, RNG, isabet veya karar çıktısı değişemez. Harita, ses, sınıf ve mod işleri de dolaylı biçimde AI davranışını değiştirmemelidir. Bu sınırı aşan iş açık izin bekleyen bloke iş olarak kaydedilir.
- Menü/HUD KISS: onaylı başlangıç ekranı, navigasyon, düzen ve sade renkler korunur; izinsiz yeniden tasarım yok. Karakter ve silah modelleri için bu sadelik kuralı geçerli değildir.
- Onaylı V25 karakter tabanı, en ileri korunmuş parçalar, önceki silah efektleri ve kontrol mekanikleri regresyona karşı korunur. Kullanıcı açıkça değiştirmedikçe harita/oynanış dengesi, hasar, recoil, silah istatistikleri ve sınıf yetenekleri korunur.
- Her iş önceki güncel geliştirme dalından başlar; ana dala eski sürüm ya da test edilmemiş oyun kodu zorla birleştirilmez. Kullanıcı talimatı değişmedikçe aşağıdaki sıra değişmez. Başka işi kendiliğinden öne alma.
- Kod uygulaması ile doğrulanmış kabul farklı durumlardır. Her aşamayı kod, test, sonuç, sınırlama ve commit ile belgelemek zorunlu; geçmeyen test atlanmaz, önce ilgili aşamanın hatası giderilir. Gereksiz mesh, doku, shader ve dinamik ışık artışına karşı ölçüm yapılır.

## 1. Güncel temel

Başlangıç: V273, PR #63, dal art/v273-distinct-muzzle-designs, commit 2d60406b372ccf666c87cd6b0fe15132f6ad7e47. V273 Inline JavaScript syntax check run 45634544142 başarılı. Bu başarı tüm WebGL testleri, FPS ve görsel kabul anlamına gelmez. Önceki karakter/silah paketlerinin entegrasyon testleri ayrıca kapanmalıdır. V274'ten itibaren yeni numaralar yalnız aşağıdaki bot dışı yol haritasına aittir.

## 2. Sabit uygulama sırası: V274–V335 (62 aşama)

### A — Çatışma ve vuruş hissiyatı | V274–V281
- V274: V273 temelini sabitle; önceki onaylı bileşenler, karakter/silah testleri, başlatma ve görsel WebGL kabul eksiklerini doğrula; karşılaştırma ölçümlerini kaydet.
- V275: mevcut isabet noktalarına bağlı görsel vuruş geri bildirimi; hasar ve hitbox aynı.
- V276: yüzey türlerine göre mevcut çarpma efektlerinin görsel ayrışması.
- V277: mevcut parçacıkların okunabilirliği, süreleri ve kaynak limitleri.
- V278: mevcut görsel vurulma tepkisinin animasyon sürekliliği.
- V279: mevcut tracer ve kovan görsel sürekliliği; mermi yolu ve ateş mantığı değişmez.
- V280: V273'ün yedi namlu efektini eş kamera ve gerçek oyun sahnesinde karşılaştır, gerekirse sunum uyumu düzelt.
- V281: üç modda çatışma görsel regresyonu ve maliyet ölçümü.

### B — Silah animasyonları | V282–V287
- V282: silah çekme ve bırakma görsel geçişleri.
- V283: tüfek ve SMG mevcut reload zamanına bağlı el/şarjör görselleri.
- V284: sniper ve heavy mevcut görsel mekanizma hareketleri.
- V285: tabanca ve yardımcı ekipman animasyonları.
- V286: sprint, ADS, taşıma ve duruş görsel geçişleri; recoil veya input değiştirme.
- V287: bütün silahların pose, iptal, ölüm ve kaynak yaşam döngüsü kabulü.

### C — Karakter animasyonları | V288–V295
- V288: mevcut rig, pivotlar ve animasyon temelinin karşılaştırması.
- V289: yürüyüş görsel döngüsü.
- V290: koşu ve sprint görsel döngüsü.
- V291: yana ve geriye hareketin görünüşü.
- V292: çömelme geçişleri.
- V293: yön değişimi ve görsel gövde dengesi.
- V294: mevcut ölüm ve ekipman taşıma görsel hareketlerinin sürekliliği.
- V295: sınıf ve takım varyantları, LOD ve görsel poz kabulü. Bot hareket kararları/pozisyonları dokunulmazdır.

### D — Ses tasarımı | V296–V301
- V296: mevcut ses katmanları ve ses seviyesi temel ölçümü.
- V297: silahların işitsel kimliğinin ayrışması.
- V298: oyuncuya duyurulan mesafe ve ses geçişi kalitesi.
- V299: kapalı/açık alan işitsel sunumu; AI işitme sistemi ve gürültü olayları değişmez.
- V300: ayak, ekipman, isabet ve ortam seslerinin işitsel uyumu.
- V301: karışım, ses sınırları, kaynak temizliği ve regresyon kabulü.

### E — Harita ve çevre | V302–V311
- V302: tüm mevcut haritaları eş kamera, rotalar ve performans ile envanterle.
- V303: Marien çevre yüzeyi ve mimari ayrıntıları.
- V304: Marien mevcut iç mekân sunumu.
- V305: bomba haritası çevre yüzeyi ve mimari ayrıntıları.
- V306: bomba haritası mevcut iç mekân sunumu.
- V307: kurtarma haritası çevre yüzeyi ve mimari ayrıntıları.
- V308: kurtarma haritası mevcut iç mekân sunumu.
- V309: ortak düşük maliyetli dekor ve materyal tekrar kullanımı.
- V310: görünür çevre, siper okunabilirliği ve alternatif rota değerlendirmesi; yalnız görsel düzeltme. Yeni fiziksel rota/siper veya görüş engeli AI davranışını etkileyebileceği için ayrı açık izin olmadan uygulanmaz.
- V311: üç harita görsel, çarpışma, nav ve görüş hattı regresyonu; nav verileri sabit.

### F — Sınıf ve ekipman bütünlüğü | V312–V316
- V312: mevcut sınıf ve yük donanımı envanteri.
- V313: sınıfların görsel/işitsel kimliğini ayırt etme.
- V314: ekipman durumları ve sunum tutarlılığı.
- V315: denge analizi ve raporu; silah istatistikleri, yetenekler, bot seçimleri veya sınıf dengesi değiştirilmez.
- V316: sınıf ve ekipman regresyonu; davranışı etkileyen öneriler açık izin bekler.

### G — Mevcut oyun modları | V317–V324
- V317: ölüm maçı durum ve sunum denetimi.
- V318: ölüm maçı oyuncu geri bildirimi.
- V319: bomba modu görsel görev bildirimi ve durum okunabilirliği.
- V320: bomba modu oyuncu arayüzü ve izleyici sunum kontrolü.
- V321: kurtarma modu görsel görev bildirimi.
- V322: kurtarma modu oyuncu arayüzü ve izleyici sunum kontrolü.
- V323: tur başlangıç/bitiş ve skor sunum tutarlılığı.
- V324: üç modun maç akışı regresyonu; hedef kuralları, bot görevleri, takım dengesi değiştirilmez.

### H — Performans ve optimizasyon | V325–V332
- V325: ölçüm protokolü; aynı kamera/harita/ayarlar ve 0/5/15 bot karşılaştırması.
- V326: kullanılmayan görsel kaynakların envanteri ve güvenli temizliği.
- V327: geometri/materyal/doku paylaşımı.
- V328: var olan görsel LOD ve görünürlük maliyeti.
- V329: görsel efekt havuzları ve kaynak yaşam döngüsü.
- V330: çizim çağrısı, gölge ve GPU bütçesi; onaylı görünüş/ışık korunur.
- V331: uzun maç, yeniden başlatma ve bellek sızıntısı kontrolü.
- V332: performans regresyonu ve karşılaştırmalı rapor. AI optimizasyonu yasaktır; AI kodu, tick, RNG ve davranışlar aynı kalır.

### I — Menü/HUD ve nihai kabul | V333–V335
- V333: mevcut başlangıç menüsü, seçim ekranları, çözünürlük ve tıklama kontrolleri; yeniden tasarım yok.
- V334: mevcut HUD, okunabilirlik, tutarlılık ve kullanıcı onaylı KISS görünümünün korunması.
- V335: nihai V273 karşılaştırması, tüm modlar, 5/15 bot, görsel/performans regresyonu, eksik kabul listesi, güncel indirilebilir HTML. Ana dal birleştirme ancak ayrıca uygun onayla.

## 3. Zorunlu çalışma akışı

1. Her devam isteğinde AGENTS.md ve bu dosyayı güncel daldan oku; ana dalda ayrıca kontrol et. Son onaylı aşamayı ve açık PR/testleri doğrula.
2. İlk tamamlanmamış aşamadan sırayla devam et. Birden fazla ardışık aşama tek pakette yapılabilir; testleri atlama. AI izni yokken AI işi başlatma.
3. Diff'te AI ve diğer korunmuş kodları denetle; oynanış etkisine dair şüphede kapsamı daralt veya aşamayı bloke et. Önceki kodu sessizce değiştirme. Yeni testlerde AI davranışının değişmediğini karşılaştır; testleri gevşetme.
4. Önceki görsel kaliteyi koru. Ölçülen draw call, üçgen, bellek ve kare sürelerini V273'e ve son onaylı aşamaya göre raporla. Aynı sahne ve ayarları kullan; gerçek FPS ölçülmediyse bunu açıkça yaz.
5. Kod ve testleri GitHub'da kaydet; her aşama için durum: planlandı / kodlandı / test bekliyor / kabul edildi / bloke. Gerçek tarayıcı ve regresyon sonuçları görülmeden "tamamen bitti" deme.
6. Kullanıcı talimatıyla plan değişmedikçe sıra, kapsam ve AI kilidi korunur.

## 4. Başlangıç durum kaydı

A: 8/8 teknik kabul başarılı (V281, WebGL 45703821239). B: V282–V286 kodlandı, V287 kabul altyapısı kayıtlı; 6/6 kod/test kapsamı, son teknik kabul bekliyor. C–I: planlandı. Toplam 14/62 kod/test altyapısı, 8/62 doğrulanmış teknik kabul. Sonraki V288, V287 kabulünden sonra. Bot zekâsı: KİLİTLİ — açık kullanıcı izni olmadan başlanmayacak.

### C4 aday dalı durum güncellemesi

V291: kullanıcının açık C4 talimatı ile ayrı aday dalda kodlandı. 28.800 sayısal kontrol ve 40.320 prototip karşılaştırması başarılı; gerçek WebGL/FPS ve V287/C1–C3 kabulü açık. Önceki aşamalar tamamlanmış sayılmaz. Ana dal değişmedi. Ayrıntı: docs/V291_DIRECTIONAL_GAIT_DRAFT_TR.md.

### C5 aday dalı durum güncellemesi

C4 düzeltilmiş inline CI run 45712232088 başarılı (V103 dahil). C4 WebGL ve V287/C1–C3 kabulü henüz doğrulanmadı. V292 aday dalında yerel bacak geçiş eğrileri kodlandı; 947.520 sayısal kontrol ve 118.080 prototip eşitliği başarılı. C5 gerçek WebGL/FPS kabulü açık. Ana dal değişmedi.

### Kullanıcı talimatıyla 10 hata düzeltme ara paketi

01–10 kod düzeyinde ele alındı; ayrı yeni dal açılmadı. 01–06 GitHub statik CI 45725551897 başarılı. 07–10 doğrudan kaynak/DOM adaptörü 101/101 kontrol başarılı; güncel CI ve gerçek WebGL/mobil/FPS kabulü açık. Ayrıntılar docs/CRITICAL_01_03_FIX_TR.md, docs/CRITICAL_01_04_06_FIX_TR.md ve docs/CRITICAL_07_10_FIX_TR.md. Ana dal birleştirmesi yok. AI kilidi korunuyor; ortak fizik/zaman değişikliklerinin doğal oyun sonuçlarına etkisi belgelendi. Önceki C kabul eksikleri açık.

### Entegre kabul ve V288 temel envanteri — 26 Kasım 2026

- Oyun blobu 23f44e05fd1272f138abd84aa937ad2a05faa686: değişmeden korunuyor. On hata paketi CI 45726337157: 86/86 başarılı. PR #68 entegre kabul 45728393201: 3/3 iş başarılı. V287 gerçek sahnede 36 poz; V291 40 ve V292 50 eşli WebGL poz karşılaştırması; V273 yedi namlu profili; üç modda kontrollü fizik, gerçek Three kaynak serbest bırakma, WebGL bellek sayacı ve mobil giriş olayları; gerçek 6v6 açılış/maç/arayüz/akustik/drone kabulü. Sayısal ve tarihsel testler kendi sürümlerinde değiştirilmeden geçti. WebGL2 yazılımsal Chromium, 1440x900 gerçek maç ölçümü 6.9 FPS (tek koşu, donanım FPS veya optimizasyon karşılaştırması değildir); 0 sayfa ve tarayıcı konsol hatası. Tam süreli üç maç ve fiziksel telefon testi yapılmadı.
- B V282–V287 teknik kabul tamamlandı; C4 V291 ve C5 V292 teknik WebGL kabul tamamlandı. C1 V288: V287 rig fabrikası birebir aynı, 9 eski görsel işlev birebir aynı, 5.160 ileri yürüyüş/koşu örneği eşdeğer. Yeni scripts/check-v288-animation-baseline.mjs ile 30 model, 270 pivot, 120 LOD karşılaştırması; CI 45732947151 / historical-visual-contracts 139619156313 başarılı. V288 teknik temel kabul tamamlandı. C2 V289 ve C3 V290 için ayrı geliştirme kaydı bulunmadı; eski yürüyüş/koşu sistemleri vardır ama yeni geliştirme kabulü sayılmaz. Sıradaki C2 ve C3. Düşük hızda kalça açı genliği 1.2–2.1 hızda .20 rad sabit, 5.1 ve 6.8 hızda .58 rad koşu doygunluğu (Assault); bunlar ölçülen görsel eğri özellikleridir, tek başına fizik hatası değildir.
- A 8/8, B 6/6, C 3/8 teknik kabul: toplam 17/62. Donanım FPS ve kullanıcı görsel onayı ayrı. Bu denetimde oyun/AI kodu değiştirilmedi, yeni dal açılmadı, ana dal birleştirilmedi. Yeni PR CI sadece test altyapısını değiştiriyor.

### C kalan beş aşama — V295 bütünleşik görsel katman

V289, V290, V293–V295 kodlandı; V288, V291, V292 korundu. C 8/8 kod kapsamında; 3/8 önceki teknik kabul, kalan beşin 161.815 sayısal kontrolü başarılı. Yeni katman yalnız render sırasında mevcut alt eklemleri ve bağımsız zırh/ekipman parçalarını geçici olarak değiştirip finally ile geri yükler. AI ve rig üretimi birebir sabit, yeni geometri yok, uzak LOD ve opt-in rig korunuyor. Gerçek 30 varyant / 120 çift WebGL kabulü CI 45733955697 üzerinden takip edilir; gerçek FPS ölçülmedi. Ayrıntı docs/V295_CHARACTER_ANIMATION_C_TR.md. Aynı dal, ana dal birleştirmesi yok. D, C teknik kabulü doğrulandıktan sonra.


### C teknik kabul kapanışı / D1 V296 — 26 Kasım 2026

C V295 run [45733955697](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45733955697): integrated-animation-webgl, historical-visual-contracts ve integrated-critical-webgl 3/3 başarılı. A 8/8, B 6/6, C 8/8 teknik kabul = 22/62. Donanım FPS ve kullanıcı görsel onayı ayrı.

D1 SoundEngine salt okunur taban analizi: index.html blob 487e4717e7826fba521312fe8df6875608557b12 değişmedi. scripts/check-v296-audio-baseline.mjs, commit 8dbcf844691a872ac0f95e494e18569571c26794. 151 grafik/sayısal kontrol mock Web Audio ile başarılı: 7 ayrı silah profili × 8 mesafe, 16 yardımcı olay, drone hum yaşam döngüsü, IR seçimi, kanal temizliği ve ses sınırı. Master 0.44, dry 0.90, outdoor wet 0.16, indoor wet 0.34, kompresör -16 dB, limiter -3 dB. Bunlar parametreler; duyulan SPL veya PCM seviyesi değildir.

Bulgular: 22 ses sınırı yumuşak; eşzamanlı 20 uzak atış denemesinde 24 alt kaynak, ardından öncelikli yerel atışla 28 oldu. Crack katmanı 42'de, sub katmanı 48'de kesiliyor; 65 ve üstünde 0.05 attenuation ve 950 Hz alt geçiren filtre sabit. 7 mevcut profil zaten ayrı, V297 yeniden yazım değil işitsel ayrışma iyileştirmesi. Drone hum ayrı yaşam döngüsünde. Henüz gerçek ses kalitesi/clipping sonucu yok.

D1 gerçek Chromium OfflineAudioContext ölçümü 63 örnek (49 silah/mesafe, 14 yardımcı ses), peak/RMS dBFS ve clipping raporu: .github/workflows/v296-audio-baseline.yml, commit 5b28ec4828e11df6cb14af65ce7ef426f3ce286a. Test sonucu henüz doğrulanmadı; D1 kod/test altyapısı tamamlandı, teknik kabul bekliyor; V297 bu kabulden sonra. Yeni dal yok; PR #68 üzerinde aynı dal. AI, RNG, ses çağrıları, oyun ve ana dal değişmedi.


### D V296–V301 bütünleşik ses paketi — 26 Kasım 2026

- V296: önceki 45735710430 işinde Playwright 1.51.1 Ubuntu 26.04 desteklemediği için Chromium kurulumu başarısız; uygulama testi çalışmamıştı. Ubuntu 24.04'e sabitlendi (13db78cbb47e9f3a6424994053aa20316a3929c3). [45735808683](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45735808683) başarılı: 63/63 sonlu, duyulabilir PCM örneği, clipping 0, en yüksek tepe -10.07 dBFS. V296 teknik kabul tamamlandı. Tarihsel test aynı pre-D commit a5e2e379001f441e83413103ee1a257f0d50b73a üzerinde tutulur.
- V297: yedi kimlik için yeni filtre, gain, mekanik ve wet profili. Eski kaynak süreleri, stop zamanları ve fallback korunur.
- V298: sürekli zayıflama/air-cut eğrisi ve eski 42/48 kaynak eşiklerinden önce yumuşak crack/sub sönümü; uzakta eski 0.05 sabit seviye yerine mesafeye göre değişim. Oyuncunun algıladığı ses mesafesi farklı; AI akustik olayları aynı.
- V299: mevcut indoor/outdoor IR'leri iki paralel convolver ve 75 ms hedef zaman sabitiyle crossfade; önceki 55 ms JS timeout ve buffer swap kaldırıldı. Var olan bina algılama çağrıları değiştirilmedi; yeni oda/duvar algısı yok. İkinci convolver maliyeti henüz ölçülmedi.
- V300: metal/beton ve sprint/çömelme sesleri, reload sürtünme, isabet/kill tonu, patlama ve drone mesafe/gövde tonu dengesi. Yeni ortam olayları, ayak sesleri zamanlaması veya harita mantığı eklenmedi.
- V301: 24 uzak / 32 toplam bağlantılı geçici işitsel kaynak bütçesi, master/kompresör headroom, idempotent cleanup ve paylaşılan ses yolunun son katman bitişinde kapatılması. 20 uzak + 30 yerel aynı an sentetik stresinde 24/32 duyulur kaynak; 144 eski zamanlanmış kaynak nesnesi hâlâ mevcut (sessiz kaynaklar bağlantısız, onended ile temizleniyor). 32 bir AudioNode sayısı veya kesin CPU limiti değildir; sürekli drone hum ayrı. Legacy activeVoices kapısı ve eski Math.random çağrı/timing davranışını korumak için kaynak zamanlaması değiştirilmedi. Donanım FPS/CPU ve kullanıcı işitsel kabulü yok.
- Oyun değişikliği commit 54aad7f97a5a2a837f111b6a8584784d82dd4527, blob fcf5ebb43edd21b06106679079e8b7e00f2a6484. SoundEngine dışındaki bütün HTML baytları eşit. Mock WebAudio ile 75.929 kontrol başarılı: mesafe eğrileri, kaynak start/stop ve admission eşitliği, deterministik RNG çekiş sayısı ve kaynak temizliği, 7 profil, ortam geçişi. Gerçek zamanlı AI simülasyonu için entegre PR regresyonu ayrıca gerekir.
- scripts/check-v301-audio-acceptance.mjs commit 146b3b6157af4c9df8056d9946e03edeb07b103e; iş akışı e2f24d9d4c732d38c65716639bd92b3fcd11b52c. 79 eşli OfflineAudioContext vaka (63 mesafe/silah + 14 yardımcı + yoğun + iç ortam), tepe/RMS ve clipping; [45735970415](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45735970415) henüz doğrulanmadı. [45735970435](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45735970435) entegre regresyon, [45735970438](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45735970438) syntax. D 6/6 kod/test kapsamı, 1/6 doğrulanmış teknik kabul; toplam 23/62 teknik kabul. D kalan kabul kapıları açık; E başlamadan sonuçları doğrula. Aynı art/v292-crouch-transition dalı / PR #68, ana dal değişmedi.


### D teknik kabul kapanışı / E ilk yarısı V302–V306 — 26 Kasım 2026

- D V301: 45735970415 audio-baseline, 45735970435 entegre üç iş ve 45735970438 syntax başarılı. D 6/6 teknik kabul; A–D 28/62. V301 tarihsel bütün dosya karşılaştırması artık kendi sabit commitinde çalışır, mevcut SoundEngine'in V301 ile birebir eşitliği ayrıca doğrulanır (b82a233b9c0b82dafc440e817689203995f67127); test iddiaları azaltılmadı.
- V302 üç harita gerçek WebGL temel envanteri: Marien 796 nesne, 49 collider, 2 rampa, 50 nav düğümü, 86 kenar; Tersane 822 nesne, 131 collider, 0 rampa, 208 düğüm, 653 kenar; Cezaevi 576 nesne, 144 collider, 4 rampa, 990 düğüm, 3802 kenar. Eş kamera ve aynı RNG tohumuyla gerçek Chromium/Three r128 karşılaştırması.
- V303 Marien dış yüzey: mevcut asfalt, beton, çelik ve üç konteyner diffuse canvas'ında mikro çatlak, su/mineral izi, metal çizik, kenar bağlantısı/pas ayrıntıları. Geometri veya ışık eklenmedi.
- V304 Marien iç mekân: mevcut depo makine gövdelerine panel/ızgara/bağlantı detayı, mevcut ahşap yük ve raf eşyalarına farklı yüzey kaplaması. İki ortak diffuse doku ve malzeme; bump dokuları paylaşılır.
- V305 Tersane dış yüzey: mevcut asfalt, beton ve metal diffuse haritalarına ayrı endüstriyel aşınma, derz ve fırçalanmış metal detayları.
- V306 Tersane iç mekân: bakım holü makine gövdesi, depolama/east equipment kasaları ve var olan üç iç mekân zemin slab'ına ayrı doku. Üç ortak diffuse doku ve malzeme; yeni mobilya, kapı, bina, rota, siper veya fiziksel engel yok. Sonraki küçük revizyonda zemin repeat 2×3 ve iç malzeme isimleri eklendi (5b6470eb4e67af2b8dfe869b565c0014e42ab654).
- Oyun commitleri 5a95af08859db8b589be2ceb5a8a7b423a7b8d44, 66eb59a2ed46f24e129317a5a8e988a6dbfeafcb, 5b6470eb4e67af2b8dfe869b565c0014e42ab654; güncel blob 3d799008a845ac271ae4106b72f8790b9f1b2317. E etiketli beş blok kaldırıldığında V301 HTML birebir aynı; 12 deterministik doku stili, 3.444 mock canvas kontrolü ve inline JS parse başarılı. Three r128 UUID üretiminde yeni clone'ların RNG tüketimi yalnız senkron görsel işlem içinde yerel PRNG ile izole edildi ve finally ile önceki Math.random geri yüklenir. Oyun RNG çekişi testte aynı.
- İlk gerçek WebGL kabul [45806390431](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45806390431) başarılı: Marien 118, Tersane 299 mevcut mesh doku farkı; Cezaevi 0. Tüm geometri attribute/index, transform, görünürlük, gölge bayrağı, raycast malzeme özellikleri, collider, rampa, nav düğümü/kenarı/adj ve RNG çekiş sayısı eşit. 10 eşli kamera, 20 PNG ve rapor artifact 15109163218; her kamerada draw calls ve üçgen eşit, 0 pageerror. Marien 21→23, Tersane 8→11, Cezaevi 4→4 benzersiz map texture. Bu ilk test 46d2a57f63006e275188ac38cb1219a5d69b542a sürümüne aittir; son repeat/isim ve interior kullanım kontrolü henüz yeniden doğrulanmadı. Yazılımsal tek kare süreleri donanım FPS değildir; ek beş 512x512 RGBA diffuse doku için ham 5 MiB (mipmap dahil yaklaşık 6.67 MiB), gerçek GPU ölçümü değil.
- İlk eski inline CI 45806390398 bomba testinde geometrik mock adaptörünün yeni görsel yardımcıları tanımaması nedeniyle durmuş. Fizik testine yalnız üç görsel bağımlılık adaptörü verildi, 72 mevcut fizik/nav/AI iddiası değişmedi; doğrudan kaynakla 72/72 geçti (f273d9b2bb38352397a1a28e76d9a485b6192cc2). Son testler: [45806530897](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45806530897) V306, [45806530866](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45806530866) syntax, [45806530930](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45806530930) entegre, [45806530886](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45806530886) D regresyon. Son commit kabulü bekliyor; E1–E5 5/5 kodlandı, ilk paket gerçek WebGL başarılı, son revizyon genel teknik kapısı açık. V307–V311 bu kapı kapanınca. Yeni dal yok; PR #68 ve ana dal politikası aynı. AI, fizik, menü/HUD, karakter/silah ve ses kodu korunmuştur.


### E ilk yarısı teknik kabul / E6–E10 V307–V311 — 26 Kasım 2026

- V302–V306 son kabul: 45806530897 V306 WebGL, 45806530866 inline/legacy, 45806530930 üç entegre iş ve 45806530886 ses regresyonu tamamı başarılı. Marien 118, Tersane 299 doku farkı; beş iç mekân malzemesinin kullanıldığı doğrulandı: Marien 7 depo yükü/2 makine, Tersane 3 zemin/1 makine/6 kasa. E ilk beş teknik kabul tamamlandı. A–D 28/62 + E 5/10 = 33/62 teknik kabul.
- V307 Cezaevi mevcut beton ve çelik diffuse canvas'larında mineral akıntıları, derz, küçük çatlak, metal çizik ve bağlantı izleri.
- V308 iki katlı batı/doğu kanatlarının mevcut yüksek duvarlarında mat boyalı alt panel, mevcut endüstriyel kasalarda havalandırma paneli/bağlantı detayı, mevcut kat döşemelerinde birleşim ve aşınma. Üç yeni ortak 512×512 diffuse map/malzeme; mevcut bump dokuları kullanılır. Yeni oda, mobilya, geometri veya engel yok.
- V309 aynı deterministik fabrika türü ve UV/repeat değerlerine sahip beton_weathered 3×2, steel 2×2, wood 2×2 bump nesneleri haritalar arasında paylaşılır. İlk oluşturulan kaynak tutulur, sonraki eşleşen geçici texture kullanılmadan dispose edilir; bu, üretim sırasında oluşan geçici canvas maliyetini kaldırmaz. Beklenen 5 tekrar bump nesnesi daha az, üç yeni diffuse ile V306'ya göre net -2 texture nesnesi; gerçek tarayıcı ölçümü bekler. Kaynak üretim sırası ve mevcut RNG çekişleri korunur; yeni clone UUID'leri yerel PRNG ile izole.
- V310 görsel okunabilirlik: mevcut duvar, kasa, metal ve döşeme malzemelerinin farklı yüzey karakterleri; var olan takım/gate işaretleri, ışık, örtücülük, siluet, alternatif rota, fiziksel siper ve görüş engeli sabit. Yeni rota veya siper önerisi uygulanmadı; AI etkisi için açık izin gerekir. Mevcut görüş kontrolü hasLineOfSight ile 10.685 örnek (her mevcut nav kenarı + harita başına 2048 deterministik çift) planlandı.
- V311 oyun commit 3b16fe6d53a3d40964bcba710adbc83c69e99850; blob 52cbcd183642790fb7cc180c34ce1008a04c039e. Yalnız beş ek işaretli sunum bloğu; çıkarıldığında V306 HTML bayt düzeyinde aynı, yeni Mesh/geometry/light constructor yok, inline parse başarılı. 1.091 deterministik canvas/koordinat/kabartma paylaşım kontrolü başarılı. Bomba 72/72, V90 rescue, V91 branch, V92 asymmetry ve V93 interiors kaynak testleri doğrudan başarılı. İlk ara CI 45809382983/45809383060 eski mock/helper ve bütün-dosya tarihsel parity beklentisi nedeniyle başarısızdı. Beş geometry-only testte yeni görsel bağımlılıklar stub olarak sağlandı, fizik/AI iddiaları değiştirilmedi; V306 gerçek test sabit V306 kaynaklarında tutuldu ve güncel kaynak ek bloklar çıkarılarak ayrıca karşılaştırılır (92859d761ef77c73ba90af04dcb0a98d32bb42ca).
- V311 gerçek WebGL test scripts/browser-v311-map-acceptance.mjs (5d1df9a642f6f1ca22d9e4ae3f5efa5ad09bcdfa, array değer eşitliği düzeltmesi 5047bd5117b79f19f0ad9a9ce4dfd176bece0bac), .github/workflows/v311-map-acceptance.yml. 15 eşli kamera, 30 PNG, gerçek geometri attribute/index/transform, collider/ramp/nav/LOS/RNG karşılaştırması, Marien/Tersane doku fingerprint eşitliği, Cezaevi üç iç kaplama kullanımı ve global texture ID paylaşımı, aynı draw call/triangle bütçesi; nihai sonuç bekliyor. Donanım FPS, GPU bellek ve kullanıcı görsel onayı yok. E 10/10 kod/test kapsamı; 5/10 doğrulanmış teknik kabul, toplam 38/62 kodlandı ve 33/62 teknik kabul. Son V311 kabulünden sonra F V312–V316. Aynı art/v292-crouch-transition ve PR #68, ana dal birleştirmesi yok.


### E teknik kabul kapanışı / F V312–V316 sınıf ve ekipman — 26 Kasım 2026

- E V311 [45809614337](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45809614337) başarılı; 15 eş kamera, 10.685 LOS eşit, 484 Cezaevi mevcut mesh doku değişikliği (66 duvar, 17 kasa, 5 döşeme özel kaplama), Marien/Tersane önceki dokuları eşit, tüm geometri/nav/collider/RNG eşit, üçgen/draw calls değişmedi. Global benzersiz bump 16→11, texture 38→36. 45809614456 syntax, 45809614330 üç entegre iş, 45809614343 V306, 45809614306 ses regresyonu başarılı. E 10/10 teknik kabul, toplam 38/62. Donanım FPS/GPU ve kullanıcı görsel kabulü ayrı.
- V312 envanter: 5 sınıf, 12 tanımlı silah/ekipman kimliği, 11 sınıf slotlarında kullanılıyor; 19 dolu / 1 boş slot. Assault HK416/P320/bıçak/M67 (2), Medic MP7/P320/bıçak/medkit (3), Engineer MP7/P320/bıçak/drone (1), Sniper MRAD/Glock18C/bıçak/boş, Heavy Minimi/P320/bıçak/Carl Gustaf (1+2). Claymore tanımlı ancak hiçbir mevcut sınıfa atanmış değil; silinmedi. Drone 110 HP, 20 s, 40 birim kontrol yarıçapı, 1 charge/life sabit.
- V313 mevcut sınıf HUD rozetlerine beş düşük doygunluklu renk ve Türkçe rol açıklaması; takım IFF, karakter modelleri, menü düzeni sabit. D'deki yedi ayrı silah ses profili ve mevcut medkit/drone olay sesleri korunur. Medic ve Engineer aynı MP7'nin aynı atış sesini kullanmaya devam eder; yapay sınıf atış sesi veya yeni audio/RNG çağrısı eklenmedi.
- V314 mevcut slot-4 alt etiketinde M67 ve medkit kalan/toplam, ağır sınıfta dolu+yedek ve doluyor, sniper boş, drone önceki aktif/hazır/kullanıldı metinleri korunur. Gerçek ammo/charge verisine salt okunur bağlanır; biten özel ekipman görünümü soluk. Drone kumandası mevcut statusBar render sırasında şarjı yokken x ölçeği .16; dost medkit halkası son 4 s içinde mevcut opacity'nin .45–1 aralığına iner. Düşman medkit halkası değişmez; render sonrası finally ile değerler tamamen geri yüklenir. Yeni geometri, materyal, ses olayı, yetenek veya gameplay state yok.
- V315 salt okunur denge tablosu: mevcut primary damage/rpm/mag/reserve/reload ve teorik DPS (damage×rpm/60; isabet %100, menzil/baş çarpanı/bolt/animasyon/mühimmat ve fiilî tetik sınırlamaları hariç). Yeniden doldurma dahil teorik cycle DPS = damage×mag/((mag-1)×60/rpm+reloadTime); ilk atış t=0 varsayımı, gerçek maç dengesi değildir.

| Sınıf | Ana silah | Damage | RPM | Mag+reserve | Reload s | Teorik DPS | Cycle DPS |
|---|---|---:|---:|---|---:|---:|---:|
| Assault | HK416 | 27 | 680 | 30+120 | 1.85 | 306.0 | 183.7 |
| Medic | MP7 | 21 | 860 | 40+160 | 1.65 | 301.0 | 192.2 |
| Engineer | MP7 | 21 | 860 | 40+160 | 1.65 | 301.0 | 192.2 |
| Sniper | MRAD | 92 | 52 | 7+28 | 2.40 | 79.7 | 69.1 |
| Heavy | Minimi | 25 | 740 | 100+200 | 3.10 | 308.3 | 224.7 |

Analiz: Heavy yüksek sürdürülebilir teorik atış, Medic/Engineer aynı ana silah ama farklı ekipman, Sniper yüksek tek atış ve özel slot yok. Bunlar tek başına dengesizlik kanıtı değildir; menzil, gerçek isabet, hareket, yetenek etkisi ve maç telemetrisi gerekir. Hiçbir denge ayarı değiştirilmedi; davranış etkileyen öneriler kullanıcı izni bekler.
- V316 commit 735b40b4b17d4595f53939aef2daa9ca97be04a4, oyun blob a96e71369e215723fd38833c890dce494adbf894. Beş işaretli F bloğu kaldırıldığında V311 HTML byte düzeyinde eşit; inline parse, 371 doğrudan salt okunur durum/geri yükleme kontrolü başarılı. İlk F kod commitinin inline CI 45812099777 başarılı; tarihsel V306/V311 dosya parity testleri F etiketleri ayrı çıkarılarak korunur (b24e5de5466717a377dea8a836f557e6f56fe649 / a2b83dd209fb2c69fee41d3d7d78c75b355b2f09), F testi tam V311→V316 parity'yi ayrıca zorunlu kılar.
- V316 gerçek tarayıcı testi scripts/browser-v316-class-equipment.mjs, commit 0164c3b92460fd90624403182ca6a43369a22a54, controlled camera ve piksel farkı şartı ad7b0d35d1e45fcce935aa2c3475846d68b68fa7, workflow a293ccbb0c1eac3c302d929c828c7274ec8e8f24. Tüm 5 sınıf/20 slot, boş/doluyor/tükenmiş ve drone restore durumları, HUD okuma sonrası oyun state eşitliği, gerçek Three/WebGL controller ve medkit eş render/restore, draw call/triangle eşitliği. Nihai CI henüz doğrulanmadı. F 5/5 kod/test kapsamı; envanter ve denge raporu tamam, son F teknik kabul açık. Toplam 43/62 kodlandı, önceki 38/62 teknik kabul. Yeni dal yok; PR #68 aynı, ana dal birleştirilmedi. G V317–V324 ancak F kabul sonrası.


### F teknik kabul kapanışı / G ilk yarısı V317–V320 — 26 Kasım 2026

- F V316 [45812279533](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45812279533) gerçek WebGL başarılı: 361 kaynak kontrolü, beş sınıf/20 slot, ekipman durumları, controller ve dost medkit 2 eş render farkı ve tam restore; draw calls/triangles eşit. 45812279387 syntax, 45812279535 üç entegre iş, 45812279420 V306, 45812279440 V311 ve 45812280459 ses başarılı. F 5/5 teknik kabul; toplam 43/62.
- V317 ölüm maçı denetimi: MATCH_TARGET_SCORE=50, MATCH_DURATION_SEC=600; mevcut killfeed, hitmarker, skor ve yeniden doğuş aynen korunur. Eski skor şeridinde skor farkı ve hedefe kalan eleme metni yoktu. Hedefe ulaşma, süre sonunda skor üstünlüğü, beraberlik ve respawn kuralları değişmedi.
- V318 var olan fo-bomb-status satırını ölüm maçında da kullanarak oyuncunun takımı önde/geride/berabere bilgisi, son beş elemeye kalınca kalan sayı ve sade renk; tooltip'te hedefe kalan sayı. Yeni panel, ses veya oyun mekaniği yok.
- V319 bomba HUD canlı takım sayıları, kurma/çözme yüzdesi, aktif bomba bölgesi ve mevcut ana zaman göstergesinde planted süresi ceil ile (görsel saniye yuvarlaması; simülasyon saati değişmez). Son 10 saniye mat sıcak ton. Mevcut 150 s tur, 3 s kurma, 4 s çözme, 35 s bomba ve tek can kuralları aynı; oyuncu/AI etkileşim koşulları değiştirilmedi. Kurma/çözme bilgisi mevcut gerçek state'ten okunur, eylem komutu üretmez.
- V320 bomba izleyici HUD'ında mevcut serbest/takım takip kontrol açıklamaları moda göre ayrıldı. Ölü oyuncunun can/dayanıklılık, slot ve ammo panelleri yalnız bomba izleyicisinde visibility ile saklanır; çıkışta önceki değer geri gelir. Takip hedefi, kamera, serbest hareket, tuşlar, takım filtresi aynı. Rescue kendi mevcut görev metnini korur; G320'nin geçici metin/stilleri mod geçişinde temizlenir.
- Oyun commit 8acfd43b78bebdf65b60935f6fe26d8a1c6269ac, blob c10527aa49da125fedcdd7e96d44f9cf4cf43acb. Üç işaretli G bloğu çıkarıldığında V316 HTML birebir eşit. 30.942 doğrudan sayısal/etiket ve state parity kontrolü, inline parse başarılı. V306/V311/V316 tarihsel testleri yeni G blokları ayrı çıkarılarak korunur (adb7be64a36382a5f729c1790fdd3939deb3b898 / 481f8fd1343855da3b6338d9078bdfc700f74065 / 30f748acf1f8d444ef5e6e25f7f557135117d5ba).
- V320 scripts/browser-v320-mode-presentation.mjs (87ac9aa0c7d2a0fb8dd5e0b876b539a39bc9ef6c), workflow 1547a88afb0efb35437cac9b36b758343c2637b8. Chromium'da 1280×720 ve 390×844 DOM durum testleri (Tailwind CDN stub, gerçek CSS layout onayı değildir), 12 durum/viewport: beraberlik, üstünlük, geride, bomb başlangıç, kurma, planted, çözme, takip, serbest, bitiş, rescue geçiş, DM reset. Tam kaynak parity ve read-only state şartları. Nihai CI bekliyor. G 4/8 kod/test kapsamı, toplam 47/62 kodlandı ve 43/62 teknik kabul. G321–324 sonraki paket; gerçek maç ve mobil görsel kabul ayrı. Aynı dal ve PR #68, ana dal merge yok.


### G ilk yarısı teknik kabul / G5–G8 V321–V324 — 26 Kasım 2026

- G320 [45813285670](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45813285670) başarılı: 30.942 kontrol, iki viewport, 12 durum/viewport, 0 pageerror. 45813285587 syntax, 45813285718 üç entegre iş, 45813285643 F316, 45813285679 V306, 45813285624 V311, 45813285634 audio başarılı. G ilk dört teknik kabul; toplam 47/62.
- V321 kurtarma HUD: mevcut esir sayısı ve gerçek discovery/pickup/carrier/saved verisinden esirleri bul, esirin yanında dur, kendi kurtarma yüzdesi, tahliyeye dön, takım tahliyede ve görev tamam durumları. Bilinmeyen oda, konum, taşıyan aktör kimliği açıklanmaz. Mevcut 180 s, 1 s pickup, tahliye ve iki esir koşulları değişmedi.
- V322 kurtarmaya bomba modundaki sade spectator sunumu: elenen oyuncunun HP/SP/slot/ammo panelleri gizlenir, takım/serbest kontrol metinleri ayrılır, çıkışta orijinal visibility geri yüklenir. G320 ile aynı UI sahiplik işareti, mod geçişlerinde geri yükleme. Kamera, hedef seçimi, tuşlar, takım filtresi aynı.
- V323 başlangıç ve sonuç: gerçek süre üzerinden mevcut timer anında yenilenir (10:00 / 02:30 / 03:00), kurulu bomba sonu eski tur sayacına dönmez; sonuç başlığı moda özel, galip ve görev nedeni ayrıştırılır, Derbaran–N.I.U. eleme sırası sabit; kişisel K/D korunur. Mevcut endMatch/respawn/puan kuralları değiştirilmedi. Yeni HUD paneli, geometri veya ses yok.
- V324 oyun commit 884962bd8cfef3ef6cdacced170d7f83f63e8d55 + bomba son saat düzeltmesi c7b02694aa022174e3dba4a76b242092714e3cec, blob 1ab6b5ee7dc8a904a5dff8b8a3dce804258954f5. Beş G324 işaretli blok çıkarıldığında V320 HTML bayt düzeyinde eşit, inline parse başarılı, 5.621 doğrudan sayısal salt okunur kontrolü başarılı. İlk G324 kod commit syntax 45814190909 başarılı. Tarihsel V306/V311/F316/G320 testleri G324 blokları ayrıca çıkarılarak korunur (8a9e5883e4895b485c8a62a0c62b71ced710dc1c / 1e037f1ccec8171639bde943fe233a243d9926ec / 682852dd5fe3a654ec8ce957d0bd1b5e18f32f83 / 1bc6d8b2ffb32bff224d3a36ff77f9568f399cf4). G324 testi tam V320→V324 parity'yi zorunlu kılar.
- scripts/browser-v324-mode-flow.mjs 0fc8f62b54096b18d546bca48d10ff392b971485, ended bomb timer assertion 2759fef613ad199f10c4d9f2d7cd18525b3447f8, gerçek harita geçişleri 30e6aaa6ee0d2b3c7a244aa8ed7d59de2988d9d4; workflow b8e4ec7088a84fd3d4f7e040b6728b0105e69fc9. Chromium iki viewport, gerçek selectFoMap/registerTeamKill/stepFoBomb/stepFoRescue/endMatch fonksiyonlarına kontrollü durum girişi ile üç harita ve mod geçişleri, ölüm maçı hedef/beraberlik, bomba kurma/çözme, esir pickup/iki tahliye, spectator takip/serbest/çıkış ve sabit skor sırası. Bu senaryolu fonksiyon/DOM testi, gerçek zamanlı tam maç veya gerçek mobil CSS görsel kabul değildir; Tailwind CDN stub. Nihai CI bekliyor. G 8/8 kod/test kapsamı, 4/8 teknik kabul, toplam 51/62 kodlandı, 47/62 teknik kabul. H V325–332 G324 kabulünden sonra; aynı dal ve PR #68, main merge yok, AI değişikliği yok.


### G teknik kabul kapanışı / H ilk yarısı V325–V328 — 26 Kasım 2026

- G324 [45814426558](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45814426558) başarılı: 5.621 kontrol, 2 viewport, 18 durum/viewport, 0 pageerror. 45814426716 syntax, 45814426610 üç entegre iş, 45814426576 G320, 45814426627 F316, 45814426600 V306, 45814426591 V311, 45814426585 audio başarılı. G 8/8 teknik kabul, toplam 51/62.
- V325 ölçüm protokolü: V324 sabit kaynak ile güncel sürüm, üç harita × 0/5/15 render-only karakter modeli, aynı seed, kamera, çözünürlük 800×500 DPR1, aynı Three r128/Chromium/SwiftShader, aynı ışık/gölge, mevcut LOD; 1 warmup, ayrı matrix instrument frame, 3 uninstrumented ölçüm ve median. CPU submit ve GPU finish dahil süre ayrı, draw calls/triangles/uploaded geometry/textures, PNG hash, matrix çağrıları, map attribute byte ve LOD sayıları. Sentetik 15 görünür model, gerçek 15 bot AI simülasyonu değildir; yazılımsal WebGL süresi kullanıcı donanımı FPS değildir.
- V326 kullanılmayan map kaynakları: tekrar eden factory geometry envanteri ve sahne referansları değiştirildikten sonra güvenli dispose. Önceki veya mevcut map mesh'i halen referanslıysa dispose yok. Geçici ilk oluşturma maliyeti kalır; üretim RNG/UUID sırası aynı. VFX ve runtime kaynak havuzları H329–331'e bırakıldı. Önceki onaylı malzeme/texture ve var olan E311 paylaşımı korunur.
- V327 Box/Plane/Cylinder/Circle/Sphere/Ring/Octahedron geometry paylaşımı: type, parameters, groups, drawRange ve tüm index/attribute array baytları, itemSize/count/normalized/type eşitliği zorunlu. Morph/instanced/userData özel geometriler dışarıda. Yalnız immutable map meshes; farklı UV/normal/vertex veya parametre birleşmez. Yeni materyal/texture paylaşımına zorlanmadı: mevcut renk/malzeme kimlikleri ve render sırası korundu. Gerçek harita kaynak sayısı/bayt kazanımı WebGL testinde raporlanacak.
- V328 sabit dünya mesh'lerinin yerel matrisi capture sırasında bir kez hesaplanır, matrixAutoUpdate false; normal world propagation/raycast devam eder. Hareketli bomba beacon, esir parçaları, dust ve mesh olmayan objeler dışarıda. C295 far LOD zaten sıfır ikincil katkı veriyordu; level>=2 için gereksiz uzaklık/pose yoluna girmeme eklendi. LOD eşikleri/histerezis/görünür detaylar, ışık/gölge, AI tick ve simülasyon değişmedi.
- Oyun commit 211560d9dd2886f972c3b55f313050087e8ac0e8, blob 6054e3e508e8c065cf7b3b95d4b360d931272b84. Üç işaretli H bloğu çıkarıldığında V324 HTML birebir eşit. 1.004 doğrudan kontrol (eşit/farklı vertex, referanslı dinamik mesh, dispose, freeze) ve inline parse başarılı; ilk kod commit syntax CI 45815468249 başarılı. İlk ara commit eski E/F/G bütün kaynak parity testlerine H blokları henüz tanıtılmadığından başarısız; beş tarihsel test H etiketleri ayrıştırılarak korundu (567723a2d712ec3061a6d9737f09c07f05da267a / 7233cd1f8e9f8cbb4320d36f36eb5b199eb985d4 / 68f6d7681d6688980ae4966d3604a17de7bddd28 / 506bf675219869c651ccac678d82458a6217c43b / 386d03a86f0c9d90b1ef7adf40b275e1495b9c0c). H328 ayrı V324 tam parity şartı içerir.
- scripts/browser-v328-performance.mjs 0d1b1fc2a564e67efa0a79529e6cc765c923a3a8 + gerçek matrix çağrısı instrument 7f27e7dd973954dd8cb280104da0ecc25359edf7, workflow 4a285298c03dbb63ef4611ff5f78c64098ae23d2. 9 eşli render cohort, 18 PNG hash tam eşitliği, 3 harita mesh attribute/local/world/transform ve collider/ramp/nav/LOS/RNG parity, dynamic marker hareket, LOD histerezis, geometri sayısı/bayt ve matrix çağrısı azalması şartı. Nihai kabul bekliyor; ilk iş 45815637335 başlamış, son instrument revizyonu ayrı iş. H 4/8 kod/test kapsamı, 55/62 kodlandı, 51/62 teknik kabul. FPS artışı yüzdesi ya da donanım bellek garantisi yok; H329–332 sonraki paket. Aynı art/v292-crouch-transition/PR68, main merge ve yeni dal yok.


### H ilk yarısı ölçüm kabulü / H5–H8 V329–V332 — 26 Kasım 2026

- V328 [45815637335](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45815637335) ve instrumented [45815755680](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45815755680) başarılı. Üç harita × 0/5/15 render-only model, 9 eşli görüntü hash, draw calls/triangles, geometry attribute/transform/collider/nav/LOS/RNG ve LOD eşit. Dinamik 1/2/6 map nesnesi hareketi korunmuş. Global benzersiz harita geometri 1.676→479 (%71,4 azalma), 1.197 kopya dispose; unique attribute byte toplamı 1.391.884→433.808, 958.076 byte azalma (yalnız array byte ölçümü, toplam bellek değil). Marien 278→124, 795 freeze; Tersane 822→231, 820 freeze; Cezaevi 576→124, 570 freeze. Gerçek render sırasında map updateMatrix çağrısı sırasıyla 796→1, 822→2, 576→6. Son instrumented SwiftShader üç örnek median 15 model: Marien 9,9→9,3 ms, Tersane 9,5→8,4 ms, Cezaevi 8,5→9,0 ms; 5 model Marien ve Cezaevi yavaşlamış. Tek runner/3 örnek, gerçek FPS veya tutarlı hız artışı kanıtı değil. V328 dedicated test, syntax, E/F/G/audio tarihsel işlerinin hepsi başarılı; 45815755677 entegre işler son kontrolde kuyrukta. H ilk 4 özel kabul geçti; tümleşik kabul ayrıdır.
- V329 tracer start/end/dir, hit/impact/explosion/rocket smoke velocity, casing velocity/rotation için sınırlı 256 Vector3 havuzu, WeakSet lease ownership, cap eviction/expiry/clear release ve double-release guard. Geometri/mesh ID, UUID ve RNG çağrıları değiştirilmedi. Mesh pool kullanılmadı: şeffaf çizim sırası/ID ve Three UUID RNG etkisi korunur. VFX sayısı, ömür, görsel materyal, fizik, hasar, noise ve güncelleme sırası değişmez.
- V330 immutable equipment geometry cache (max 16). Her orijinal constructor aynı sırada çalışmaya devam eder, ardından byte-eşdeğer geometry buffer reuse; eski geçici kopya dispose; paylaşılan geometry normal entity release'de dispose edilmez, per-entity material disposal aynı. Mesh kimliği ve tüm materyal, ışık, gölge, çözünürlük, draw order ve efekt cap değerleri korunur. ConeGeometry H328 whitelist dışında; yeni geometri üretim CPU maliyeti tamamen kalkmaz. Draw call veya gölge kalitesini azaltacak riskli değişiklik yapılmadı; GPU buffer residency hedeflenir, gerçek upload/renderer ve shadow draw parity V332 testinde.
- V331 gerçek spawn/updateEntitiesAndFX/clearAllMatchEntities/selectFoMap fonksiyonlarıyla 600 s sentetik FX/ekipman yükü, 12×50 s, üç harita, cap eviction, expiry, clear, lease plateau, geometry cache plateau. Kontrollü QA'da botlar sahneden çıkarılır; gerçek tam AI maç simülasyonu veya tüm yeniden başlatma yollarının leak-free garantisi değildir. Gerçek maç, bot/rig resource lifecycle ve hardware FPS V335 genel kabulde ayrıca ölçülebilir; AI kodu değiştirilmedi.
- V332 paired V328→V332 24 render (48 PNG), 12 reset, seeded RNG parity, deterministic entity-state hash, renderer calls/triangles, actual renderBufferDirect total/shadow draws, texture count, resource plateau. scripts/browser-v332-effects-stress.mjs 280f02c8440d261a2ba0fd6a10cc74e3e1236655, workflow 2e0c5e21b32ddf2b366571be9fda13ead5bd57ca. 2.001 doğrudan Vector3 lease/reuse kontrolü başarılı (2 allocation, 1.998 reuse, 2.000 release, çift release yok). Oyun commit 0511e48d0fe2943138d96a74b12e3bd9477c7ca2 + tarihsel kaynak yorumlarını üretim HTML dışına taşıyan d2b1bbe96f13a875666e6792463e1f1d9c64e960, blob db8c5d0b578dbc0a7c95c4be57f2705531a9fbfa. Sekiz H332 işaretli blok scripts/h332-original-blocks.json (90869eac31f20471fc38b869b3831baae4a9ca0f) ile geri açılınca V328 byte düzeyinde eşit. İlk ara syntax 45816221625 eski kaynak yorumlarının regex call count'a takılmasıyla başarısız; kaynak yorumları üretim HTML dışına taşındı, [45816406404](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45816406404) bütün inline/legacy test başarılı. Tarihsel E/F/G/H328 testleri H332 fixture ile restore, H332 ayrı tam kaynak parity. V332 yeni gerçek WebGL kabulü 45816619378 kuyrukta; yeni tümleşik iş 45816619362 kuyrukta. H 8/8 kod/test kapsamı; 59/62 kodlandı; 51/62 önceki tam entegre kabul + 4 H aşamasının özel test kabulü, H tümleşik kapanış ve V332 kabulü bekliyor. Aynı PR68/dal, main merge yok. I V333–335 H kabulü sonrası.


### H kapanış engeli ve I hazırlık denetimi — 26 Kasım 2026

- Güncel H332 oyun blobu db8c5d0b578dbc0a7c95c4be57f2705531a9fbfa değişmedi. H332 gerçek WebGL 45816743844: FAIL, 24 görüntü çiftinin 20'si eş, Marien active-0/3/6/9 farklı. RNG eşitliği geçilmişti, sonraki iddialar çalışmadı. 48 PNG artifact 15114824759. Kaynak incelemesinde medkit halka ölçeğinin performance.now() ile değiştiği görüldü; farklı koşu saatlerinin görüntü farkına neden olduğu hipotezi test ediliyor (kanıtlanmış kök neden değil).
- 1b1f3658025283996d3fcf0692753647d3e31182: sadece test fixture'ında sentetik 50 ms eş saat, finally ile geri yükleme, medkit halka ölçeği state hash'ine ekli, başarısızlıkta tanı raporu. Önceki 24/24 piksel hash şartı ve tüm diğer kabul iddiaları aynen duruyor. Yeni iş 45817959675 henüz kuyrukta.
- 89eae49c11f954b6b809914347c12a481f37999a: kritik kaynak testi yeni H332 sahiplik sözleşmesine uyumlu: tüm geçici geometri/materyal dispose, ortak materyal ve geometry cache dispose yok, en çok 16 ortak geometri, ilk ısınma sonrası üç reset GPU geometri sayısı tam plateau. Bu değişiklik yalnız QA dosyasındadır. H332 45818079362 ve entegre 45818079347 kuyrukta. Başarısız kabul atlanmadı.
- I333/334 salt okunur ön denetim: mevcut 117 DOM ID, yinelenen 0, 5 sınıf sekmesi, 3 mod seçeneği. V273 başlangıç menüsü markup'ı birebir eşit; selectMenuClass, updateClassMenuPreview, openPauseMapMenu, cancelPauseMapMenu, showPauseMenu, resumeFromPause ve initBots kaynak dilimleri V273 ile eşit. Inline JavaScript parse başarılı. updateBots farkı daha önceki C görsel yürüyüş/çömelme bloğunda; bu I hazırlığında herhangi bir oyun/AI kodu değişmedi. Kaynak eşitliği gerçek CSS, tıklama veya tam maç kabulü değildir.
- I ön test altyapısı: scripts/browser-v335-final-preflight.mjs (735a8db11f51937db47679cc2e1fa02e94ed3408), workflow .github/workflows/v335-final-preflight.yml (db600e6ab9ec12baefc250ec5892c0b3b4c91762). Üç mod × üç viewport, beş sınıf click/key, menu/HUD viewport sınırları, pause/score/map cancel, resize, gerçek Tailwind CSS kontrolü (boş stub yok), V273 karşılaştırmalı 0/5/15 render-only model ve beş örnek median CPU/GPU finish süresi, 18 WebGL PNG. Test fixture'ı production HTML'yi değiştirmez. Native 6v6 roster 11 bot; 5/15 AI maçları çalıştırılmış sayılmaz. Gerçek tam maç, hardware FPS ve kullanıcı görsel kabulü açık. Hazırlık altyapısı I uygulamasının veya kabulünün tamamlandığı anlamına gelmez.
- H final kabulü ve I final testleri henüz geçmedi. I 0/3 teknik kabul, toplam 59/62 önceki kod/test kapsamı; 51/62 önceki tam entegre kabul + 4 H özel kabul. H kapanmadan I oyun kodu değişikliği ve kabul yok. Ana dal ve bot AI değişmedi; yeni dal yok; PR #68 aynı. Güncel aday HTML V332, V335 final olarak etiketlenmemelidir.


### H kapanışı ve I V333–V335 uygulama — 26 Kasım 2026

- H332 [45817959675](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45817959675) ve 45818079362: PASS, 24/24 eş piksel hash, RNG/entity-state/draw/shadow/triangle eşitliği, 600 s kontrollü efekt simülasyonu × 2 sürüm, 12 reset. 179 yeni Vector3, 28.960 reuse, 29.139 release, sıfır açık lease, 8 ortak geometri, 1.072 reuse; sınırlar 256/16. Medkit saat eşitleme fixture'ı ile önceki 4 fark giderildi. [45818079347](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45818079347) bütünleşik 3/3 iş başarılı, yeni ownership/plateau kontrolü ve native 6v6 smoke dahil. H 8/8 teknik kabul, A–H 59/62.
- I preflight 45818320593: ilk masaüstü class/key/click/pause/score/map cancel geçti; resize wait RAF durdurma nedeniyle timeout. cbf2c31ca8f3b7a6237e9433e8b41fe0fee35856: test-only interval polling, gerçek WebGL arka plan capture, üç mod × 5/15 gerçek AI kısa koşu (fixture yalnız roster sayısı/ek isim; üretim AI değişmez). 45818764775: masaüstü üç mod tamam, yatay 844×390 ilk mod pause panel 472 px (y=-41, bottom=431) taşma hatası. Başarısız iddia saklanmadı.
- V333/V334 üretim CSS düzeltmesi 3712657aa3989b2911968282fd4256c8d7b3edfb, blob 8e1ab6ede82a0f43aeb97128744a86ba4db99b83: kısa ekranlarda pause panel kompakt spacing, 100dvh/100vh max-height ve overflow-y; HUD mevcut uzun ammo/weapon metni wrap. Tek FO_I335 responsive-ui CSS bloğu çıkarıldığında V332 HTML byte-for-byte aynı. Üretim JavaScript, DOM markup, sınıf seçim tasarımı, bot AI, oyun dengesi ve dünya görseli aynen kaldı. Inline parse doğrudan ve 45819257421 PASS. İzole Chromium pause fixture 844×390 eski 472 px→330 px (y=30, bottom=360, no scroll), 1280×720 ve 390×844 panel ölçüleri değişmedi; 640×320 taşma yerine scroll. İzole CSS fixture tüm oyun kabulü değildir.
- V335 son workflow 45819257547, üç mod × üç viewport, native 11 bot menü akışı, 5/15 test-fixture AI × üç mod 10 s kontrollü simülasyon, V273 eş kamera 0/5/15 render-only cohort, 18 eş PNG, 5 ölçüm median, exact candidate HTML artifact. Tarihsel E/F/G/H testlerinde tek I CSS bloğu kaynak parity karşılaştırması için çıkarılır; I335 bütün non-CSS byte eşitliğini ayrıca zorunlu kılar. Test ve güncel aday kod kapsamı 62/62, I teknik kabul henüz açık; gerçek cihaz FPS, tam süreli maçlar ve kullanıcı görsel onayı iddia edilmez. Aynı PR #68, yeni dal/merge yok; bot AI kilidi sürer.


## V335 — Nihai teknik kabul kapanışı (26 Kasım 2026)

**A–I: 62/62 uygulama ve planlanan otomatik teknik kabul tamamlandı.** I333/334/335 3/3; önceki A–H 59/59. Doğrulanan kaynak: commit 29e425a905f9e8b89ddb309dac78411124145456, index.html blob 8e1ab6ede82a0f43aeb97128744a86ba4db99b83. Son üretim değişikliği 3712657aa3989b2911968282fd4256c8d7b3edfb yalnız CSS. İki ayrı I335 koşusu PASS: 45819257547 ve [45819427860](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45819427860). Son kaynakta 11/11 iş akışı başarılı: syntax 45819427265, audio 45819427278, G320 45819427283, G324 45819427273, E306 45819427893, E311 45819427271, H332 45819427558, F316 45819427403, I335 45819427860, H328 45819427392, integrated 45819427514 (3/3 jobs). I335 job 139907514001 doğrulanmış PASS. Üç mod × üç viewport (1280×720, 844×390, 390×844), beş sınıf seçimi ve klavye, pause/score/map cancel, resize, HUD temel alanları; 6 gerçek kısa AI fixture koşusu (5/15 bot, üç mod, 10 saniye veya doğal maç sonu), ayrıca V273/current 18 WebGL görüntüsü ve 0/5/15 render-only ölçüm. Test koşulları üretim 6v6 kadrosunu değiştirmez.

İndirilebilir doğrulanmış HTML: [CI artifact 15117246692](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45819427860/artifacts/15117246692), içindeki FRONT-OPERATION-V335-candidate.html oyun dosyasıdır; i335-preflight.json ölçüm raporu ve ekran görüntüleri de bulunur. Artifact adı tarihsel "preflight-not-final-acceptance" olarak kalmıştır, nihai teknik kabul bu kayıtla belgelenmiştir. Sabit kaynak [index.html](https://github.com/zxc28tarik/FRONT-OPERATION/blob/29e425a905f9e8b89ddb309dac78411124145456/index.html). Sayısal FPS karşılaştırması rapor artifact'ında; bu oturumda raporun sayısal değerleri ayrıca okunmadığından FPS artışı iddia edilmez.

Kapsam sınırları: tam süreli doğal üç maç, gerçek fiziksel telefon/donanım FPS, insan görsel/işitsel onayı yapılmadı; bunlar otomatik kısa senaryo kabulünden ayrı tutulur. Bot AI ve davranış kilidi sürüyor; yeni AI işi başlamaz. Main birleştirme ayrı açık onay gerektirdiğinden PR #68 draft olarak korunur; yeni dal yok. A–I için bekleyen başarısız teknik kabul kapısı yok. Sonraki geliştirme yalnız proje sahibinin yeni talimatıyla.


## V336 — Kullanıcı geri bildirimi: silah sesi ve görünümü (26 Kasım 2026)
- MRAD, P320 ve Glock18C için farklı transient, frekans, envelope, mekanik ses ve reverb profilleri. Ses source stop süreleri, RNG ve admission korunur. Yerel gerçek Chromium OfflineAudioContext 35 A/B senaryosu PASS: finite PCM, clipping 0, RNG/voice sayıları eş; diğer dört silahın peak ve RMS düzeyi 0.1 dB içinde eş. İnsan işitsel kabulü ayrı.
- Minimi ön nişangahına namluya görsel olarak bağlı destek, açık üst koruyucu ve daha küçük yeşil uç; P320 sürgü satin koyu materyal, instanced yüzey detayları, üst chamber detayı, tetik muhafazası görsel bağlantısı. Sadece birinci şahıs modelinde; silah denge/hasar, recoil, ADS hizalama, muzzle/eject anchor, AI ve diğer modeller değiştirilmez. Ek visual UUID üretimi izole, eski match RNG çağrıları korunur; V336 testinde doğrulanacaktır.
- Beş işaretli V336 ek bloğu çıkarılınca V335 HTML byte-for-byte aynı; yerel inline JS parse PASS. Güncel HTML blob 2bd67f6b7e36f0a2e44c0d6d3ff3225e0b3cdca7. Tarihsel kabul scriptleri aynı strict source parity için V336 bloklarını ayırır; V336 gerçek Three/RNG/anchor ve WebGL capture/PCM dedicated workflow bekliyor. Üretim AI kilidi, aynı PR #68, no main merge.


## V339 — Kullanıcı hata incelemesi A paketi (26 Kasım 2026)
- Kullanıcı kararları: #3 MRAD dürbün içinde namlu parlaması olmaması sorun değil; #4 mühimmat yenileme ve #5 hızlı yeniden doğma test için korunur; #10 dokunmatik izleyici kamera şimdilik korunur. Kalan A: #1–2, B: #6–7, C: #8–9. Yalnız A üzerinde çalışıldı; B/C bekliyor. Bot AI kilidi sürer.
- V338'deki yerel MRAD/tabanca VFX ayarları dahil edildi; silah boyutu değişikliği yok. Minimi üç düzlem, .190 uzunluk/.116 genişlik, 8 üçgen; V338 geometrik düzlem alanına göre +98.77%; ADS yalnız oyuncu Minimi enine ölçek .68, opacity çarpanı .84. HK416 profil/atlas tasarımı aynen korunur. Paylaşılan Minimi efekt geometrisi görsel olarak değişir; bot ateş zamanlayıcısı/AI/hasar değişmez.
- Oyuncu efektinin ilk render submission'a dek ömrü tüketilmez; renderer.render sonrasında latch kaldırılır. Ölüm/pause/maç sonu/yeniden modelleme temizler. Tek mesh/materyal/atlas yeniden kullanılır. Yerel kaynak fonksiyonları minimal Three test double ile 392/392 kontrollü senaryo PASS (5–240 FPS eşdeğer adımlar, 1/2/5/10 alt adım, ADS/hip, 7 silah), inline JS syntax PASS. Gerçek tarayıcı görsel kabul ve yeni CI henüz bekliyor; FPS ölçümü değildir. V339 7 tagged blok çıkarıldığında V336 kaynak birebir eş, oyun blob bd5f04f57d73bbabde8b6803cd2109fd2d8f842c. Tarihsel kaynak testleri yalnız işaretli yeni blokları ayırır; güncel V273 testine gerçek Three üzerinden 392 yeni koşu eklendi. V336 önceki 12/12 CI başarılı. Aynı PR #68; main merge yok.


## V340 — Kullanıcı MRAD sesi / MP7 optik bağlantısı geri bildirimi
- V339 12/12 CI başarılı (integrated 45825942955, I335 45825943271); A paketi otomatik test kabulü tamamlandı. B (#6–7), C (#8–9) sonraki kullanıcı talimatına dek bekliyor.
- MRAD için düşük Q'lu pink-noise gövde, daha kuru transient/reverb, bas sweep zarfı erken sönümleme. Source başlangıç/bitiş süreleri ve RNG/voice sayısı korunur. İlk yerel audio denemesinde çift buffer ataması InvalidStateError verdi; tek koşullu atama ile düzeltildi. Son Chromium 35 A/B offline senaryosu PASS, clipping 0, diğer 6 silahın peak/RMS farkı <=0.1dB, RNG ve voice sayıları eş. MRAD yerel peak -17.5→-22.5dBFS; ses kalitesi öznel, kullanıcı onayı ayrı.
- Medic/Engineer ortak MP7 modelinde mevcut riser altı y=.060, ray diş üstü y=.0385, .0215 boşluk. Mevcut riser scale.y=2.85, position.y=-.0111 ile altı .0378: dişlerle .0007 örtüşme; optik grup/mercek/reticle/muzzle/eject/ADS hizası, mesh sayısı ve RNG korunur. Yeni geometri yok. Kaynak hesabı ve inline syntax PASS; gerçek model görsel kabulü bekliyor.
- Dört V340 bloğu çıkarılırsa V339 byte-for-byte aynı; game blob f31ed83bf77c30dba43b46cbba1f3852595aa159. Tarihsel kaynak parity testleri işaretli V340 farkını ayırır, yeni V340 özel geometri+audio testi eklendi. Bot AI, hasar, test kolaylıkları ve önceki namlu efektlerine dokunulmadı. Aynı PR68, main merge yok.


## V341 — MRAD atış sonrası sürgü sesi geri bildirimi
- V340 özel Three/PCM testi 45827394294 PASS. Kullanıcının yeni açıklamasına göre sorun ana atış değil, 260 ms sonra tetiklenen playBoltCycle içindeki dört square oscillator. Bunlar mevcut white/pink noise buffer'larından bant filtreli kısa metal tıkırtısı/kayma sesleri ile değiştirildi. Normal çalışan audio init yolunda dört oscillator yerine dört buffer source; aynı event start/stop, voice admission/cleanup, shared RNG, oyun zamanlayıcısı ve ilk atış source kodu. Eski yol yalnız noise buffer yoksa fallback. Başka ses, görsel, silah davranışı veya bot AI değişmedi.
- Yerel Chromium OfflineAudioContext: 33/33 A/B koşusu PASS; 21 değişmeyen atışta peak/RMS farkı <=0.05 dB, 12 bolt ve birleşik MRAD testinde 4 oscillator→4 buffer, ilk 250 ms enerji farkı <=%0.2, clip 0, RNG/voice/start/stop eş. İlk PCM hash kontrolü tarayıcı örnek yuvarlama düzeyinde kararlı olmadığından sayısal tolerans kullanıldı; bitwise PCM eşitliği iddia edilmez. Tek V341 tag çıkarıldığında V340 byte-for-byte eş. Sesin öznel beğenisi kullanıcı testi. #8 pause/switch zamanlama sorunu ayrı C paketinde bekliyor. B/C diğer maddeleri korunur. Aynı PR68, main merge yok. Game blob 4a0af0d03f17660e52bf93f8a6fb3762fccc1850.


## V342 — Carl Gustaf / MP7 atış sesi ve MP7 optik gövdesi
- Kullanıcı geri bildirimi üzerine yalnız MP7 ve Carl Gustaf ses profilleri yeniden tasarlandı; yerel mekanik kare dalga yerine kısa filtreli noise, bas zarfı erken sönümleme, farklı crack/body ve yankı ayarları. Diğer silahlar, MRAD bolt sesi, AI ve oyun mekaniği aynı. 35 yerel Chromium OfflineAudio A/B senaryosu PASS: finite PCM, clipping 0, RNG/voice eş, diğer beş silah peak/RMS farkı <=0.1dB. Carl Gustaf burada atış sesi; ortak patlama sesi değişmedi. İşitsel beğeni kullanıcı onayı ayrı.
- MP7 micro red dot açık, tek yüzlü eski cylinder yerine aynı mesh üzerinde kapalı iç/dış cidarlı, iki uç halkalı LatheGeometry (24 segment). Mercek, reticle, optik tabanı, model pozisyonu ve muzzle/eject/ADS anchors aynen; eski geometry dispose, UUID korunur, ek RNG izole. Geometri gerçek Three/oyun içi görüntü doğrulaması henüz bekliyor.
- Üç V342 tag çıkarılınca V341 kaynak byte-for-byte aynı; inline JS parse PASS. Game blob 8b955a0cc5e0bbac151b975f777c04b238c62036. Tarihsel testler V342 tag'lerini yalnız tarihsel source parity için ayırır; özel V342 testleri güncel kaynak üzerinde çalışır. V341 özel bolt PCM 45828125199 başarılı. B (#6–7), C (#8–9) bekler; kullanıcı tarafından korunan #3/4/5/10 ve bot AI kilidi aynen. Aynı PR68, main merge yok.


## V343 — Drone patlama sesi ve bomba görselleri
- V342 15/15 CI başarıyla tamamlandı. V343 yalnız kullanıcı istediği patlama sunumunu değiştirir. Kamikaze drone DETONATED/DESTROYED mevcut tek-resolution patlama çağrısında özel iki noise-source ses; normal patlama sesi, iki voice ömrü 1/.75 s, RNG, ses yayılımı ve AI noise olayı korunur. 24 yerel Chromium OfflineAudio A/B karşılaştırması PASS (6 mesafe x 2 ortam x 2 karşılaştırma); clipping 0, voice/start/stop/RNG eş, generic peak/RMS <=.1 dB. Özel drone sesinin öznel kabulü açık.
- M67, Claymore, Carl Gustaf ve drone mevcut partiküllerine iki ateş sprite, dört duman sprite, tek 18 point kıvılcım katmanı eklenir. C4 süre dolumunda site merkezinde yalnız görsel patlama; winner/reason/puan ve hasar değişmez. C4 sonuç ekranı aynı anda açıldığından görüşü örtebilir. 4 slot üst sınırı, 2 ortak 64x64 texture, sabit mesh/materyal kaynakları yeniden kullanılır; ilk render korunur, 1.05 saniye render zamanı içinde söner. Match reset sahneden çıkarır. Yerel mock Three testi 20 spawn, 30 reset, ilk frame/fade/expiry/RNG/slot reuse PASS; gerçek Three/WebGL/ci FPS doğrulaması henüz açık.
- 7 V343 tagged blok çıkarılınca V342 byte-for-byte eş; local syntax PASS. Game blob f451946244888e5f9499883acee6327d02eb7fe9. Tarihsel parity testleri yalnız V343 tag ayırır; yeni test güncel kaynak. AI kilidi, B/C bekleyen hata paketleri, test kolaylıkları korunur. PR #68 aynı, main merge yok.


## V344 — B paketi: asker kaynak temizliği ve kendi bombasıyla ölüm
- V343 16/16 CI başarılı (özel patlama 45830500836, integrated 45830500634). B #6/#7 kodu eklendi, C #8/#9 sırada. Yeni maçta eski rig teardown ve scene.remove sonrası foV344ReleaseRetiredSoldiers: SOLDIER_SHARED, SOLDIER_V11_DETAIL_GEOMETRIES ve V273_MUZZLE_ASSETS cache ağacında Map anahtar/değerleri dahil koruma; canlı sahne kaynakları korunur. Eski root'lardaki özel geometry/material tekil dispose. Texture'lar dispose edilmez, ortak asset cache değişmez. Yeni geometri, RNG, AI, animasyon/hasar değişikliği yok. Yerel mock 30 reset, 90 özel kaynak dispose; ortak/cache/live kaynaklarda 0 dispose. Gerçek Three/WebGL kaynak testi yeni CI'da bekliyor.
- Oyuncunun kendi patlama hasarı (isBlast && attackerName===player.name) ile ölümü, ölüm sayacı, 3 saniye respawn timer, input temizliği, tek canlı mod spectate, dead target cleanup korunarak yalnız düşman kill metric/score yolunu atlar. Killfeed kendi takım renginde. Rakip kaynaklı ölüm eski yolu aynen izler. Yerel 18 izole ölüm senaryosu PASS (3 mod, self/enemy, lethal/nonlethal, blast/bullet; tekrar ölüm yok). #4/#5 test kolaylıkları korunur; #3/#10 kullanıcı kararı korunur. AI kilidi sürüyor.
- Üç V344 tag çıkarılınca V343 byte-for-byte aynı, inline JS syntax PASS. Game blob 969432fb88c61b824ee6836df40006a64cdd3065. Tarihsel exact source testleri V344 tag ayırır; özel V344 testi güncel kaynakla çalışır. PR68 aynı, main merge yok; gerçek cihaz FPS veya tam maç kabulü iddia edilmez.


## BOT-KISS — Yeni bot yaklaşımı ve salt okunur ön inceleme (26 Kasım 2026)

Proje sahibi geri bildirimi: önceki AI geliştirmeleri oynanışı kötüleştirmiş olabilir; daha agresif, az düşünen, kararlı; harita ve göreve göre farklılaşan botlar isteniyor. KEEP IT SIMPLE yaklaşımı beğenildi. Bu onay tasarım yönüne ilişkindir; AGENTS.md'deki açık AI değişikliği izni gereksinimi korunur. Bu kayıt salt okunur teşhis/plan; oyun kaynak kodunda veya AI'da değişiklik yok. Önceki C paketi (#8/#9) iptal edilmedi, bekliyor.

### Korunacak referans
- V344 commit 5fd037e83cb0aa77a5ff997b610e1b17c04f0486, index.html blob 969432fb88c61b824ee6836df40006a64cdd3065. V344 17/17 CI başarıyla tamamlandı. Özel asker temizliği ve ölüm puanı dahil. Bu sonuçlar botların eğlenceli olduğunu kanıtlamaz.
- Aynı PR #68 ve mevcut geliştirme dalı. Main merge yok. Yeni dal yok. V344 sabit commit, geri dönüş ve A/B referansı.
- Silahlar, karakterler, animasyonlar, haritalar, sesler, hasar, oyuncu kontrolleri, HUD ve #3/4/5/10 kararları korunur. Görüş, fizik, dost ateş hattı, gerçek mühimmat ve görev kurallarını gevşetme. Orta nişan oturma hızı (0.34 s), önceki zorluk dağılımı korunur; ayrıca açık onay olmadan değişmez.

### İlk kaynak incelemesi (V344 satırları; oynanış etkileri henüz ölçülmedi)
1. L17369–17545: directCombat/openingPriority/followThrough/holdContact, retreat/cover/flank ve dodge birbirinden farklı değerlendirmeler. Görüş veya ateş hattı kaybında farklı kararlara geçiş riski. Açık ateş hattında directCombat zaten mevcut; yalnızca global agresiflik katsayısı eklemek sorunu çözmez.
2. L16818–16881: cover RETURN/HOLD/OUT/AIM döngüsü; varsayılan .85 s hold/1.65 s peek, başarısız peek tekrarları; coverFire false, retreat/flank ve hız kapıları ateşi keser. Siper süresinin bir kısmı meşru; ölçmeden silinmez.
3. L17300–17320 ve L17800 civarı freshLostContact: son doğrudan temas için .75 s hareketsiz bekleme; süre ve görev bağlamı ölçülmeli.
4. L17975–18030: kapı/sniper/engineer düğümlerinde 5.5 s hold; TDM için sınıfa göre değerlendirilir, görev savunmasına aynen genellenmez.
5. L16584–16606: behavior kind değişimi stuck/unstuck/passage/routeProgress bilgilerini temizler. Geçerli rota için sık geçişte ilerleme kaybı riski; fizik doğrulamaları korunur.
6. L17965–18010: squad rally/formation, 6.5–28 mesafede destek planı ve rota yoksa sıfır hız; bu dalın temas/ilerleme etkisi ölçülür.
7. L17545–17610, L18055–18130: ateş kararı hareket/look arbitration öncesinde; görev retry, cover phase, fire-lane recovery ve look ownership etkileri. Tek yetkili plan ve görünür hedef önceliği; gerçek ateş/nişan güvenlik kapılarını koru.
8. L9565–9635 ve L9707–9764: bomba ve rescue zaten ayrı görev emirlerine sahip. L16070, L16792 ve L18125: harita momentum varsayılanı deneysel olarak kapalı; rescue çağrısı marien fallback kullanıyor; harita bakışı köşe hızını 2.6 ile sınırlıyor. Yeni sistem mevcut görev ayrımlarını yok etmez, harita ve rol bazında ölçer.

### Aşama sırası
- BOT01 — referans/ölçüm. V344 aynı seed, aynı roster, mod, maç başlangıcı ve simülasyon adımı ile karşılaştırma; var olan BOT_METRICS ve test-harness üzerinden doğal maçlar. Önce baseline üret. Ölçüm için üretim davranışını değiştirme. Mevcut 11 bot doğal kadrosu; 5/15 fixture ayrı. 3 mod, her mod için önerilen en az 5 seed, tam maç ve sabit süreli senaryo. İnsan oyuncu izlenimi ayrı kabul.
- BOT02 — karar sadeleştirme: yalnızca izin sonrası. Gereksiz tekrar/çakışan state kararlarını azalt, tek yetkili davranış seçimi; önce sabit senaryo ve A/B. Yeni katman yığma.
- BOT03 — temas devamlılığı/agresiflik: gözlenen hedef ve gerçek ateş hattı varsa kararlı çatışma; kısa görüş kaybında son bilinen bilgiye göre devam; gereksiz siper/hold azalt. Görünmeyen hedef bilgisi, snap-aim, hasar, atış hızı değişikliği yok.
- BOT04 — rota/movement: geçerli rotayı gereksiz yenileme ve dur-kalk azalt; collision, kat/merdiven, dost ayrımı ve recovery kontrollerini koru.
- BOT05 — sınıf: Assault öncü; Medic hareketli destek; Engineer görev/ekipman; Sniper mesafe; Heavy baskı. Bunları minimal parametreyle ifade et, aynı ek karar ağacını beş kez kopyalama.
- BOT06 — mod/harita: TDM aktif temas arama; bomb saldıran hedef ilerleme, savunan bölgeyi tutma, plant/defuse ve retake; rescue kurtaran ilerleme, koruyan savunma, escort/çıkış. Dar koridor, açık alan, katlı bina için nav verisinden basit profil. Görev ilerlemesi ve savunma korunur.
- BOT07 — doğrulama/denge: V344 A/B, aynı test koşulları; gerileme varsa paketi geri al. Kullanıcı oyun içi kabulü ve açık main merge onayı olmadan ana dal değişmez.

### Önerilen kabul metrikleri (hedef, henüz ölçüm değil)
- Görünür ve fiziksel olarak ateş edilebilir, mühimmatı bulunan temas başına ilk atış süresi; kaçırılan ateş fırsatları; shots/engagedSeconds; K/D tek başına kalite değildir.
- Geçerli sebepsiz davranış/rota değişimleri ve hedef kayıpları; sıkışma ve recovery sayıları/100 alive seconds; siper yaklaşma/bekleme süresi; boşta kalma (görev bekleme ve reload hariç).
- Mod bazında görev tamamlama/ilerleme: plant, defuse, retake, rescue, escort, maç sonuçları ve süre. Saldırı/savunma, sınıf, harita, difficulty ayrı raporlanır.
- A/B başlangıç hedefi: gereksiz beklemeyi ve karar değişimini azalt, ateş fırsatını iyileştir; görev başarısı, collision/LOS/ammo ve görsel/işitsel regresyon olmamalı. Sayısal kabul eşikleri baseline ölçülünce sabitlenecek. Bir seed veya kısa test ile genel başarı iddia etme.
- BOT01 kaynak teşhisi ve plan tamamlandı; baseline doğal maç ölçümü açık. BOT02–07 bekliyor, üretim AI kilidi korunuyor.


### BOT01-A — Ölçüm altyapısı (26 Kasım 2026)
- V344 referans HTML yerel git hash-object ve GitHub blob eş: 969432fb88c61b824ee6836df40006a64cdd3065. Üretim index.html değiştirilmedi. 15 doğal kadrolu 11-bot maç: deathmatch/Marien, bomb/Tersane, rescue/Cezaevi x 471001/471002/471003/831017/831031. Aynı sabit kaynak, seed ve .05 s simülasyon adımı; doğal süre/puan/objektif sonlandırma, yapay skor reseti yok. 60. saniye ortak kontrol noktası (erken biten maç kendi sonuna dek). QA-only gate instrumentation mevcut değişkenleri okur, AI helper'larını ek çağırmaz; davranış değişimi, bekleme/hareket, gerçek atış, görüş ve mühimmat uygunluğu, ilk atış gecikmesi, engelleyici ateş koşulları, cover/stuck/objektif ölçümleri. İlk-atış süreleri sadece ateş edilen temaslara ait; ateş edilmeyen ve maç sonunda kesilen temaslar ayrıca sayılır. Boşta kalma proxy'si gerçek gereksiz beklemeyle özdeş değildir. Harita/görev birbirine bağlı, bağımsız harita etkisi bu deneyden çıkarılmaz.
- Yerel CDN DNS çözümleme kapalı: gerçek Chromium/Three maç koşusu yerelde tamamlanamadı. GitHub matrix ve toplama raporu hazır; CI çalıştırma ve sonuçlar ayrı kabul kapısı. Sessiz test (AudioContext kapalı), RAF durdurulmuş, pasif oyuncu; gerçek zamanlı oynanış, ses RNG'si, fiziksel FPS veya kullanıcı beğenisi ölçümü değildir. Eşleştirilmiş adaylar aynı koşulları kullanacak. Adayın kaynak dosyası yalnız BOT01_GAME_FILE test argümanıyla seçilir; baseline default sabit V344. Üretim AI kilidi ve C paketi korunuyor.


### BOT01-B — Ölçüm sonuçları ve BOT02 öncelikleri (26 Kasım 2026)
- BOT01 CI run [45835672474](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45835672474), 15/15 doğal biten maç ve summarize job 139965569466 PASS. V344 referans blob 969432fb88c61b824ee6836df40006a64cdd3065. Özetin tam makine okunur kopyası docs/bot-kiss/v344-baseline-summary.json; özgün test artifact'ları ilgili run'da. Ölçülen 46903 bot atışı, 3501 isabet. Bu QA başarıları bot kalitesi kabulü değildir.
- TDM: moving %36.25, quiet non-mission idle proxy %8.43, accuracy %6.94, median first shot .60s (yalnız ateş eden temas), lane+ammo uygun temasta ateş oranı %84.71, davranış geçişi/100 canlı saniye 29.9164, stuck recovery/100 canlı saniye .1186. Heavy 50.0883 geçiş/100s, Medic 33.356; Medic idle proxy %20.25. 3 mavi / 2 kırmızı galibiyet. Siper yaklaşma+hold 6.1796/100 canlı saniye; siper tek başına ana neden olarak doğrulanmadı. Ateş kapısı dağılımı cooldown %58.56, ammo %18.45, ready %14.23, reaction %3.35, aim %3.36, lane %2.05; cooldown doğal atış temposudur, ready doğrudan atışla eşdeğer değildir. Ammo snapshot, reload ve shot gate ölçüm sınırlamaları vardır.
- Bomb: moving %48.38, isabet %21.79, first shot .60s, geçiş 9.6527/100s, stuck 6.0286/100s; Assault 13.0355 stuck/100s. 4/5 plant (hepsi B), dördü defuse; 1 süre doldu, 0/5 mavi galibiyet. Mevcut plant becerisi korunmalı; özellikle görev rotası ve post-plant savunma incelenmeli. Pasif oyuncu nedeniyle takım dengesi hakkında genel sonuç çıkarılmaz.
- Rescue: moving %47.06, accuracy %13.37, first shot .65s, geçiş 8.0138/100s, stuck .577/100s; 3/5 iki esir kurtarıldı, 2/5 hiç keşfedilmedi. İşleyen kurtarma rotaları korunmalı; başarısız seed 471001 ve 831031 ayrı araştırılmalı.
- BOT02 önceliği: TDM Heavy/Medic davranış churn'ü ve destek/hold dallarının sadeleşmesi; botlara yeni bir global agresiflik ağacı ekleme. Bomb stuck ve görev sonucu BOT04/BOT06'da ayrı ele alınır; mevcut görev koruması BOT02'de kaldırılmaz. Isabet ve nişan süreleri ayarlanmaz; RPM/cooldown/ammo kuralları korunur. BOT03'te ateş fırsatı oranı ve hareketli temas kalitesi, BOT05'te sınıf farkları. BOT01 referansı tamamlandı; ilk A/B eşikleri öneri (onay ve aday çalışması bekler): TDM geçiş/100s en az %20 azalmalı (<=23.93312), Heavy geçiş en az %25 azalma (<=37.566225), Medic non-mission idle proxy <=%16.2; lane-contact ateş oranı en az baseline eksi 2 puan, first-shot median artışı <=.05s. Bomb/rescue görev başarıları baseline'dan kötüleşmemeli (plant >=4/5, rescue >=3/5), stuck artmamalı; gerçek görüş/fizik/ammo kuralları sabit. 5 seed küçük örnek olduğundan eşikler otomatik kabul değil inceleme kapısıdır; doğrulama seed'leri ve insan oyunu ayrı gerekir.
- Sınırlar: hızlandırılmış .05s adım, sessiz, pasif insan, sabit 11 bot, gerçek donanım FPS veya kullanıcı kalitesi ölçülmedi. Harita ve mod birlikte değişti. Hareket etmeyen süre doğrudan kötü karar değildir (nişan, savunma, reload, drone). BOT01 tamamlandı, BOT02 tasarım önceliği hazır, AGENTS.md gereği üretim AI değişikliği açık izin bekliyor. C paketi hâlâ bekliyor. index.html değiştirilmedi, main merge yok.


### BOT02-A — Salt okunur uygulama tasarımı
- BOT01-B tamam. V344 L15925–15944 ve L17842–17884: Medic hasta seçimi hp<75, mesafe<20 ve hasta sadakati puanına bağlı, abilityCooldown'a bağlı değil. Doğrudan ulaşılabilir hastaya <=2.5 mesafede speed=0; medkit yalnız cooldown<=0 iken deploy ediliyor, sonra 14s cooldown. Dolayısıyla faydalı heal bekleme ile gereksiz bekleme ayrılmalı; %20.25 idle proxy'nin tamamını bu nedene atfetme. L14650–14683 medkit ömrü 18s; aktif medkit çevresindeki gerçek iyileşme de korunmalı. Öneri: mevcut medkit işini sürdür veya gerçekten yeni medkit kullanılabilecek hastayı seç; yeni tedavi yapamayacaksa mevcut ilerleme/araştırma yolu devam etsin. Heal miktarı, mesafesi, cooldown ve hasta HP sınırı değişmez.
- Heavy: L17369–17400 directCombat ateş hattı+mag/reserve kontrolü; hat yok ve HP<52 ise retreat. L16967–16975 baskı varken heavy/sniper için sınıf özel cover koşulu. L16584–16606 kind değişiminde yerel recovery reset; geçişlerin gerçek kökeni henüz transition-pair örnekleriyle ayrıştırılmadı. Öneri: görünür hedef kaybolmadığı sürece kısa ve geçici hat kaybına karşı mevcut temas planını koru; gerçek engel, mühimmat tükenmesi ve gerekli geri çekilme için mevcut güvenli yol; gereksiz cover yeniden seçimlerini azalt. Kendi başına cooldown, nişan veya isabet artırma yok. TDM ilk aday kapsamı; bomba/rescue görevleri ayrı aşamada.
- BOT02-1 Heavy temas sürekliliği, BOT02-2 Medic destek uygunluğu, BOT02-3 eşdeğer/redundant directCombat/opening/followThrough kararlarının kontrollü sadeleşmesi, BOT02-4 aynı BOT01 seed/roster/harness ile A/B. Önerilen küçük izolasyon testleri: geçici vs kalıcı ateş hattı kaybı; canlı hedef değişimi; şarjör/rezerv yok; ciddi yaralanma; medic cooldown aktif ve gerçek iyileşme sürüyor vs bitmiş; yeni hasta, erişilemez hasta; objective role korunması; gerçek LOS/ally lane/reload kontrolleri. Sonuç ölçüleri BOT01-B eşiklerine göre. Karar kodunu değiştirme yetkisi açıkça verilene kadar bu yalnız tasarım; yeni aday, test edilmiş değişiklik veya BOT02 kabulü yok.
- V344 HTML blob 969432fb88c61b824ee6836df40006a64cdd3065 değişmedi. AGENTS.md AI kilidi aynen. PR68 aynı, main merge yok.


### V345 / BOT02-1–2 — İlk izinli sadeleştirme adayı
- Proje sahibi açıkça "Botları geliştirmeye izin veriyorum." dedi. AGENTS.md BOT-KISS kapsamında güncellendi. V344 referansı değişmez. İlk aday yalnız TDM; bomb/rescue ve diğer sınıfların ilgili davranışları korunur. C paketi (#8/#9) bekler.
- Heavy: gerçek directCombat kontrolü aynen çalışır. Aynı görünür hedefte son gerçek açık hattan itibaren en fazla .65 s, HP>=52, mevcut mühimmat varken temas kararı korunur. Hedef değişimi, mühimmat yokluğu, yaralanma veya süre dolumu grace'i bitirir. Gerçek fireLaneClear, aim, reaction, cooldown, mühimmat ve dost hattı değişmez. .65 s, mevcut .38 s lane recovery başlangıcına fırsat vermek için seçildi; A/B ile değerlendirilecek.
- Medic: TDM'de abilityCooldown>0 ise yeni hasta seçmez; aktif dost medkit bir sonraki healTick'e yetişebiliyor ve mevcut foMedkitReachable kontrolü geçiyorsa ikinci paket için aynı hastaya gitmez. Mevcut medkit bağımsız çalışır; heal, 18 s ömür, 14 s cooldown, mesafe ve HP değerleri aynı. Bırakılan destek rotası eski hasta düğümüne gidiyorsa mevcut patrol goal'a A* yolu yeniden kurulur. Diğer sınıflar ve modlar etkilenmez.
- Yerel syntax PASS; 114 izole kontrol (60 Heavy, 30 Medic, 24 rota guard). Beş BOT02 blok çıkarılıp tek const/let dönüşümü geri alındığında V344 byte-for-byte. Game blob 86b5837a60a1072ed66d45e2c26af428503f627d. Tarihsel kaynak eşlemesi yalnız bu blokları geri alır; aday tam kaynakla 15 maç testine girer. BOT02-3 tekrar eden kararların sadeleşmesi, BOT02-4 A/B sonuç kabulü açık. Önceki CI ve gerçek oyuncu kabulü henüz tamamlanmadı. PR #68 aynı, main merge yok.


### V346 / BOT02-3 — Geçici temas kaybında karar sürekliliği (aday, kabul edilmedi)
- V345 15/15 doğal maç teknik olarak tamamlandı ancak A/B kalite kapısı **REVIEW_REQUIRED**: TDM geçiş 38.8139 (eşik <=23.93312), Heavy geçiş 38.5287 (eşik <=37.566225), TDM takılma .1567 (eşik <=.1186). Testler PASS gibi gösterilemez. V33 fixture'da 'matchState is not defined' test ortamı eksikliği vardı; yalnız fixture'a BOT02'nin kullandığı inert mode/medkit bağlamı eklendi.
- Yeni salt okunur QA enstrümantasyonu davranış geçişlerini `eski>yeni` eşleşmesiyle sınıf/seed bazında sayıyor; hareket, hedef seçimi ve RNG değiştirilmedi.
- Üretim adayı sadece TDM'de, aynı son görülen temas <=0.65 s önce kaybolmuşsa, önceki plan ENGAGE ise, aynı kattaki **son gözlemlenen** hedef pozisyonu yürünebilir ve >1.35 m uzaklıktaysa CONTACT_HOLD içinde gereksiz durmak yerine önceki ENGAGE hareket niyetini koruyor (3.1 hız). Görünmeyen hedefin güncel pozisyonu kullanılmıyor; gerçek gözlem olmadan atış yok, gerçek LOS/dost hat/aim/ammo/fireTimer değişmedi. Bomb/rescue ve diğer fizik/nişan değerleri korunuyor.
- FO_BOT02 etiketinin kaldırılması V344 byte-for-byte kaynak özdeşliği kontrollerince doğrulanabilir; senaryo testlerine 24 ek guard durumu eklendi. V346 aday oyun blob `946878ef7331f3c6eef13a49c84ddbb7b718e7f6`, commit `96c5db73df0da0fa7b5bba5605d75d228db2c140`. A/B 15 maç ve CI sonuçları henüz kabul edilmedi; eski eşikler asla gevşetilmeyecek. Gerileyen aday geri alınacak. Main merge yok, PR #68 draft korunuyor.
