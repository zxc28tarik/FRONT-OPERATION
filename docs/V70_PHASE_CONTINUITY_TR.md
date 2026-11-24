# V70 — Görev geçişi ve rezervasyon tutarlılığı
V69 genel regresyon ve eşlenik maçlar PASS; Marien aynı, Tersane 3/3 kurulum, çözme 2→3, yakın çift .0533→.0333, sıkışma 3→5 (açık kalite uyarısı). V70 yalnız bomba görevi planlayıcısını değiştirir.
- Mevcut sınıf öncelikleri korunur. Aynı rol ve bölgedeki geçerli mevcut düğümler yeni atamalardan önce ayrılır; rol değişiminde tekrar değerlendirilir.
- Aktif görev düğümleri destek atamalarından önce ayrılır. Aynı bölgedeki geçerli atamalara öncelik; bölgeler arası ortak düğüm çakışması için global rezervasyon mevcut, tam optimum yerleşim garantisi yok.
- Mevcut raporla başlayan rotasyon aynı rapor yenilendiğinde ve orijinal bölge hâlâ kapsandığında yeniden atama yerine süre uzatır. Orijinal bölge boşalırsa mevcut destek döner. Süre mevcut 5 saniye, yeni gizli bilgi yok.
- 12 yeni kontrol, eski V61 21 ve V69 19 kontrolü yerelde; genel CI ve V69/V70 eşlenik maç gerekli. V71 geriye dönük denetim; V66 ve V68/V69 kalite uyarıları açık. Ana dala birleştirilmez.
