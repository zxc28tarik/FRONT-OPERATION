# FRONT OPERATION — FPS BOT ARAŞTIRMASI VE V35–V40 YOL HARİTASI
Tarih: 23 Kasım 2026
Durum: Tasarım önerisi; **kod uygulanmadı, zorluk seviyeleri henüz kalibre edilmedi**.
Temel sürüm: `ai/v34-squad-passage-cover` (6v6, 5 sınıf, tek HTML/Three.js).

## Araştırmadan alınan ilkeler
- F.E.A.R. (Jeff Orkin, GDC 2006): sınırlı ve anlaşılır durumlar + değişen koşullara göre yeniden planlama; engel çıkınca alternatif yol/ateş açısı arama.
- NVIDIA / Counter-Strike hareket araştırması (2024): insan benzeri takım hareketi, yalnızca kısa yola veya mekanik sola-sağa strafeye indirgenemez. Öğrenme tabanlı yöntem mümkün ancak ilk aşamada zorunlu değildir.
- Mafia III AI teknik açıklaması: nişan ve hedef seçimi ayrı; silah ateşi görme, dönüş, hazırlık süresi ve dost güvenlik kontrollerine uyar. Algılama mesafe, açı, hız, gövde görünürlüğü ve sese göre değişir.
- Recast/Detour ve ORCA: A* büyük ölçekli yol hedefini, local avoidance ise anlık yakın mesafe hareketini çözmeli.
- Game AI Pro / Unreal EQS: siper seçimi erişilebilirlik, korunma, mesafe, görünürlük, rol ve dolulukla puanlanmalı; sürekli karar değişimini önlemek için commitment/hysteresis kullanılmalı.
- Oyun zorluğu: botların hasarı/canı ve görünmeyen düşmana ilişkin bilgileri gizlice değiştirmek yerine tepki, isabet süreci, karar gecikmesi, koordinasyon ve konumsal baskı ayrı ayarlanmalı.

## Mevcut sürüm ve boşluk analizi
V34'te V32 hedef algısı/görüş/son görülen konum/50 düğümlü A*; V33 üst gövde nişan hizası/dost atış hattı/sıhhiye hedef kararlılığı; V34 dar geçit yol verme, takım rally navigasyonu, siper güncelleme bulunuyor.
Henüz bağımsız ve seçilebilir dört zorluk profilinin tek merkezde yönetimi, gerçek süreklilik gösteren nişan hata modeli, küçük takım planlarının koordinatör tarafından dağıtılması, animasyon destekli hareket ve ölçümlenmiş uzun oynanış kararlılığı bulunmuyor veya onaylı testle tamamlanmış değil.
**Özellikle:** Silahın isabet sonucu mevcut rastlantısal `hitChance` modeliyle belirleniyor; bunu tek adımda değiştirmeden önce mevcut denge için ölçüm yapılmalı.

## Mimari önerisi
```
SENSORS (görüş + duyulmuş olay + alınan hasar)
    → PERCEPTION MEMORY (gözlenen konum / güven / süre)
    → SQUAD INTENT (savun / iki koldan ilerle / baskı ateşi / geri çekil)
    → BOT ACTION UTILITY (ateş et / siper al / yeniden konumlan / destek ver)
    → NAVIGATION (A* + yönelim/hız + yakın kaçınma)
    → AIM & WEAPON (fiziksel dönüş, nişan hatası, dost hattı, silah dengesi)
    → ANIMATION (gerçek hız, koşu, çömelme, köşe bakışı)
```
Önerilen değerlendirme ritmi: üst seviye takım kararı 2–4 Hz, bireysel karar 4–8 Hz, algı ~8 Hz, hareket/çarpışma her fizik karesi. Sayılar ilk optimizasyon önerisidir; gerçek FPS profili ölçülmelidir.

## Zorluk profilleri: ilk test aralıkları
| Değişken | Kolay | Normal | Zor | Uzman |
|---|---|---|---|---|
| İlk tepki | 0.55–0.80 sn | 0.35–0.55 | 0.25–0.40 | 0.20–0.32 |
| Hedef oturtma | yavaş | orta | hızlı | çok hızlı |
| Hedef takibi | zayıf | orta | iyi | çok iyi |
| Taktik güncelleme | seyrek | normal | sık | sık |
| Takım koordinasyonu | düşük | orta | yüksek | yüksek |
| Can/hasar çarpanı | 1× | 1× | 1× | 1× |
Tüm kademelerde sıhhiye, çevre dolaşma ve dost ateş güvenliği gibi temel akıl korunur. Zorluk hesaplanırken yakın tehdit, görüş açısı, mesafe ve hareket hesaba katılır. Bu aralıklar *oyun tasarımı hipotezidir*; oyuncu testleriyle kalibre edilmelidir.

