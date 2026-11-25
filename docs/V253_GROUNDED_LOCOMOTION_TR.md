# FRONT OPERATION — V253 ayak teması, duruş ve hareket bütünlüğü

**Temel:** V252 Heavy doğrulanmış sürümü. Karakter çizimleri (V245–252), mevcut 5 sınıf ve takım kimliği korunur. V253, bot karar verme veya yürüme fiziğini değiştirmeden **görsel animasyonu** iyileştirir.

## Sorun / değişiklik
- **Kayarak adım atma:** Eski adım fazı yumuşatılmış hedef hıza bağlıydı. Yeni faz, botun o karede gerçekten kat ettiği dünya mesafesi ve sınıfın adım uzunluğuna bağlı ilerler. Ani hızlanma/frenleme ile ayak döngüsünün gerçek hareketten kopması azaltıldı.
- **Ayakları sırayla yere basma:** Sağ ve sol ayak için ayrı destek ağırlığı üretildi; durma, geri hareket, yanal hareket ve dönme arasında yumuşak geçiş var. Düşük hızda iki ayak da yerde kalma eğilimindedir.
- **Zemin uyumu:** Mevcut V189–V195 diz/kalça zemin uyarlaması, artık `sin(phase)` gibi ani işaretli bir plant katsayısı yerine gerçek, süzülmüş sağ/sol destek ağırlığını kullanır. Diz/ayak bileği düzeltmesi sınırlandırılır.
- **Çömelme:** Mevcut çömelme pozunda iki bacak birbirine aşırı yaklaşmasın diye destek tabanı korunur. Eski görsel kafa/torso düşüşü ve fiziksel crouch tamamen korunur.
- **Yön değişimi:** Mevcut üst gövde duruşu çok küçük, sınırlandırılmış yanal eğim ve frenleme/ivmelenme geçişi alır; Sniper ve Heavy’nin ağırlık farkı gözetilir.
- **Durma:** Son adım fazı korunur; yön/ağırlık/gövde eğimi sönümlenir. Yeni dünya pozisyonu veya hareket hızı üretilmez.

## Performans ve koruma
- Yeni mesh, texture, materyal, ışık, render pass veya görünür UI yok. 5 sınıfın 30 asker geometrisi bire bir korunur.
- Bot hedef seçimi, manevra planı, navigasyon, ateş ve ses modeline dokunulmadı; yalnız `updateBots` içindeki **görsel animasyon katmanı** güncellendi.
- Her botta sağ/sol ayak ağırlığı ve küçük gövde eğimi saklayan tek sabit boyutlu durum nesnesi; zemin örnekleme sıklığı önceki `visualGroundSample` sınırında kalır. GPU draw call sayısı değişmez.
- V246 kask, V247 kumaş, V248 ekipman, V249 malzemeler, V250–V252 sınıf zırhları korunur.
- Önceden var olan gerçek 6v6 WebGL, bomba modu, 15 rig karşılaştırması ve 70 ekran görüntüsü üretimi CI ile tekrar kontrol edilir.

## V253 regresyon
`scripts/check-v253-grounded-locomotion.mjs`:
1. 2 takım × 5 sınıf × 3 varyant = 30 model yüzey/mesh/pivot/LOD karşılaştırması.
2. Duruş örnekleri: 0–6.8 m/s, çömelme 0–1, yanal hareket -1..1, dönüş hızı -9..9; sağ/sol ayak fazı, destek ağırlığı 0..1, sınıra uygun küçük gövde eğimi ve yumuşak 16 ms geçişleri.
3. Aynı gerçek yol uzunluğunda faz eşitliği ve kontak testi, ikisinin ayakta yerleşmesi, zemin IK limitleri.
4. Herhangi bir oyun mantığı değiştirilmediyse bile tam WebGL/Chromium CI başarıyla bitmeden insan görsel onayı verilmez.

**Sonraki:** V254 tutuş/şarjör/ölüm ve hareket animasyonu bağlantısı, V255 genel görsel kabul, sonra V256–270 silah yüzey/model revizyonu ve en sonda V271–285 bot AI.
