# V71 — Geriye dönük kalite denetimi ve adaylar
V70 teknik ve eşlenik maç PASS; Marien aynı, Tersane sıkışma 5→3, isabet %12.01→%13.48, 3/3 kurulum ve çözme, yakın çift .0333→.0483 (uyarı). Kullanıcı kararı gereği V54–V67'de sınıf/aktif silah/evre eksikleri artık ayrı doğrulanabilir paketlerle ele alınır.
## V71A (bu commit)
V66 ek momentum veto + fren sınırı ilk testte Marien sıkışma 64→78, Tersane 3→6, yakın çift .03→.0417; sebep kesin değil. Kontrollü ablasyon: yalnız iki V66 ek kuralı varsayılan canlı yol takibinde kapat; V65 öncesi gövde açıklığı ve eski dönüş sınırı korunur. Eski V66 testleri açık opt-in ile tarihsel deney olarak çalışır; canlı varsayılanın test edildiği iddia edilmez. Yeni 9 kontrol canlı varsayılanı doğrular. V57 24 kontrol ve V66 14 tarihsel kontrol yerelde. V70/V71A eşlenik 12 maçla ölç; sonuç kötü ise geri al veya iki kuralı ayrı dene. Önceki sürümün tüm diğer değişiklikleri korunur.
## Sonraki adaylar / açık konular
- V71B: Aktif silah bilgisi V67 mesafe/pozisyon tercihlerinde yok; V68 mühimmat ve görev önceliği ile uyum denetimi. Mevcut nişan ve zorluk korunur.
- V71C: Hedef değişim oranı V68 ile .0927→.1041, önceki V64 iyileşmesi korunmalı. Sınıf ve durum farklılıkları gerçekten gerekli mi, oyun içi gözlemle değerlendir.
- V71D: Tersane yakın çift, görev rezervasyonu, geçmiş V54–V62 hareket/algı/siper sınıf bağlamı; mevcut geometrik noktalar ve geçerli görev kuralları korunur.
- V72: Birleşik adayın karşılaştırması (V53, V65, V70 ve seçilen aday), gerçek WebGL, kullanıcı oynanış onayı; ana dal birleştirme için kalite kapısı.
Bu liste tam denetim tamamlandı anlamına gelmez. Testler pasif insan slotu ve üç sabit başlangıç tohumu kullanır; insan oynanışının yerini tutmaz. Ana dal değişmez.
