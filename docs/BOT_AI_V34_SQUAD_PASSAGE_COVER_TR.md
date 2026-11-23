# FRONT OPERATION — V34 takım hareketi, geçit yönetimi ve dinamik siper

## Başlangıç ve korunan özellikler
Başlangıç dalı: `ai/v33-fire-lane-discipline`. V33 ateş disiplini / sıhhiye kararları ve V32 görüş, son görülen pozisyon, A* ve destek sistemi korunur. V31 KISS 5 sekmeli menüler, V26/V25 asker çizimleri, silah özellikleri, harita, HUD, drone 110 HP ve mevcut maç kuralları değiştirilmedi.

## Yapılanlar

1. **Dar geçitte dost sıra düzeni:** Hedefe ilerlerken aynı katta ve önünde en fazla 3,1 m mesafede bir takım arkadaşı varsa, bot önce 1,5 m veya 2,1 m'lik çarpışmasız yan geçiş arar. Ara pozisyonlar ve bitiş noktaları gerçek harita çarpışmasına ve dost asker konumuna göre değerlendirilir.
2. **Bekleme ve karşıdan gelen trafik:** Geçit açılmıyorsa hız sıfırlanır; bu bekleme `stuckTimer` tarafından takılma olarak sayılmaz. Karşılıklı harekette bir botun sabit kimlik önceliği vardır; iki botun eşzamanlı birbirine yol vererek kilitlenmesi azaltılır. Oyuncunun geçiş önceliği korunur.
3. **Alternatif rota:** Aynı geçit 1,6 saniye boyunca tıkalı kalırsa, bot 2,3 saniye tekrar deneme sınırıyla engellenmiş düğümü dışlayan A* yolu arar. Boş veya uygun hedefe gitmeyen yol kullanılmaz; teleport yok.
4. **Kat ayrımı:** İtme/çarpışma kaçınma kuvvetleri artık başka katta bulunan asker veya oyuncu tarafından üretilmez.
5. **Takım lideri takibi:** Liderin yanındaki formasyon noktası doğrudan görülemiyorsa bot dümdüz duvara ilerlemez, A* ara noktaları kullanır. Aynı rota her kare yeniden hesaplanmaz; başarısız rotaya 1 saniye tekrar deneme gecikmesi uygulanır.
6. **Siper güncelliği:** Bot mevcut sipere kısa bir bağlılık süresi korur. Düşman son siper seçildiği noktadan anlamlı biçimde uzaklaşıp mevcut çömelme siperini açıkta bırakırsa, yeni erişilebilir siper seçer. Gizlenme hâlâ sağlanıyorsa eski siper korunur; boş/erişilemeyen alternatif reddedilir; 3,5 saniye taşınma soğuması uygulanır.
7. **Çatışma önceliği:** Yeni düşman görülürse, bot eski dostu geçme yan hareketini bırakır (ancak aktif sipere kaçış güzergâhını kesmez).
8. **Yaşam döngüsü:** Yeni davranış zamanlayıcıları ve niyetleri doğuş ve yeniden doğuş sırasında sıfırlanır.

## Kasıtlı sınırlar
- Silah hasarı, ateş hızı, yayılım ve sınıf dengesi değiştirilmedi.
- Yeni görünür HUD/menü öğesi eklenmedi; KISS korunur.
- Asker, yüz, silah veya çevre çizimine müdahale edilmedi.
- V32/V33 atış güvenliği, görüş hattı, son görülen düşman hafızası ve drone denetimi korunur.

## Tekrarlanabilir test
```bash
node tests/bot_ai_v32_regression.cjs
node tests/bot_ai_v33_regression.cjs
node tests/bot_ai_v34_regression.cjs
node scripts/check-inline-js.mjs
node scripts/check-best-components.mjs
node scripts/check-soldier-scene.mjs
```
- V32: **15/15** deterministik kontrol geçti.
- V33: **25/25** deterministik kontrol geçti.
- V34: **31/31** deterministik kontrol geçti.
- GitHub Actions üzerinde kaynak koruma ve gerçek Chromium/WebGL testleri de çalıştırılır; sonuç ayrıca Actions üzerinden değerlendirilmelidir.

## Gerçek oynanışta kalan gözlemler
Dar kapıda aynı anda üç takım askerinin hareketi; yukarı/aşağı kat geçişi; karşı yönlü askerlerin geçiş hakkı; düşman çevreleme sonrası eski siperi bırakma; uzakta kalan takım üyesinin A* ile lidere katılması; bot ölüm/respawn sonrasında geçit hafızasının sıfırlanması.

**Entegrasyon:** Geliştirmeler `ai/v34-squad-passage-cover` dalında; kullanıcı onayı olmadan `main` ile birleştirilmez.
