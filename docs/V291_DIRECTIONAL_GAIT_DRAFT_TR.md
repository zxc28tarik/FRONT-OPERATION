# C4 / V291 — Yanal ve geriye hareket

- Temel: V287, PR #66, a34c2ca958379b0023b0ee0418b40d01daeced61. PR inline syntax kontrolü 45704603144 başarılı. Önceki WebGL kabulü ve C1–C3 (V288–V290) kabulü doğrulanamadı.
- Kullanıcı C4'ü başlatıp bitirmeyi açıkça istedi. Uygulama ayrı aday dalda gerçekleştirildi; ana dala birleştirilmedi, önceki kapılar kabul edildi sayılmadı.
- Oyun index.html commit e5a6e625b3f980ee7f302a6e96f067ecd0bca01a: yalnız botVisualGait fonksiyonunda mevcut altı yerel poz açısı değiştirildi. Geri adımın görsel uzanımı %20 kısaltıldı; yanal açıklık ve salınım diz bükülmesi eklendi. Saf ileri ve duruş eğrileri değişmedi. Var olan IK, yön filtresi, gövde ve silah tutuşu kodu korunuyor. Yeni mesh, doku, zamanlayıcı, RNG, konum veya AI değişikliği yok.
- Doğrudan çalıştırılan sayısal kontroller: 28.800/28.800 assertion, 40.320/40.320 prototip/entegrasyon poz eşitliği, tam inline JavaScript syntax PASS. V287'ye göre gait fonksiyonu dışındaki HTML karakter karakter aynı. Bu sonuçlar gerçek maç veya FPS kabulü değildir.
- scripts/check-v291-directional-gait-draft.mjs, değişmeyen V287 commitine göre bütün kaynak korumasını ve 69.120 sayısal kontrolü tekrarlanabilir yapar.
- scripts/browser-v291-directional-gait.mjs: gerçek WebGL'de 5 sınıf × 4 yön × 2 faz = 40 eş kamera poz karşılaştırması, root koruması ve çizim maliyeti. Tarayıcı testi henüz doğrulanmadı. Ayrı oyun içi ayak kayması, üç mod ve gerçek FPS kabulü açık.
- C4 durum: kodlandı, sayısal kabul başarılı, görsel/WebGL ve önceki aşama kabul kapıları açık. Sonraki C5'e geçilmedi.

## C4 CI düzeltmesi

Run 45711997294: syntax adımı ve önceki BOT AI regresyonları başarılı; V103 görsel gait testi başarısız (eski geri adım simetrisi kuralı). Test gevşetilmedi. Orijinal botVisualGait birebir geri getirildi ve aktif görsel çağrı botVisualGaitV291 olarak ayrıştırıldı. Önceki C4 aday çıktıları değişmedi (28.800 + 40.320 yeniden geçti). V287 kaynak karşılaştırması yalnız yeni saf görsel fonksiyon ve tek çağrı değişimini kabul eder. Tarihsel V103 test dosyası değiştirilmeden doğrudan yürütüldü ve başarılı. Güncel GitHub CI/WebGL henüz doğrulanmadı; C5 entegrasyonu bloke.
