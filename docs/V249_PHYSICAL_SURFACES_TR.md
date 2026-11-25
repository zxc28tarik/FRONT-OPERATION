# FRONT OPERATION — V249 fiziksel yüzey ve malzeme ayrımı

**Temel:** V248, `art/v248-equipment-carrier-fit`. **Hedef:** Silahları, oyun fiziğini, botları ve ışık/renk sistemini değiştirmeden askerlerde malzeme ayrımını geliştirmek.

## Uygulama
- **Ballistic (kompozit zırh):** Orijinal beş sınıf kaskı ve ön/arka zırh sert, düşük genlikli doku ve kontrollü parlaklık tepkisi alır.
- **Canvas (dokuma kumaş):** Dört ön mühimmat/admin cebi ve Medic/Engineer/Heavy sırt ekipmanları daha kaba dokuma mikro kabartması, mat roughness ve düşük aşınma alır.
- **Rubber (kauçuk):** Mevcut eldiven, bot, dizlik, kulak koruması ve kemer sınırlı yansıma ve ince oluklu doku kullanır.
- **Hardware (metal):** Önceden var olan toka, ray, bağlantı ve metal ekler yönlü fırçalanmış mikro detay ve farklı roughness aralığı kullanır.
- **Uniform (kumaş):** V247 dikiş/kıvrım vertex color ve V164 kamuflaj/roughness/doku korunur; mat ve düşük metalik yüzey kalır.

## Performans
- Dört sınıf için üçer adet **64×64 RGBA** prosedürel mapa ayrılmıştır (albedo, rölyef, roughness), **12 küçük ortak harita**. Ham kaynak verisi 192 KiB; mipmap ve GPU aktarımı cihaz/driver'a bağlıdır.
- Shared cache ilk modelde hazırlanır; sonraki 29 model ve diğer askerler aynı doku/material havuzunu kullanır.
- Yeni mesh, transparan overlay, yeni ışık, HDR, ekran-uzayı pass, gölge ve runtime URL indirmesi eklenmez.
- Oyun sırasında per-frame texture/model güncellemesi yoktur. Var olan LOD değişimi korunur.
- Takım IFF, Medic artı işareti, yüz/ten, cam/lens, onaylı silah malzemeleri ve oyun renk paleti korunur.

## Kabul
- `scripts/check-v249-surface-finish.mjs` eski V248 ile **2 takım × 5 sınıf × 3 varyant = 30 modeli** eşleştirir.
- Her modelde 5 yüzey türü, kask, iki yelek, dört cep, sırt sınıfları, kauçuk/metal, IFF koruma, V247/V248 kalıcılığı, hiçbir ekstra draw call/mesh olmaması ve yakın-uzak LOD eşlemesi doğrulanır.
- CI: mevcut Chromium/WebGL 6v6 + karakter turntable karşılaştırması. **PASS sonucu kontrol edilmeden yayın onayı verilmez.**
- Görsel sanat kabulü için yakın/orta/uzak gerçek ekran görüntüleri incelenmelidir; amaç renk/ışık tasarımını değiştirmemektir.

**Sonraki:** V250 Assault/Medic sınıf kimliği ve yüzey kombinasyonlarının iyileştirilmesi. Bot zekâsı en son.
