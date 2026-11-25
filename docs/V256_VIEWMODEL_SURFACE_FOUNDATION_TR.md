# V256 — Birinci şahıs silah yüzeyleri, ilk paket

V255 tabanında sadece birinci şahıs viewmodel bölümü değiştirildi. HK416, MP7, MRAD, Minimi, P320, Glock18C ve Carl Gustaf için toplam 28 kutu geometri tanımı, düşük segmentli pah yüzeyi ile değiştirildi. El koruma, gövde, şarjör, tutuş, dipçik ve diğer seçili büyük yüzeylerde düz kutu kenarları yerine ışığı farklı açılarda yakalayacak kenarlar oluşturuldu. Mevcut ölçü zarfı, yerel dönüşüm ve malzeme korunur.

- Yeni mesh, doku, shader, ışık, gölge veya animasyon eklenmez.
- Bot modelleri, oyun istatistikleri, recoil, silah tutuşu, gerçek mermi yönü ve efekt bağlantıları değişmez.
- Geometri başına ek üçgenler vardır; test her silah için 450 ek üçgen sınırı uygular. Gerçek FPS henüz ölçülmedi.
- Test 12 viewmodeli, 7 değiştirilmiş silahı, tüm sahne düğümlerini, boyut zarflarını ve animasyon referanslarını önceki sürümle karşılaştırır. V255 karakter testi yeniden çalışır.
- GitHub Actions ve görsel inceleme sonuçlanmadan ana dala birleştirilmez.

V257: büyük yüzeylerin silaha özgü silüetleri; V258: görünür yüzey ayrımı ve malzeme tepkisi. Sonraki paketler üçüncü şahıs görselleri ve genel kabul testlerine ayrılacak. Bot davranışları en son.
