# FRONT OPERATION — Tersane / Tek Can Bomba Modu

## Tasarım kararı
Mevcut Marien 6v6 ölüm maçı varsayılan olarak korunur (50 eleme, 600 saniye, yeniden doğuş). Ayrı Bomba modu seçildiğinde Tersane haritası etkinleşir. İlk uygulamada oyuncu Derbaran saldırı takımındadır; N.I.U. savunur. Maç tek raunddur, her oyuncu/bot tek canla başlar, yeniden doğuş ve maç içinde sınıf değiştirme yoktur.

## Oyun kuralları
- Kurulmadan önce 150 saniye; saldıran takım A/B bölgesinde 3 saniye etkileşim koşulunu sağlamalıdır.
- Oyuncu için etkileşim otomatik: canlı, yerde, bölgenin içinde, duruyor, ateş etmiyor, drone kontrol etmiyor, reload/roll yapmıyor. Bölgeden çıkış işlemi iptal eder.
- Kurulum sonrasında bağımsız 35 saniyelik oyun içi geri sayım; savunma botunun 4 saniyelik kesintisiz etkileşimi gerekir.
- Kurulmadan önce saldıran elenirse veya süre dolarsa savunma kazanır; savunan tamamen elenirse saldıran kazanır.
- Kurulmuş bomba tüm saldıranlar elense dahi çalışır. Zaman dolunca saldıran, etkisizleştirme tamamlanınca savunan kazanır.
- Yeni maçta tüm canlılık ve hedef durumu sıfırlanır.

## Tersane
Kullanıcı ilk Depo 17 yerleşimini beğenmedi. Yeni harita asimetrik bir endüstriyel terminal olarak yeniden oluşturuldu. Klasik tek saldıran/tek savunan takım kuralı aynen korundu; karşılıklı üs hedefi denemesi geri alındı.

- A: üç girişli, çatılı, fiziksel duvarlara sahip bakım hangarı; içeride makine blokları, tavan kirişleri ve ışıklar.
- B: açık yükleme avlusu, vinç strüktürü ve farklı yükleme engelleri.
- Merkez: içinden geçilebilen servis binası, yol işaretleri.
- Batı: daha dar, yapılarla bölünmüş sokak; doğu: geniş yükleme hattı.
- İki ayrı üs; mevcut oyun sınırları korunur.
- Orijinal Marien sahnesi ve navigasyonu ayrı saklanır.
- V2: Güney ve ileri sektör arasında tam dört fiziksel geçiş: kapalı batı deposu (x=-32), batı sokağı (x=-16), servis koridoru (x=0), doğu yükleme hattı (x=32). Doğuda ayrıca kapalı ekipman odası. Dört farklı çatılı iç mekân: A hangarı, servis binası, batı deposu, doğu ekipman odası.
- Gerçek harita oluşturucusu izole geometri denetiminde 70 collider üretti; 50/50 düğüm yürünebilir ve erişilebilir, 85 aday kenardan 72 geçerli. Ayırıcı duvarda dört açıklık ölçüldü, dört giriş de iki hedefe bağlanıyor. Bu denetim WebGL görsel kabulü değildir.
- Saldırı botları dört geçide sırayla dağıtılır, önce geçit girişine sonra çıkışına yönelir. Çatışma ve bomba kuralları değişmedi.

## Bot davranışı
Mevcut V49 algı, nişan, hasar ve çatışma sistemi korunur. Yalnız bomba modunda ve görünür düşman yokken botlar A/B hedefi, savunma/koruma noktası ve kurulum sonrası etkisizleştirme görevine göre A* yol kullanır. Normal ölüm maçına bu görevler uygulanmaz. İlk sürümde amaç görev çevriminin tamamlanması; tam bot taktik ve harita dengesi ayrıca doğal maç stresleri ile ölçülmelidir.

## V3 — Onaylı harita üzerine görsel detay katmanı
Kullanıcı dört güzergâhlı yerleşimi beğendi. Bu nedenle V2 planı, geçitleri, fiziksel siperleri ve bomba bölgeleri kilitlendi; yalnız görsel katman geliştirildi. Hangar makine yüzeyleri, depodaki mevcut kasa yüzeylerine raf benzeri profiller, yüksek boru ve kablo kanalları, servis/ekipman havalandırmaları, dört portalda metal ve uyarı trimleri, vinç bağlantı detayları, yükleme çizgileri, zemin aşınmaları ve çevre duvarı derzleri eklendi.
- V2 ile V3 doğrudan kaynak karşılaştırması: yeni detay bloğu dışındaki tüm HTML/JS birebir aynı.
- İzole gerçek harita oluşturucusu karşılaştırması: dekoratif mesh çağrıları 124→385; 70 collider ve tüm 50 düğüm/85 aday kenar aynı.
- 41/41 bomba/harita regresyonu doğrudan çalıştırıldı ve geçti.
- V2 dört geçitli sürümün WebGL kabulü başarılı (45387478141); V3 WebGL kabulü ayrı koşuda (45388085605). FPS ölçülmedi.

## QA
Önceki Depo 17 sürümünün Chromium/WebGL kabulü başarılıydı. Tersane yeniden tasarımının yeni tarayıcı koşusu ayrı doğrulanacaktır.

640/640 eski bot regresyonu + 23 yeni deterministik bomba kuralı kontrolü ve 12/12 onaylı kaynak koruması. WebGL iş akışı önce orijinal Marien kabulünü, ardından yeni Tersane testini çalıştırır. Yeni test, kontrollü QA senaryosunda A/B erişilebilirliği, 11 bot, oyuncunun kurulumu, oyuncu/bot için ölüm sonrası 5 saniyede yeniden doğuş olmaması, savunma botunun etkisizleştirmesi ve orijinal Marien geometrisinin/grafiğinin geri yüklenmesini sınar. QA konumlandırması gerçek maç performansı veya doğal bot kazanma oranı testi değildir.
 
**Merge:** V49 tabanında ayrı taslak PR; main değiştirilmez.
