# V274–V277 — Çatışma hissiyatı ilk paket

Bot AI kilidi: AGENTS.md ve docs/DEVELOPMENT_ROADMAP_TR.md geçerlidir. AI kararları ve oyun mantığı değiştirilmez.

V274 — V273 temel kabulü: commit 5f1c6afbae31e3d1fd20c3c9236133ac78a064c3, index blob ef131d932788d4ecd6cd13e4652c3b11f5df91b2. Inline workflow 45697188543 başarılı: V5–V25 koruma, karakter sahne, eski AI, mod ve animasyon regresyonları. WebGL workflow 45697178122 başarılı: gerçek geometri 30 model, yedi ayrı namlu profili ve karşılaştırma renderı, 6v6 başlatma, sniper scope, FPV drone ve 30 karakter ekran görüntüsü, sıfır yakalanmamış tarayıcı hatası. Yazılım render ortamında kısa örnekte 26.7 FPS, %25 yavaş kare; bu gerçek oyuncu donanımı performans garantisi değildir. V270 browser workflow 45629318129 da 12 viewmodel, 30 karakter, 606 reload örneği, 36 model değiştirme kontrolü ve 30 render yakalamasını geçti. V270 eski statik mock hatası son V273 statik çalıştırmada geçildi. V273 görsel/karakter testlerinin tüm eski sürüm özel adımları tekrar çalıştırılmadı; tarihsel sonuçlarla güncel kontrol ayrı tutulur.

V275 — Mevcut hitmarker okunabilirliği (gölge, daha küçük ve farklı vuruş/eleme vurgu ölçekleri); mevcut isabet parçacığı boyutları deterministik ve kompakt. Konum, sayı, hasar, hitbox ve geri bildirim sesi aynı.

V276 — Mevcut metal ve metal dışı çarpma ayrımı: dört 64x64 RGBA doku (toz, kısa ışık, metal iz, beton/taş iz), iki ortak düzlem geometrisi. Küre yerine yumuşak kamera yönelimli efekt ve farklı yüzey izi; yeni yüzey sınıflandırması veya çarpışma değişikliği yoktur.

V277 — Dört ortak opaklık seviyesiyle parçacık ve iz sönmesi; mevcut kıvılcım daha ince. Mevcut 145 parçacık ve 38 iz sınırı, ömür, ekleme/silme, fiziksel hareket ve açık Math.random çağrıları korunur. Kaynaklar oyun başlatılmadan hazırlanır; maç sırasında ilk çarpmada yeni doku/material üretilmez. Ek 64 KiB ham doku, 2 ortak quad geometri, ortak materyal çeşitleri; ek ışık veya her isabette ek mesh yok. Gerçek FPS ve görsel inceleme bekliyor. Üç boyutlu kütüphanenin başlangıç kaynak UUID üretimindeki rastgele sayı tüketimi birebir aynı olmayabilir; canlı oyun RNG çağrı akışı ve parçacık durumları ayrıca karşılaştırılır.

V277 özel test: 80 karışık isabet çifti ve kapasiteli stres, açık RNG sayısı, süre/hareket/temizlik karşılaştırması, değişmeyen updateBots gövdesi, değişmeyen namlu profilleri ve VFX sınırları. Testin sonuçları görülmeden V275–277 kabul edildi sayılmaz. Sonraki aşama V278 ancak bu paket kabul edildikten sonra.
