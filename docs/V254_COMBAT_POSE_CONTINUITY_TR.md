# FRONT OPERATION — V254 silah tutuşu, şarjör ve ölüm duruşu

**Taban:** V253 yer temasına dayalı görsel yürüyüş. Hedef: onaylanmış oyun mekaniğini değiştirmeden, karakter hareketleri arasında daha tutarlı bir savaş animasyonu oluşturmak.

## Uygulama
- **Silahı omuza oturtma:** Mevcut `setVisualCombatPose` ve `updateVisualGrip` iki el IK sistemi korunarak Assault, Medic, Engineer, Sniper, Heavy sınıflarının görsel silah tepkisi hafifçe farklılaştırıldı. Namlu-kökü, gerçek nişan dönüşü, cephane, isabet veya balistik parametrelerine müdahale edilmez.
- **Şarjör değiştirme:** Mevcut şarjör mesh'i çıkarma–elde tutma–yerine takma kademelerine uygun olarak öne/alta kayar ve çok küçük yalpalama alır. Animasyon gerçek `botReload.left` süresi üzerinden hesaplanır; envanter ve atış gecikmesi işlemleri eski kodda kalır.
- **Ölüm pozları:** Düşme eski canlı duruştan başlar. İki kalça/dizin simetrik kilitlenmesini engelleyen, düşme yönü ve sınıf ağırlığına göre değişen pozlar eklendi. Çömelmeden ölümde başlangıç pozu korunur. Heavy düşmesi biraz daha kontrollü ve az dönüktür.
- **Ayak-bilek bağlantısı:** Önceden var olan `setVisualFootPose`, ölümde ayrı iki ayağın doğal son pozuna kadar kullanılır.
- **Yeniden doğuş:** Önceden var olan `resetVisualCombatPose` ile silah, şarjör, pozlar eski konumlarına tam döner.

## Korunan bileşenler ve performans
- Birinci şahıs silah modeline, üçüncü şahıs silah geometrisine, hitbox, raycast, mermi, hasar, recoil istatistiği, ateş hızı, şarjör sayısı, aim pivot dönüşüne ve AI'ya dokunulmaz.
- Yeni mesh, texture, shader, render pass, light, shadow veya çarpışma gövdesi yok.
- Sadece zaten her kare çalışan görsel poz ve mevcut silah tuttuş/IK yolu kullanılır.
- V245–V253'te onaylanmış karakter anatomisi, sınıf silüetleri, malzemeler, ayak ve zemin teması korunur.

## Kabul
- `scripts/check-v254-combat-pose.mjs`: 2 takım × 5 sınıf × 3 varyant = 30 model, mesh ve anchor eşitliği, 5 sınıf recoil/bracing, şarjör pozları ve reset, iki el IK tüm nişan pitch'leri, LOD geçişi, asimetrik ama sınırlanmış düşme ve 0 ilave draw call.
- Chromium/WebGL 6v6, bomba modu, 70 karşılaştırmalı karakter görseli ve 15 alternatif rig testi koşar. CI tam geçmeden merge yapılmaz; gerçek oyuncu deneyimi ayrıca incelenir.

**Sonraki:** V255: tüm 5 sınıfta görsel tutarlılık, animasyon ve performans kabul raporu. Ardından V256–V270 silah görselleri, sonra V271–V285 bot davranışları.
