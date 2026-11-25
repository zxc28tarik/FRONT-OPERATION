# V282–V287 — Silah animasyonları (B paketi)

## A paketi giriş kabulü
V281 commit 1b99db408570ea48d1dc9652ab582dddf7edfbc6: statik run 45703844072 ve gerçek WebGL run 45703821239 başarılı. V281 üç mod/sahne karşılaştırması ve eski regresyonlar geçti. İnsan gözüyle ayrıntılı görsel onay ve kullanıcı donanımında FPS ölçümü ayrı kalır.

## Uygulamalar
- V282: 12 modelin ağırlığına göre yumuşatılmış silah çekme ve aşağı-yukarı geçişi; slot değişimi ve eski modelin bırakılması mevcut anlık mekanizmayı korur. Ayrı gecikmeli eski silah holster animasyonu eklenmedi.
- V283: HK416 ve MP7 için ayrı görsel el/şarjör hareket eğrileri; mevcut reload süresi korunur.
- V284: MRAD mevcut mekanizma animasyonu ve Minimi mevcut kapak/üst ray hareketi, stilize model sunumu. Oyun mekanizması ve namlu/eject bağlantıları değişmez.
- V285: P320/Glock18C ayrı kısa el/şarjör ve sürgü hareketi; bıçak bilek takip hareketi, yardımcı ekipmanların ayrı çekme profilleri, iki elli ekipmanda mevcut reload ile görsel destek eli hareketi. Tek kullanımlık ekipmanın anlık kullanımı/slot dönüşü korunur.
- V286: mevcut sprint eğilme hareketinin görsel geçişleri yumuşatıldı; ADS sırasında ilave grup düzeltmesi kapalı, mevcut recoil, roll, nişan ve taşıma mekaniği aynen korunur.
- V287: render-only transform saklama/geri yükleme; model değişimi, ölüm, gizleme, iptal, çizim hatasında restore ve ortak kaynak yaşam döngüsü kontrolleri.

## Teknik sınırlar
Yeni mesh, geometri, doku, materyal, dinamik ışık ve açık RNG çağrısı yoktur. Animasyon yalnız renderer.render çağrısına komşu try/finally içinde geçici dönüşüm yapar. Simülasyon öncesi pozlar geri yüklenir. Oyuncu ateş ederken veya ADS'de grup düzeltmesi uygulanmaz. Bot AI, updatePlayer, hasar ve atış fonksiyonları değiştirilmez. Ek CPU maliyeti poz kaydetme/geri yükleme ve matris güncellemesidir; FPS sonucu ölçülmeden garanti verilmez.

## Kabul
12 model, 1212 örnek poz, 36 model değiştirme, 24 namlu/ADS kontrolü, 36 gerçek sahne render örneği planlandı; özel testler scripts/check-v287-animation.mjs ve scripts/browser-v287-animation.mjs. B paketi kodlandı, son WebGL sonuçları bekleniyor. Sonraki V288 ancak V287 kabulünden sonra. Bot AI kilidi yürürlükte.
