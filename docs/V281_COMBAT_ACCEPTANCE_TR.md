# V278–V281 — Çatışma hissiyatı ikinci paket

## V277 giriş kabulü

V277 head 584547344988341c44b46b0fa05d18d03777e55c: inline/statik 45702472636 ve WebGL 45702461024 başarılı. Özel 80 karışık isabet testi; parçacık durumları, açık RNG çağrı sayısı, ömür, kaynak sınırları ve temizlik birebir korunmuştur. V273 yedi namlu profili ve gerçek 6v6 başlangıcı geçti. V277 yazılım WebGL kısa örneğinde 10.9 FPS, V273 örneğinde 26.7 FPS; bu iki kısa örnek farklı sahne/koşullardadır, nedensel performans karşılaştırması yapılamaz. V281 eş kamera testi bu nedenle eklenmiştir.

## V278

Oyuncunun mevcut hasar ve patlama katmanları birbirinden bağımsız zamanlayıcılar kullanır. Hasara bağlı sınırlı opaklık, hızlı giriş ve kontrollü sönme; yeni maçta sıfırlama. Bot hitFlinchPitch/roll değişkenleri değiştirilmez: mevcut isBotAimAligned fonksiyonu bu girdileri kullanmaktadır. Bu yüzden bot gövde vurulma eğrisini değiştirmek AI kilidine aykırı olur. Hasar, oyuncu kamera geri tepmesi, yön göstergesi, ölüm ve diğer mekanikler korunur.

## V279

Mevcut tracer uzunluğu, doğrultusu, konumu, ömrü ve kapasitesi korunur. Daha ince görsel gövde ve 4 ortak opaklık düzeyi. Kovanın mevcut geometri kopyasında renkli uç/yüzey ayrımı, metalik materyal ve görsel başlangıç yönü; ek mesh veya üçgen yok. Kovan hareketi, yer çekimi, sıçrama ve RNG çağrıları aynı. Ortak materyal/geometri kaynakları başlangıçta hazırlanır. Yeni doku veya ışık yok.

## V280

V273'ün 7 ayrı namlu profili korunur. Yerel QA sunucusu gerçek oyunu başlatır ve aynı kamera ölçeğinde 7 silah için doğrudan görsel tetikleme ile render örneği alır. Bu, tüm silahların gerçek ateş mekaniğinin test edildiği iddiası değildir; mevcut canlı maç smoke testi gerçek input ile ayrıca ateş eder. Görsel çıktılar incelenmeden efektlerde rastgele ilave değişiklik yapılmaz.

## V281

Marien ölüm maçı, Tersane bomba, Cezaevi kurtarma modlarının her biri için V277 ve V281 sahne karşılaştırması, aynı kamera, 11 bot ve eş nav/çarpışma envanteri. 22 sahne örneği, her birinde namlu ve çatışma görseli; 3 senkron render zaman örneği, çizim çağrısı ve üçgen sayısı. Bunlar yazılım WebGL render maliyeti ölçümüdür; donanım FPS garantisi veya uzun maç testi değildir. Test-only görsel enjeksiyon yayınlanan HTML'de bulunmaz.

V278–V279 özel test: iki hasar katmanı reset, 90 tracer/kovan çifti, hareket/ömür/kapasite/açık RNG eşitliği. V277 ve V273 testleri de tekrar çalıştırılır. Güncel V281 sonuçları doğrulanana kadar A paketi teknik kabul bekler. Sonraki aşama V282 ancak bu kabul sonrasında.

Bot AI kilidi yürürlüktedir. updateBots gövdesi ve hasar kararları kaynak karşılaştırmasıyla korunur. Three.js başlangıçtaki yeni görsel kaynak UUID üretiminin küresel RNG üzerindeki dolaylı etkisi ayrıca tam deterministik maç deneyi olmadan garanti edilemez; canlı tetiklemelerde yeni RNG çağrısı eklenmemiştir.
