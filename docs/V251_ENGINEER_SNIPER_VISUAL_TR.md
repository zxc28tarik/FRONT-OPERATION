# FRONT OPERATION — V251 Engineer / Sniper sınıf silüetleri

**Taban:** V250 Assault–Medic revizyonu, V249 malzeme kalitesi. Bu pakette silah modelleri, vuruş/hitbox, bot kararları, ışık, renk, haritalar ve menüler değiştirilmez.

## Engineer
- Mevcut ön ve arka zırh, omuz ve göğüste yük taşıyan **köşeli, işlevsel** bir kontura yeniden işlenir; dikiş ve malzeme V247/V249 üzerinden kalır.
- Mevcut 3 şarjör cebi + admin cebi farklı yüksekliklerde ve daha geniş; iki taşıyıcı kayışı yeni zırh oranına uyumlu.
- Mevcut mühendis sırt çantasına ince dikey panel ve kenar formu verilir; var olan alet tüpü ve dış utility parçaları çantanın yanında hizalanır.
- Yeni ekipman modeli oluşturulmaz, sadece var olan parçalar farklı biçimde oturtulur.

## Sniper
- Ön/arka zırhın üst gövdesi daraltılır; ceplerin kalınlığı ve görünür alanı azaltılır, iki omuz kayışı içeri yaklaşır.
- Var olan kısmi pelerin geometrisi düz ve silindirik görünümden uzaklaşacak biçimde **asimetrik, yumuşak aşağı sarkma** alır. Mevcut ayrı animasyon ve görünürlük davranışı korunur.
- Var olan sniper kapüşonu kaskı ve baş eklemini değiştirmeden yüz çevresinde daha ince bir profile dönüştürülür.
- Dürbün, tüfek, nişan alma ve mermi istatistikleri değişmez.

## Mühendislik ve kabul sınırları
- **0 yeni mesh / draw call, 0 yeni materyal/texture, 0 per-frame animasyon kodu, 0 yeni render pass.**
- Tamamen V139/V149/V246/V247/V248/V249 temeli üzerinde yer alan mevcut zırh/çantalar/kapüşon/pelerin işlenir.
- Sınıfa özel yüzey geometrileri ortak önbellekte saklanır; 30 modelin her varyantında tekrar üretilmez.
- 2 takım × 5 sınıf × 3 varyant = **30 model** test edilir. Engineer ve Sniper’da geometri farkı / yerleşim / kask ve malzeme kontrolü; Assault/Medic/Heavy’de değişmezlik; her sınıfta pivot, silah, mesh sayısı ve LOD dönüşümü aranır.
- Chromium/WebGL 6v6, bomba modu ve 15 model alternatif rig görsel kıyasları CI’den geçmeden tam kabul verilmeyecektir.
- V252 Heavy revizyonu sırada. Bot davranışı en son.
