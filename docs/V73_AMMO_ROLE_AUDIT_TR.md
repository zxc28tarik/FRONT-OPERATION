# V73 — Sınıf ve mühimmat ölçüm paketi
V72 genel CI PASS; geniş 60 maç ve WebGL kabulü bu paket başlatılırken açık. V73 ayrı deneysel dal, ana dal değişmez. Amaç davranış tetiklenmesini kanıtlamak ve envanter bütünlüğünü denetlemek, isabeti arttırmak değil.
1. Mevcut sınıfın yalnız iki ateşli silah yuvası envanter oluşturabilir. Yanlış bir kimlik yeni mühimmat vermez; mevcut 3 ateş yolu aynı kapıdan geçer.
2. Tüketilen mermi, tabanca mermisi, silah değişimi, doldurma başlatma/bitirme/iptal, boş mühimmat denemesi ve örneklenen doldurma saniyeleri sınıf/takım/aktör bazında ölçülür. Ölümde yarım kalan doldurma iptal sayısına eklenmez; başlatılanların tamamı bitmek zorunda değildir.
3. Bomba rol saniyeleri ve aktif silah/görev siper tercihi değerlendirmeleri ölçülür. Siper sayaçları gerçek seçim değil, tercih değerlendirmesi sayısıdır. Rol ve doldurma saniyesi bir saniyelik örneklem, kesin süre değil.
4. Mevcut Chromium Marien ve Tersane raporları bu alanları ayrı verir, mühimmat/rol tutarlılığını kontrol eder. Eski sürümde ölçüm yoksa null; sahte sıfır yok. Destek ateşi dahil ammoRounds, normal+drone atışlarından az olamaz.
5. Gerçek WEAPONS/CLASSES tanımlarından beş sınıfın tüm ana/yan silah mühimmatı tükenene kadar doğrulanır; yeni ikmal, görsel değişiklik veya silah dengesi yok. V68 davranış ve V40 telemetri testleri korunur.
6. V72/V73 eşlenik maçlar gereklidir, V72 geniş test kararı beklenir. Görsel tabanca/doldurma animasyonu ve insan oynanış kabulü açık.
