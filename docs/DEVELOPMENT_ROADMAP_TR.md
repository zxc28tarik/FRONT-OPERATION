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
