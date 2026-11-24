# V63 — Bütünleşik bot QA ve sonraki geliştirme kapısı

## Karşılaştırma
- Kontrol: V53, de6ee3aa2960c8b57aa0f5dd659432d1d9377f71.
- Aday: V62; V63 oyun kodunu değiştirmeden test altyapısı ekler.
- Marien: 3 başlangıç tohumu × 600 simülasyon saniyesi × 2 sürüm.
- Tersane: aynı 3 tohum × 2 sürüm, doğal maç sonuna kadar (en çok 190 simülasyon saniyesi).
- Gerçek Chromium içinde oyun motoru, sabit dt=0.05; pasif insan oyuncu slotu. Render FPS, canlı insan testi ve CS botlarıyla doğrudan kalite karşılaştırması değildir.
- Aynı başlangıç tohumu sonraki farklı kararların RNG dizisini özdeş yapmaz.

## Zorunlu kapılar
- NaN/sonsuz koordinat, JS hatası, geçersiz metrik, tek can ihlali, görev eksikliği ve bitmeyen bomba maçı yok.
- Karşılaştırma raporunda sıkışma/dakika, takım yakın çiftleri, isabet, siper varışları ve doğal bomba kurulumları. Azalan çatışma sayısını kendiliğinden iyileşme sayma.
- Sıkışma veya kümelenmede >%10 artış, siper varış oranında >10 yüzde puan düşüş, daha az doğal kurulum: inceleme işareti.
- PASS, davranış kalitesi kanıtı değildir. Sonuçlar incelenmeden ana dal birleştirme ve V64'e geçiş yok.

## Sonraki çalışma önerisi (henüz uygulama değil)
V64: V63 karşılaştırmasındaki gerçek darboğazlar. Sonraki paketler için CS 1.6/CZ referans mimarisinde navmesh/alan geçişleri, öğrenilmiş yaklaşma ve bekleme noktaları, oyun risk modeli, şarjör ve yeniden doldurma, maç durumuna göre karar, ortak oyuncu/bot hareket fiziği. Mevcut sınıflar, haritalar, HUD, 0.34 s nişan ve zorluk dağılımı korunmalı. Fiziksel tek bomba envanteri ayrı ürün kararıdır.
