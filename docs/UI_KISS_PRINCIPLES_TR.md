# FRONT OPERATION — KISS Arayüz İlkeleri (V29)

Bu belge oyunun **yalnızca menü, HUD ve kullanıcı arayüzü** kararlarını yönlendirir.

## Kapsam sınırı (kritik)
- **KISS geçerlidir:** Ana menü, sınıf seçimi, oyun içi HUD, skor tablosu, duraklatma menüsü, drone bilgi katmanı.
- **KISS geçerli değildir:** Asker ve karakter modellemesi, silah modeli, harita mimarisi, çevre/kaplama/animasyon efektleri. Bunlarda detay, malzeme gerçekçiliği ve görsel kaliteyi artırmaya devam et. KISS adına başarılı detayları silme.
- Oynanış, silah dengesi, vuruş ve nişan sistemleri, BOT AI, drone davranışı, hitbox ve çarpışma ayrı onaylı geliştirme alanlarıdır.

## Görsel sistem
- Koyu mat gri / düşük doygunluklu yüzeyler; okunaklı açık metin.
- Mavi/kırmızı takım renkleri kimlik için kullanılır; sürekli neon parlama ve yoğun gölgelerden kaçınılır.
- Tehlike uyarıları (kritik can/hasar) bilerek daha belirgin tutulur.
- Birincil eylem net, ikincil eylemler sessiz; küçük ekranlarda taşma/erişilebilirlik kontrol edilir.
- Ayrıntılı bilgiler gerektiğinde veya ilgili seçim yapıldığında gösterilir.
- Değişken değerler (can, mermi, skor, drone, sınıf) gerçek oyun durumundan beslenir; taklit/sahte göstergeler kullanılmaz.

## Onaylı ekran yönü
- V28: Beş kompakt sınıf kartı ve tek ortak donanım ayrıntısı alanı; 1–5 klavye seçimi.
- V29: Minimal duraklatma ekranı; devam / sınıf seç / skor. P veya piyadede ESC ile erişim. ESC drone kontrolünde eskisi gibi drone geri çağırma işlevini korur; P duraklatır.
- V29: TAB skor tablosu; toplam skor, süre, iki takım oyuncu listesi. Açıkken oyun içi veriler korunur.

## Regresyon kapıları
1. `index.html` JavaScript sözdizimi ve HTML yapı kontrolleri.
2. Menü seçme, devam etme, skor gösterme ve klavye kısayolları.
3. Duraklamada simülasyon zamanı, BOT hareketleri ve ateş eylemleri durmalı; devamda kaldığı yerden çalışmalı.
4. Asker, silah ve harita model işlevleri önceki onaylı sürümle karşılaştırılıp korunmalı.
5. Gerçek Chromium/WebGL görsel-oynanış testi yapılmadıysa **PASS** denmez.

## Dağıtım
Geliştirmeler `visual/v29-kiss-pause-scoreboard` dalında tutulur. Ana dal kullanıcı istemedikçe birleştirilmez.

## V30 — Kabul edilen sınıf menüsü referansı
- Üstte yalnızca **SINIF SEÇİMİ** ve **MARIEN • 6V6**.
- Yan yana beş ikonik kart: **HÜCUM (nişangâh)**, **SIHHİYE (kalp)**, **DRONE (anten)**, **SNIPER (hedef tarama)**, **HEAVY (kalkan)**.
- Kartlarda kısa ad, tek çizim ikonu ve yalnız seçili kartta küçük onay işareti; silah görselleri veya uzun açıklamalar yok.
- Kartların altında bir satırda sınıf adı + kısa rol; ardından 1–4 numaralı dört kompakt ekipman etiketi.
- Tek geniş, sakin gri-yeşil **ÇATIŞMAYA KATIL** butonu.
- Takım savaşı, sınıf ve silah kodlarını değiştirmeden mevcut HTML içindeki gerçek menüde uygulanır; ayrı demo ekranı yapılmaz.
- V29 duraklatma/skor tablosu korunur. Karakter/silah/harita modelleri KISS sadeleştirmesi dışında tutulur.

## V31 — Beş yatay sekme, tek ortak ayrıntı alanı
- V30'daki **beş çerçeveli kart** tamamen kaldırılır; sınıflar yan yana beş **çerçevesiz yatay sekme** olarak gösterilir.
- Sekmelerin üstünde tek renk çizim simgesi, altında kısa isim bulunur: Hücum, Sıhhiye, Drone, Sniper, Heavy.
- Seçili sınıfın göstergesi yalnızca **ince, açık renkli alt çizgidir**; her kartta arka plan kutusu/kenarlık yoktur.
- Alt bölümde yalnızca seçili sınıfın adı ve kısa rolü; ardından dört ekipman etiketi yer alır.
- Tek geniş "ÇATIŞMAYA KATIL" düğmesi korunur. Beş sekme mobilde de yatay kalır; silah ve asker görsellerine dokunulmaz.
- Sınıf seçimi mevcut `data-class` ve `CLASSES` sisteminden yürür; fare, Enter/Space, 1–5, Home/End ve yön tuşları desteklenir.
