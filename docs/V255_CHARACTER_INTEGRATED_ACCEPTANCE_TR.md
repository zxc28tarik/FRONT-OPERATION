# FRONT OPERATION — V255 karakter toplu kabul kapısı

Taban: V254, adf1611b400c88dd1001dc1351b5fe5fb139c51d. Bu sürümde index.html aynen korunur; oyun içi görsel veya mekanik değişiklik yapılmaz. Silah görsellerine geçmeden önce karakter paketinin tamamı kontrol edilir.

## Otomatik kabul
- V240 sabit referansı ile iki takım, beş sınıf, üç varyant (30 model).
- V246 kask / V249 malzeme işaretleri; V250 Assault/Medic, V251 Engineer/Sniper, V252 Heavy sınıf kimliği ve ekipman ayrımı.
- Korunan eklem, namlu ve silah bağlantıları; üçüncü şahıs silah geometrisi ve yerel dönüşümler.
- 600 farklı silah tutuşu/nişan/reload/carry kombinasyonu: sonlu dönüşüm matrisleri ve başlangıç pozuna geri dönüş.
- Yakın/uzak LOD ve yakın LOD'a dönüş; görünür mesh, vertex ve üçgen sayıları raporlanır. Bunlar gerçek FPS/draw-call ölçümü yerine kullanılmaz.
- V254 önceki poz/IK regresyonu tekrar çalıştırılır, V240/V255 aynı kamera/ışık karşılaştırma görselleri üretilir.
- Mevcut 6v6, bomba modu, opsiyonel rig ve 15 bot A/B tarayıcı kontrolleri korunur.
- V254 ile index.html byte eşitliği zorunludur; bu nedenle oynanış değişikliği yoktur.

## Kabul durumu
V254 için inline JavaScript ve geçmiş regresyon workflow'u başarılı (run 45621479115). V254'ün ayrı WebGL workflow sonucu bu kayıt üzerinden doğrulanmadı. V255 yeni kontrolleri GitHub Actions ve insan görsel/FPS incelemesi tamamlanmadan kabul edilmiş sayılmaz. Ana dal birleştirmesi yapılmaz.

## Sonraki sıra
V256–V270: silah modelleri ve görünüşü (önce birinci şahıs ve üçüncü şahıs görsel envanteri, ardından sınıflara göre yeniden işleme).
V271–V285: bot davranışları ve yetenekleri. Bot değişikliği karakter ve silah paketlerinden sonra yapılır.
