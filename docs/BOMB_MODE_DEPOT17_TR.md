# FRONT OPERATION — Depo 17 / Tek Can Bomba Modu

## Tasarım kararı
Mevcut Marien 6v6 ölüm maçı varsayılan olarak korunur (50 eleme, 600 saniye, yeniden doğuş). Ayrı Bomba modu seçildiğinde Depo 17 haritası etkinleşir. İlk uygulamada oyuncu Derbaran saldırı takımındadır; N.I.U. savunur. Maç tek raunddur, her oyuncu/bot tek canla başlar, yeniden doğuş ve maç içinde sınıf değiştirme yoktur.

## Oyun kuralları
- Kurulmadan önce 150 saniye; saldıran takım A/B bölgesinde 3 saniye etkileşim koşulunu sağlamalıdır.
- Oyuncu için etkileşim otomatik: canlı, yerde, bölgenin içinde, duruyor, ateş etmiyor, drone kontrol etmiyor, reload/roll yapmıyor. Bölgeden çıkış işlemi iptal eder.
- Kurulum sonrasında bağımsız 35 saniyelik oyun içi geri sayım; savunma botunun 4 saniyelik kesintisiz etkileşimi gerekir.
- Kurulmadan önce saldıran elenirse veya süre dolarsa savunma kazanır; savunan tamamen elenirse saldıran kazanır.
- Kurulmuş bomba tüm saldıranlar elense dahi çalışır. Zaman dolunca saldıran, etkisizleştirme tamamlanınca savunan kazanır.
- Yeni maçta tüm canlılık ve hedef durumu sıfırlanır.

## Depo 17
A/B, iki üs, üç ana güzergâh, 86×126 m taban, sanayi yapı blokları, yükleme engelleri ve fiziksel siperler. A/B hedefleri farklı renklerle işaretlenir; kurulumdan sonra soyut 3D hedef göstergesi görünür. Orijinal Marien sahnesi, collider dizileri, rampalar ve navigasyon grafiği ayrı saklanıp aynen geri yüklenir. Depo 17 için 50 düğüm, 85 aday kenar fiziksel collider denetiminden geçirilir.

## Bot davranışı
Mevcut V49 algı, nişan, hasar ve çatışma sistemi korunur. Yalnız bomba modunda ve görünür düşman yokken botlar A/B hedefi, savunma/koruma noktası ve kurulum sonrası etkisizleştirme görevine göre A* yol kullanır. Normal ölüm maçına bu görevler uygulanmaz. İlk sürümde amaç görev çevriminin tamamlanması; tam bot taktik ve harita dengesi ayrıca doğal maç stresleri ile ölçülmelidir.

## QA
640/640 eski bot regresyonu + 23 yeni deterministik bomba kuralı kontrolü ve 12/12 onaylı kaynak koruması. WebGL iş akışı önce orijinal Marien kabulünü, ardından yeni Depot17 testini çalıştırır. Yeni test, kontrollü QA senaryosunda A/B erişilebilirliği, 11 bot, oyuncunun kurulumu, oyuncu/bot için ölüm sonrası 5 saniyede yeniden doğuş olmaması, savunma botunun etkisizleştirmesi ve orijinal Marien geometrisinin/grafiğinin geri yüklenmesini sınar. QA konumlandırması gerçek maç performansı veya doğal bot kazanma oranı testi değildir.
 
**Merge:** V49 tabanında ayrı taslak PR; main değiştirilmez.
