# C — Karakter animasyonları V289/V290/V293–V295

Kullanıcının açık C tamamlama talimatı. Temel commit 05300ee60c44e2915b0b3445eab96122731ec3ab; oyun değişikliği caba0828d9ca3fae7e367548025207945111e956, oyun blobu 487e4717e7826fba521312fe8df6875608557b12. Mevcut art/v292-crouch-transition dalı, PR #68. Yeni dal açılmadı.

| Aşama | Uygulama | Durum |
|---|---|---|
| V288 | 30 model, 270 pivot, 120 LOD ve 5160 örnek temel kabulü | Önceki CI 45732947151 başarılı |
| V289 | Gerçek görsel hız ve mevcut faza göre sürekli yürüyüş adım zenginleştirmesi, boşta kademeli sıfır, basan ayağa daha az katkı | Kodlandı, sayısal test geçti |
| V290 | Yürüyüşten koşuya yumuşak geçiş, salınım ve diz toparlanmasının ayrışması | Kodlandı, sayısal test geçti |
| V291 | Yana/geriye mevcut hareket | Önceki WebGL 45728393201 başarılı, kod aynen korunuyor |
| V292 | Mevcut çömelme eğrisi | Önceki WebGL 45728393201 başarılı, kod aynen korunuyor |
| V293 | Dönüş yönüne göre destek ayağı açıklığı, gövde zırhı/taşıyıcı parçalarında hafif görsel denge | Kodlandı, sayısal test geçti |
| V294 | Mevcut ölüm fazına bağlı önceki hareket katkısının sönmesi, diz/ayak/ekipman oturma yayı, taşıma ekipmanı ikincil hareketi | Kodlandı, sayısal test geçti |
| V295 | Beş sınıf profili, takım/variant aynı animasyon sözleşmesi, 20–40 mesafe arası yumuşak görsel katkı sönümü; uzak LOD ve deneysel rig koruması | Kodlandı, sayısal test geçti; 30 varyant gerçek WebGL kabulü bekliyor |

## İzolasyon
Yeni katman sadece renderer.render çağrısından önce çalışır ve finally bloğunda ters sırada bütün geçici x/z rotasyonları geri yüklenir. Root, upperBody, head, weaponPivot, muzzleFlash, mantıksal konum, bot hareket/nişan/hasar/AI ve fizik kaynakları değiştirilmez. Torso dengesi gövdenin tamamı yerine bağımsız zırh/taşıyıcı parçası üzerindedir; ekipman taşıma animasyonu bağımsız çanta/cep detaylarında uygulanır. Opt-in deneysel rig sahibi botlara yeni katman uygulanmaz. Uzak LOD'da katkı sıfır. Yeni mesh, materyal, doku, ışık veya RNG çağrısı yok. WeakMap ile yalnız mevcut düğümlerin referansları tutulur. Mevcut tüm oyun kaynağı iki yeni render entegrasyonu geri alınarak birebir doğrulandı; updateBots ve rig üretim kaynağı birebir aynı, RNG çağrı sayısı 87/87. Doğrudan matrixWorld okuması yok. Ayak kayması / görsel estetik kullanıcı onayı ayrıca değerlendirilir.

## Test
tests/soldier_v295_render_pose_regression.cjs kaydedilmiş oyun kaynağında 161815/161815 kontrol başarılı; tüm sınıflar, hızlar, çömelme, dönüş, ölüm sonu ve sürekliliği, uzak LOD ve 100 geri yükleme döngüsü. Inline JS parse geçti. scripts/browser-v295-render-pose.mjs: 2 takım x 5 sınıf x 3 varyant x 4 poz = 120 eşli WebGL örneği, görünür fark, aynı çizim çağrısı/üçgen sayısı, root/aim/namlu ve yerel dönüşlerin korunması. CI 45733955697 başlatıldı; son denetimde gerçek WebGL sonucu henüz yok. Gerçek FPS veya performans iyileşmesi iddia edilmez.

C 8/8 kod düzeyinde ele alındı; teknik kabul önceki 3/8 + yeni paket sonucu bekliyor. Ana dala birleştirme yapılmadı. Sıradaki D ses tasarımı ancak C kabulü sonrasında.
