# FRONT OPERATION — V252 Heavy zırh silüeti ve mühimmat taşıma bütünlüğü

**Taban:** V251 Engineer/Sniper. V246–V249 kask, kumaş, ekipman ve fiziksel yüzeyleri korunur.

## Değiştirilen mevcut Heavy parçaları
- Ön/arka balistik taşıyıcının üst gövdesi daha geniş ve yapısal; plaka ceplerinde hafif yatay destek çizgisi ve kontrollü bel daralması var.
- İki orijinal omuz zırhı kademeli, omuz üstüne hacim kazandıran koruma biçimine yeniden şekillendirildi; omuz eklemi ve nişan tutuş pivotuna dokunulmadı.
- Önceden mevcut boyun koruması göğüs/omuz hattına daha düzgün bağlanır, kafanın görsel dönme merkezini değiştirmez.
- Üç mevcut mühimmat cebi ve admin cep seti daha dengeli, büyük ve ağır görünür; iki taşıyıcı kayış eski mesh üzerinde konumlandırılır.
- Orijinal mühimmat sırt çantası, dolgulu üst panel biçimi alır. Eski mühimmat bağlantısı hafifçe hizalanır. Silahın namlusu, şarjör fonksiyonu ve vuruş hesabı aynen kalır.

## Teknik sınırlar
- **0 yeni mesh, 0 ekstra draw call, 0 yeni materyal veya doku, 0 yeni animasyon döngüsü.** Sınıfın mevcut statik BufferGeometry örnekleri klonlanıp forma sokulur ve paylaşılan cache'e alınır.
- Dönüşüm yalnızca Heavy için; Assault, Medic, Engineer ve Sniper V250/V251 hâllerine dokunulmaz.
- Kafa/omuz/kol/kalça/diz/silah ve muzzleFlash düğümleri aynı konumda; orijinal hareket ve hitbox çarpışması değiştirilmez.
- Kontrol: `scripts/check-v252-heavy-armor.mjs` 2 takım × 5 sınıf × 3 varyant = 30 model, 6 Heavy görünümü + 24 diğer modelin korunması, zırh/omuz/paket/cepler, 0 mesh farkı, kask, malzeme, IFF, silah, yakın–uzak LOD dönüşü.

## Sıradaki sürümler
- V253: eklem geçişleri, yürüyüş/koşu/çömelme/zemin teması.
- V254: silah tutuş ve hareket animasyonlarının görsel uyumu; oynanış kurallarına müdahale edilmez.
- V255: karakterlerin bütünlüklü gerçek görsel kabulü ve performans kıyaslaması.
- Bot zekâsı **V271+** olana kadar ertelenir.
