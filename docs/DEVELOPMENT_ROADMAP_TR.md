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

A: V274–V277 teknik testleri başarılı; V278–V279 kodlandı, V280–V281 test altyapısı kayıtlı ve son kabul bekliyor. A paketi 8/8 kod/test altyapısı, 4/8 doğrulanmış önceki aşama. B–I: planlandı. Sonraki V282, V281 kabulünden sonra. Bot zekâsı: KİLİTLİ — açık kullanıcı izni olmadan başlanmayacak.
