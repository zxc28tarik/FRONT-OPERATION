# C4 / V291 — Yanal ve geriye hareket (izole ön çalışma)

- Temel: V287, PR #66, a34c2ca958379b0023b0ee0418b40d01daeced61. PR tetiklemeli inline syntax kontrolü 45704603144 başarılı. Push tetiklemeli WebGL kabul sonucu doğrulanamadı; bağlantı aracı yalnız PR tetiklemeli çalışmaları listeliyor.
- C1–C3 (V288–V290) kabulü kayıtlı değil. Bağlayıcı plan sırası korunur: canlı oyuna bağlantı V287 kabulü ve V288–V290 uygulama/kabulü sonrasında yapılabilir. Bu dal bir ön çalışma, sürüm kabulü değildir.
- Mevcut botVisualGait eğrisi incelendi. Saf geri harekette ileri adımın işareti ters çevriliyor; saf yan harekette ayak kaldırma payı sınırlı. Aday yalnız yerel poz açılarına etki eder: geri erişim %20 kısalır, kontrollü yan açıklık ve ek salınım dizi bükülmesi eklenir. İleri eğriler korunur. Yeni mesh, zamanlayıcı, RNG, pozisyon veya AI değişikliği yoktur.
- scripts/check-v291-directional-gait-draft.mjs: gerçek V287 gait fonksiyonu ile sayısal karşılaştırma. Aynı aday ve doğrulama fonksiyonları bağlantı çalışma ortamında yürütüldü: 28.800 sayısal assertion başarılı (5 sınıf, 6 hız, 3 çömelme durumu, 32 faz; ileri koruma, sonlu/sınırlı açı, hareketsiz koruma, ayna simetrisi, geri erişim). Bu sonuç entegre oyun veya görsel kabul değildir.
- Bekleyenler: C1–C3 ve V287 kabul kapısı, mevcut ayak temas/IK ve silah tutuşuyla entegrasyon, gerçek Chromium/WebGL görüntüleri, zemin kayması ve üç mod performans regresyonu.
- Oyun index.html dosyasına ve AI koduna dokunulmadı. Yeni oynanabilir HTML sürümü yoktur.