## Yürütme sırası / uygulama paketleri
### V35 — Tek merkezli BotSkillProfile
Reaksiyon, nişan dönüşü, taktik kararı, hedef takibi, dikkat ve işbirliği parametreleri tek yapıdan okunmalı. Zorlukların ayrı ayrı ayarlanabilmesi; eski silah balance ve V34 karar tutarlılığı korunmalı.

### V36 — Doğal hareket, engeller ve merdivenler
Dönüş açısı ve hızına bağlı ivmelenme/fren; hedefe yaklaşırken yavaşlama; gereksiz sağ-sol hareketini azaltma; dar kapıda sıra ve alternatif geçit; basamak/yükseklik kontrollü hareket; sıkışmayı ve ulaşılmayan noktaları kayda alan ölçüm. Mevcut 50 düğümlü grafikten başla, ancak yeni haritaların geometri yoğunluğu gerekirse navmesh/Recast JS fizibilitesi ayrıca ölçülmeli.

### V37 — Nişan ve ateş davranışı
Hedef yakalama süresi, açısal takip, sürekli ve zamana bağlı nişan hatası, ilk atış ve seri kontrolü; her zorlukta silahların RPM/damage değeri aynı. Nişan modelini geliştirirken hitChance doğrulama ve ekranda görünen tracer/gerçek hasarın uyumu korunmalı. Dost ateş hattı hem silah hem drone/suppress ateşine uygulanmalı.

### V38 — Takım kararları (6v6)
Takım koordinatörü olası hedeflerini takımların anlık gördüğü verilere göre seçsin. Kişi bazlı roller: 1–2 hücum, 1 baskı, 1 kanat, 1 destek; mevcut kadroya göre eksik rol atansın. Keskin nişancı arka hattı ve gözlem mesafesini korusun; sıhhiye yaralıyı siper yanında tedavi etsin; ağır sınıf koruma/baskı; drone operatörü güvenli noktadan keşif. Aynı hedefe bütün takımın yığılmasını engelle.

### V39 — Hafıza, ses ve okunabilir tepkiler
Silah sesi, ayak sesi, patlama gibi olaylar duyulabilir işaret olarak sisteme girsin; duyulan yerde otomatik kesin isabetli nişan değil, şüphe/araştırma oluşsun. Son görülen konum hafızası sürsün; görmediği düşman yer değiştirdiyse gerçek koordinata anlık dönmesin. Görünür küçük baş/üst gövde için farklı görünürlük hesabı ve uyarı animi/poz tepkisi.

### V40 — Simülasyon, telemetri ve kalibrasyon
Senaryo grupları: (1) kapı koridoru iki yön trafik, (2) 3v3 siper geçişi, (3) 6v6 10 dakika, (4) farklı katta dost/merdiven, (5) görüş kaybı/son bilinen nokta, (6) doktor yardımı, (7) drone ve anti-drone, (8) yeniden doğuş, (9) dört zorluk ve iki farklı oyuncu becerisi. Her deneme için: sıkışma sayısı, geçiş süresi, durduk yerde yön değiştirme, sipere varış süresi, görülmeden ateş, takım arkadaşı engeli, dost ateşi, DPS/TTK, kill-death ve bot saldırı dağılımı. Test hedefleri veri toplandıktan sonra belirlenmeli. Testler deterministik Node + gerçek Chromium/WebGL QA olmalı.

## Test ve değişiklik ilkeleri
- Var olan V32–V34 regresyonlarını ilk kapı olarak koru.
- Her pakette ayrı dal/test ve okunabilir mini QA raporu.
- Performans ve kalite, 12 botluk normal maçta ölçülsün.
- `main`e onaysız merge yok. V31 KISS menü, silah/asker çizimleri, drone 110 HP korunur.
- İlk yatırım: zorluk profili + nişan davranışı + ölçümler. Büyük ölçekli ML/training, yeni navmesh bağımlılığı ve çok ağır davranış ağacı hemen gerekli değil.

## Birincil araştırma kaynakları
- Jeff Orkin, GDC F.E.A.R. (2006): https://gdcvault.com/play/1013459/Three-States-and-a-Plan
- NVIDIA 2024 / CS movement: https://research.nvidia.com/publication/2024-09_learning-move-professional-counter-strike-players
- Mafia III enemy AI: https://www.gamedeveloper.com/design/open-world-enemy-ai-in-mafia-iii
- Epic AI Perception / BT / EQS: https://dev.epicgames.com/documentation/en-us/unreal-engine/artificial-intelligence-in-unreal-engine
- Recast: https://github.com/recastnavigation/recastnavigation
- ORCA: https://gamma-web.iacs.umd.edu/ORCA/
- Bot training/difficulty study: https://pmc.ncbi.nlm.nih.gov/articles/PMC8224404/
- Game AI Pro: https://www.gameaipro.com/
