# V66 — Köşe hareketi (deneysel)
V65 teknik regresyonları PASS; eşlenik maç sonuçları bu commit sırasında tamamlanmamıştı. V66 ayrı taslak dalda, V65 adayının üzerine kuruludur; V65 veya V66 ana dala alınmadı.
- Yakın rota kısayolu için mevcut fiziksel yürüyüş açıklığına ek olarak, belirgin yön değişiminde momentum/fren mesafesi boyunca gövde açıklığı kontrol edilir.
- Hız 2.2 altındaysa veya hareket yönü yeni doğrultuyla uyumluysa ek kontrol yok. Fren mesafesi v²/(2*12.5)+0.12, üst sınır 1.8; örnek aralığı en fazla 0.22.
- Keskin dönüş yaklaşımında dönüşe özgü hız sınırı ve 8 m/s² varsayımsal yavaşlama eklenir. Mevcut sınır asla artırılmaz, kat/rampa geçişi eski kurallarda kalır.
- Duvar çarpışma fiziği, rota sahipliği, nişan, karakter, harita değiştirilmez. Momentum kontrolü muhafazakâr yaklaşımdır, gerçek çarpışmasızlık garantisi değildir.
- 14 yeni regresyon kontrolü ve V65/V66 eşlenik 12 maç; sıkışma, yakın çift, siper, hedef, isabet ve bomba görevleri değerlendirilecek. V64/V65 açık kalite sorunları çözülmüş varsayılmaz.
