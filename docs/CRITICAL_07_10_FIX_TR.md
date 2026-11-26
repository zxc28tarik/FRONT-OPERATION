# Kritik hata 07–10 düzeltme kaydı

Temel: 4903738a217a4114479247cb37b4112d94aa20fc. Oyun kodu commit 79d951bbda06463e644abd6fc23fcd0666ce038f. Mevcut V292 dalı / PR #68, yeni dal yok.

- 07: Skor tablosu açılırken basılı girişler temizlenir. Açık skor tablosu fare ateşi, bakış, silah değiştirme ve mobil oyun girişlerini bloke eder. UI tıklaması pointer lock dışındayken oyun alanı tıklaması olarak kabul edilmez. TAB ve ESC/P akışı korunur; skor tablosu normal maçta maçı durdurmaz.
- 08: Yeniden doğuşta eski ateş bekleme, şarjör, sürgü, bıçak, hareket, nişan, recoil ve geçici animasyon değerleri başlangıç değerlerine döner; sınıf/skor/ölüm istatistikleri korunur. Kamera hemen doğuş pozuna ve normal görüş açısına alınır. Hasar/namlu flaşı ve giriş durumları temizlenir.
- 09: Mobil sınıf düğmesi doğrudan mevcut openClassMenu işlevine bağlandı; duraklatma, kontrol temizliği ve tek can modu kısıtı masaüstüyle aynı. Menü tasarımı değiştirilmedi.
- 10: Ateş, bakış, hareket ve drone irtifa kontrolünde dokunma kimliği ve touchcancel yönetimi. İki irtifa yönü birbirinden bağımsız; birlikte basılırsa nötr, birisi bırakılırsa diğerinin girdisi korunur. Odak kaybı, sekme gizlenmesi, ölüm ve duraklatmada girişler sıfırlanır. Menü açıkken mobil oyun komutları bloke edilir.

Test: tests/critical_07_10_regression.cjs güncel oyun kaynaklarından çıkarılan gerçek işlev/olay işleyicileri ve DOM adaptörüyle 101/101 başarılı. Inline JS parse başarılı. updateBots ve updatePlayer birebir aynı; Math.random çağrısı sayısı 87/87; 23 açık düzenleme geri alınarak geri kalan kaynak birebir doğrulandı. Önceki 01/04–06 paketi CI 45725551897 başarılı, 63 ve 2891 kontrol de bu koşuda geçti. 07–10 yeni GitHub CI ve gerçek mobil/tarayıcı/WebGL kabulü ayrıca doğrulanmalı. Tüm 10 hata kod düzeyinde ele alındı; 01 için aşırı düşük FPS kapasite sınırı ve gerçek FPS ölçümü açık. Ana dal değiştirilmedi; bot AI kararları değişmedi.
