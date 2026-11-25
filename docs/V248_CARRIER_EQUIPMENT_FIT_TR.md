# FRONT OPERATION — V248 ekipmanların karaktere oturuşu

**Temel:** V247 (`art/v247-tailored-cloth-surfaces`); **amaç:** yalnızca mevcut üçüncü şahıs asker modelinin zırh ve ekipmanlarının birbirine nüfuz etmesini veya havada asılı görünmesini azaltmak.

## Değişiklikler
- Ön zırhın gerçek geometri ve ölçek sınırından, üst/alt şarjör-admin ceplerinin sırt yüzeyi otomatik hizalanır. Dört mevcut cep yeniden kullanılır.
- Arka zırh yüzeyine göre medic/engineer/heavy mevcut sırt çantaları gövdeye oturtulur; ilgili sağlık amblemleri, mühendis ekipmanları ve heavy mühimmat bağlantısı aynı göreceli mesafede birlikte taşınır.
- Mevcut iki omuz/kayış parçasının zırh ön/arka kenarlarını karşılaması için görünüm ölçekleri sınır içinde ayarlanır. Yeni kayış modeli yapılmaz.
- Bel ekipmanı mevcut karakter profilinin belirlediği genişliğe uyarlanır; kemer tokası, kalça/kol/bacak pivotları ve silah tutuşu sabit kalır.
- Değişiklikler model oluşturma sırasında bir kez uygulanır; hareket veya kare başı yeni CPU işlemi getirmez.
- Sınıf, takım, animasyon, silah, hitbox, bot ve harita kuralları değişmez.

## Denetim
`scripts/check-v248-equipment-fit.mjs` 2 takım × 5 sınıf × 3 varyant = **30 model** üzerinde dört ön ceplik seti, iki omuz kayışı, üç sınıfın sırt seti/ekleri, kask, V247 kumaş ve 7 pivot istikrarını karşılaştırır. Ayrıca artan karakter mesh/draw call sayısını sıfır olarak bekler.

V248 kaynak denetimi kod tamamlanması ile eş anlamlıdır; Chromium/WebGL screenshot, 6v6, bomba ve deneysel rig çalışmaları CI sonucunda doğrulanmalıdır. Gerçek donanım FPS ve görsel oyuncu kabulü ayrıca beklenir.
