# FRONT OPERATION — FACTION01: Asker / Milis takım ve silah ayrımı

Tarih: 27 Kasım 2026
Taban: \`art/fo-milis02-outfit-refinement\` (V5 milis görseli)
Dal: \`art/fo-faction01-team-weapons-molotov\`

## Kullanıcı talebi
Maç başlangıcında **Asker/Milis** seçimi; askerler mevcut onaylı silahlarıyla kalırken milisler muadil farklı silahlar taşıyacak. Özellikle MP7→Uzi, Carl Gustaf→RPG-7 ve asker el bombası→milis Molotof kokteyli.

## Silah ve sınıf eşlemesi

| Sınıf | Asker | Milis |
| --- | --- | --- |
| Hücum | HK416, P320, M67 | AKM, TT-33, Molotof |
| Sıhhiye | MP7, P320, Medkit | Uzi, TT-33, Medkit |
| Mühendis | MP7, P320, Drone | Uzi, TT-33, Drone |
| Keskin nişancı | MRAD, Glock | SVD Dragunov, TT-33 |
| Ağır piyade | Minimi, P320, Carl Gustaf | PKM, TT-33, RPG-7 |

- Onaylı asker silahları ve mevcut sınıf sistemi korunur. Yeni milis kimlikleri aynı mühimmat, silah, dürbün, ses ve görsel altyapısından uygun profilleri kullanır.
- Uzi, RPG-7 ve Molotof için ucuz özgün 3D birinci şahıs model. AKM/SVD/PKM/TT-33 mevcut iskeletlerinin üstüne görsel ayrım.
- Bot ana karar sistemi değiştirilmez; seçim ve sınıf/silah kimliği mevcut mühimmat kurallarına bağlanır.

## Takım ve görevler
- Yeni maç menüsündeki radyo seçimi dışında takım değiştirilemez. Sadece sınıf değiştirme akışında seçim gizlidir.
- Oyuncu asker seçince mavi doğuş, milis seçince kırmızı doğuş ve karşı yön; gerçek 6 kişilik iki takım. Skor tablosunda oyuncu doğru tarafta.
- Bomba modunda asker hücum/kurma; milis savunma/imha. Esirde asker kurtarma; milis koruma.
- Molotof yalnız saldıran olmayan takımın M67 muadili: çarpışma sonrası 6 saniyelik sınırlı alan ateşi, 8 alan üst sınırı, yalnız görüş hattındaki düşmanlara ve 0,5 sn aralıklarla hasar. Dost ateşi yok. Maç kapanışında alan kaldırılır.

## Kabul ve açık kalite kapıları
- \`scripts/browser-faction01.mjs\`: gerçek Chromium/WebGL testinde üç mod × iki takım, sınıf silahları, HUD/scoreboard, iki yönde doğuş, Molotof etki ve temizlik sınanır; başarı run: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/46020011767
- Mevcut geniş test paketi \`Inline JavaScript syntax check\` CI: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/46020011739 başarılı. Daha yeni küçük görsel ayrım commits sonrası CI yeniden çalışır.
- Bütün gerçek oyun FPS ve mobil cihaz performans ölçümleri açık. Bot karar kalitesi karşılaştırması bu özelliğin konusu değildir.
- Kod ana dalda değil; taslak PR ile kontrollü bekletilir.

Bu değişiklik önceki BOT-KISS davranış planının yerine geçmez; kullanıcının açık yeni isteğiyle ayrı özellik dalıdır.
