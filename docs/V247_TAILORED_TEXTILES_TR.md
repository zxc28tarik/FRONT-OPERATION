# FRONT OPERATION — V247 Kumaş, kesim ve dikiş bütünlüğü

**Temel:** `art/v246-helmet-protection` (V246 kask/koruma paketi).
**Hedef:** Poligon sayısını ve ayrı mesh/draw call sayısını artırmadan karakter kumaşlarına daha anlaşılır insanî kesim, panel sınırı, dikiş, kıvrım ve hafif sürtünme aşınması kazandırmak.

## Uygulama
- Mevcut anatomik **göğüs, karın, uyluk, baldır, üst kol ve ön kol** yüzeyleriyle çalışır; ayrı kumaş kaplamaları, yüzen dikiş kutuları veya pahalı transparan katmanlar oluşturmaz.
- Pozisyon verilerinde düşük genlikli, üç bileşenli kıvrımlar uygulanır. Eklem/bükülme bölgesine yaklaşınca kıvrım yoğunluğu artar; uçlardaki zarf sıfıra yaklaşır.
- Yan/arka dikiş hatları, ön panel, kumaş bilek-paça sınırları ve sık kullanılan bölgelerde aşınma görünümü **vertex color** üzerinden işlenir. Mevcut kamuflaj, kumaş normal/bump, roughness, gölge ve takım işaretleri korunur.
- Assault, Medic, Engineer, Sniper ve Heavy için eşya ağırlığına bağlı farklı ancak kontrollü kumaş genliği kullanılır.
- Yüksek/düşük geometri ikisi de dönüştürülür ve sınıf/yüzey anahtarında paylaşılır. Oyun sırasında ekstra animasyon güncellemesi yoktur. Orijinal rig, görünür silah tutuşu, hitbox ve animasyon pivotları sabittir.
- Değişiklikler karakter oluşturulurken bir kez hazırlanır ve mevcut üç basamaklı LOD sisteminde yeniden kullanılır.

## Sınırlar ve kabul
- Kafa, kalça, diz, el/namlu ve silah pivotları değiştirilmez.
- Yeni soldier mesh/draw call sayısı **0**, yeni shader pass **0**, yeni ağ indirmesi **0**.
- `scripts/check-v247-textiles.mjs`: **2 takım × 5 sınıf × 3 varyant = 30 model**, altı kumaş parçası, geometri farkı/zarfı, sonlu normal ve renk değerleri, değişmeyen anchor/draw call, geometri önbelleği, yakın–uzak LOD dönüşü.
- Chromium/WebGL, bomba modu, deneysel rig ve 30 karakter görünüm testleri CI üzerinden yürütülmek üzere bağlanır.
- Test kodunun yazılması PASS sonucu değildir: WebGL tarayıcı doğrulaması, kare karşılaştırmaları ve gerçek oyuncu/donanım FPS kabulü ayrıca izlenir.
- V248 ekipman ve zırh oturuşu; bot mantığı **V271+** safhasına kadar ertelenir.

## Yüksek riskli regresyonlar
- V163 temassal gölgeleme vertex color verisinin yeni katmanda yanlışlıkla silinmemesi.
- Eski low LOD'a dönmeyip yakın yüzeyi uzak mesafede tutmama.
- V246 kask ve koruma sistemini bozacak yeniden ebeveynleme olmaması.
- Aynı modelin her doğuşta farklı geometri/material kopyası yaratmaması.
