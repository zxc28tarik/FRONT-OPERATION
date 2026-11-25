# V265–V270 — Silah görselleri toplu bitiriş paketi

V264 tabanında kalan altı aşama tek dalda uygulanmıştır.

| Aşama | İş |
| --- | --- |
| V265 | Altı yardımcı ekipman dış yüzeyi yeniden biçimlendirildi; ayrıca V264'te koruma testini bozan V25 karakter kurucusu etiketleri ayrı görsel katmana taşındı. |
| V266 | Mevcut eldiven avuç ve eklem koruyucularına düşük segmentli yüzeyler; parmak ve tutuş konumları korunur. |
| V267 | Şarjör görsel hareketine bağlı sınırlı destek eli hareketi ve tam sıfırlama. Yeni animasyon sistemi veya oyun mekaniği yoktur. |
| V268 | Silah değişiminde tekil geometri/materyal kaynaklarını bir kez serbest bırakma; ortak doku ve materyaller korunur. |
| V269 | V255/V270 eş kamera ve ışık altında 12 model, iki açı ve altı reload görüntüsü (30 karşılaştırma); WebGL render çağrıları ve üçgenleri raporlanır. |
| V270 | V255/V264/V270 birleşik kabul: 12 viewmodel, 30 karakter varyantı, 606 reload/destek eli poz örneği, 36 model değiştirme, geometri, bağlantı, kaynak ve kaynak-kod koruma testleri. |

V264 CI başarısızlığı: Inline JavaScript syntax check workflow 45628759943, "Verify best approved V5-V25 components", V25 createBotSoldierMesh birebir koruma kontrolü. V270 bu kurucuyu V262 ve V255'teki özgün gövdeye döndürür; etiketler enhancement katmanında atanır. Koruma testinin kendisi değiştirilmedi.

Sınırlar: yeni mesh, yeni doku, oyun istatistiği, bot davranışı veya harita değişikliği yoktur. V265/V266'da mevcut geometrilere ilave üçgenler gelir; V270 testinde model başına V264 üzerinde 400, V255 üzerinde toplam 1200 ek üçgen bütçesi uygulanır. Render çağrıları ve gerçek GPU/FPS maliyeti ayrı konudur. Destek eli tam IK değildir, görsel uyumu ayrıca değerlendirilmelidir.

Kabul durumu: kod ve test altyapısı kayıtlı; yeni CI, WebGL ve insan görsel/FPS onayı alınmadan nihai kabul veya ana dal birleştirmesi yapılmaz. Bot zekâsı V271–V285 olarak en son ele alınacaktır.
