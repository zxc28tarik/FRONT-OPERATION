# FRONT OPERATION — Gerçek Chromium/WebGL ve asker görsel karşılaştırma raporu

**Tarih:** 23 Kasım 2026 (Türkiye), GitHub Action zaman damgaları 22.11.2026 UTC  
**Dal:** `restore/v25-approved-components-20261122` | **PR #2: DRAFT**, `main` değişmedi.

## 1. Gerçek tarayıcı kabul

GitHub Actions **45080781087** üzerinde Ubuntu 24.04, Playwright Chromium **140.0.7339.16**, WebGL 2 (SwiftShader) ile gerçek HTML oyunu çalıştırıldı. Aşağıdakilerin tamamı **PASS**:

1. Menü açıldı; FRONT OPERATION başlığı ve beş sınıf kartı; **1440×900 WebGL 2**.
2. Maç başlatıldı; TAB skor tablosu **6 mavi / 6 kırmızı**.
3. Sniper MRAD dürbününde ADS arayüzü göründü.
4. FPV drone açıldı, 110/110 HP paneli ve geri çağırma arayüzü çalıştı.
5. Oyun sırasında **0 uncaught JavaScript hatası, 0 console error** kaydedildi.

Kaynak ve sahne grafiği testleri ayrı olarak yeşil. Bu test **gerçek oyuncu deneyimi, FPS veya uzun maç bot zekâsı kabulü** yerine geçmez.

## 2. Asker modelini bu kez gerçekten görüntüledik

`scripts/character-turntable.mjs` özel test sahnesi, **aktif koddan doğrudan** `getSoldierSharedAssets`, `createBotSoldierMesh` ve V11 zenginleştirici katmanını alır. Her sınıfın:
- **Orijinal V25** (solda);
- **V25 + seçili V11 ayrıntıları** (sağda)

aynı ışıkta, aynı kamera/ölçekte renderı yapılır.

**20 ekran görüntüsü** elde edildi: Mavi takım beş rol için ön/sağ/arka, kırmızı takım beş rol için ön görünüm. Mesh sayısı farkları 5/6 ve kafa merkezi 1.54m testleri PASS.

## 3. GERÇEK GÖRSEL HATA DÜZELTİLDİ — kask

**Önce:** V25 normal askerlerinin kask kubbesinin ön tarafı dışarıdan görünmüyor, baş üstü ten rengi açık kalıyordu. V5 restorasyonundan kaynaklanmayan, V25'in paylaşımlı `LatheGeometry` geometrisinden miras kalan bir hata.

**Kök neden:** `getSoldierSharedAssets` içindeki `helmetPoints` dizisi yukarıdan aşağı sıralıydı. `new THREE.LatheGeometry(helmetPoints, 16)` dış normals/ön yüz yönünü ters bıraktığından kask kubbesinin ön yüzü backface culling ile kayboluyordu.

**Düzeltme:** `new THREE.LatheGeometry(helmetPoints.slice().reverse(), 16)`. Kaskın geometrisinin dış yüzü artık görünür. Nokta dizisinin kendisi bozulmuyor. `scripts/character-turntable.mjs` artık pozisyon-normal vektörlerinin radial dot toplamının pozitif olduğunu gerçek Three.js WebGL koşusunda doğruluyor.

**Görsel kanıt:** 22 Kasım CI 45080479512 kask öncesi, 45080781087 kask sonrası. Yeni assault front görüntüsünde baş üstü açık ten rengi değil, koyu taktik kaskla kaplı.

## 4. İleride giderilecek GÖRSEL kalite açıkları

Görüntülere bakınca **maddi kalite artırımı hâlâ gerekiyor**:
- Gövde zırhı özellikle önden çok geniş/düz kutu gibi; omuz-gövde geçişleri mekanik.
- Uzun açık boyun ile çene/kask arasında kıyafet bütünlüğü zayıf; V11'in taktik boyun yakası gibi bir detay denenebilir.
- Eller, bilek ve silah kabzası bağlantısı silahı gerçekten tutmaktan çok önde tutuyormuş hissi verebiliyor.
- V11'den seçilen 5/6 küçük aksesuar yapısal olarak çalışıyor ama silueti yalnız hafif zenginleştiriyor; bu tek başına ileri kalite seviyesi değil.
- Birinci şahıs ilk oyun ekranı görüntüsünde geniş boş gökyüzü/tek duvar var; otomatik kamera bakışı haritayı sergilemiyor. Ayrı yönlü harita kamera/güzergâh QA gerekir; bunu otomatik olarak spawn bug ilan etmiyoruz.
- Yürüyüş, çömelme, koşma ve BOT çatışma animasyonlarının A/B videolu/dinamik görsel testi henüz yok.
- 6v6 FPS yük testi, çarpışma ve uzun süreli stabilite testi henüz yok.

## 5. Kaydedilen araçlar

- `.github/workflows/browser-webgl.yml`: gerçekte Playwright/Chromium çalıştırır, PNG + rapor ZIP kaydeder.
- `scripts/browser-webgl-smoke.mjs`: 5 senaryo; gerçek 6v6 ve FPV.
- `scripts/character-turntable.mjs`: 20 adet aynı koşullu asker karşılaştırması + kask geometrisi normale testi.
- Son başarılı runner: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45080781087
- PNG/report arşivi: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45080781087/artifacts/14777221896

## Öncelik

**Önce gövde-silah tutuşu ve boyun-zırh görsel bütünlüğü**, sonra haritayı uygun kamera/açıyla gerçek 6v6 gezinti QA'sı, daha sonra çatışma hissiyatı ve performans. `main` ile birleştirme için kullanıcı onayı beklenecek.
