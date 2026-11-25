# V259–V260 — Birinci şahıs detay ve görsel süreklilik

V258 tabanında seçili pahlanmış silah parçalarına üç ortak 64×64 RGBA yüzey haritası (metal, polimer, kauçuk) eklendi. Desenler deterministik ve hafiftir; renk paleti, mevcut mesh sayısı, üçgenler ve aydınlatma korunur. Haritalar ve türetilen materyaller silah değişiminde yeniden kullanılır. Toplam ham doku verisi 48 KiB, mipmap hariçtir. Ek texture örneklemesi nedeniyle gerçek GPU maliyeti ölçülmelidir.

V260, mevcut şarjör görseli olan altı modelde doldurma süresine bağlı sınırlı görsel hareket ve başlangıç pozuna dönüş sağlar. Yeni el animasyonu yoktur; el-şarjör uyumu insan görsel incelemesinde kontrol edilmelidir. Cephane, hasar, ateş, nişan, recoil ve bot davranışı değişmez.

Test kapsamı: 12 viewmodel, 606 şarjör poz örneği, doku önbelleği, üç tur silah değiştirme, sabit geometri ve efekt bağlantıları, animasyonun bitiş/iptal sıfırlaması. V255 karakter kontrolü ve mevcut WebGL iş akışları korunur. Test sonuçları henüz doğrulanmadı; ana dala birleştirilmez.

Sonraki: V261–V262 optiklerin görsel yüzeyleri ve üçüncü şahıs silah silüetleri. Bot zekâsı en son.
