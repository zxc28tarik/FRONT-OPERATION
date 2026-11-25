# FRONT OPERATION — V11 asker ayrıntılarını V25'e kontrollü taşıma

Tarih: 22.11.2026  
Dal: `restore/v25-approved-components-20261122`, PR #2 (taslak)

## Kaynak karşılaştırmasının sonucu

- `references/1B_asker.html` V11 1B modelinde V25'te olmayan estetik ayrıntılar görüldü: iki yandaki kargo cepleri, arka kemer çantası, göğüs taşıyıcı omuz kayışları, sıhhiye çantası yan rulosu.
- V11'in tüm kafasını, silahını, gövde oranlarını, daha eski isabet/animasyon bağlantılarını **kopyalamadık**. Bunlar ileriki V25 modelinin kimliğini ve davranışını bozabilirdi.
- V25'in orijinal `createBotSoldierMesh(team, classId)` fonksiyonu **referanstakiyle birebir aynı** kaldı.

## Yapılan gerçek kod değişikliği

`index.html`:
- `enhanceV25SoldierWithV11Details(model, team, classId)` eklendi. Aynı dört geometri tipini tüm sınıf ve takımlarda tekrar kullanır.
- **Kargo cepleri:** Sol/sağ bacak üstüne bağlı 2 parça; bacaklar yürürken birlikte hareket eder, nötr duruşta yüzeyden görünür.
- **Taktik arka kemer çantası:** `model.root` üstüne 1 parça.
- **Plaka taşıyıcı omuz kayışı:** Göğüs zırhının üstünden geçen 2 parça, `model.upperBody` üzerinde.
- **Sıhhiye sınıfı:** Mevcut V25 sırt çantasının yanına 1 malzeme rulosu.
- `createEnhancedBotSoldierMesh` yeni oluşturan ara katman oldu. Mavi BOT, kırmızı BOT ve drone oyuncu görünümündeki asker stand-in çağrıları bu katmanı kullanıyor.
- Fazladan **5 görsel mesh/normal asker**, **6/sıhhiye**; orijinal zırh, kafa, hitbox, collider, silah, mermi izi, animasyon veya sağlık değeri değişmedi.

## Güvenlik ve regresyon testleri

`scripts/check-soldier-scene.mjs`:
- İki takım × beş sınıf = **10 ayrı model**: orijinal V25 ile yeni V11 ayrıntılı V25 modelini yan yana oluşturur.
- `root +1`, `upperBody +2/+3`, `leftHip +1`, `rightHip +1` yapısal nesne kontrolleri.
- Kargo ceplerinin her bacağın dış yanına bağlı olduğunu kontrol eder.
- Kafa pivotu, kask/NVG/gözlük, vuruş merkezinin **1.54 m** yüksekliği ve namlu bağlantısı korunur.
- Üç üretim noktasında yeni asker üreticisinin kullanıldığı kontrol edilir.
- `scripts/check-best-components.mjs` hâlâ V25 orijinal model kodunu arşivdeki onaylı kaynakla birebir kıyaslar.

### Hâlâ tamamlanmamış QA

Gerçek Chromium/WebGL görüntü A/B, oyun içinde yürüme/çömelme, yakın/uzak siluet, yeni ceplerin gövdeyle görsel kesişimi ve 6v6 performans testi **henüz yapılmadı**. Sırf kod testi görsel anlamda daha güzel olduğunun kanıtı değildir.

**Birleştirme kararı:** PR #2 taslak kalır, `main` değiştirilmez. Kullanıcının görsel onayı ve gerçek tarayıcı kabul testi sonrası değerlendirilir.
