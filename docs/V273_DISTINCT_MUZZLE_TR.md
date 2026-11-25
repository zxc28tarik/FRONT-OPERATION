# V272–V273 — Silaha özel namlu ateşi görselleri

Yedi ayrı kurgusal VFX silüeti: HK416 daralan alev, MP7 kısa kompakt parlama, MRAD ince uzun parlama, Minimi geniş yapraklı düzensiz taç, P320 küçük yuvarlak parlama, Glock18C iki tepeli kısa parlama, Carl Gustaf ayrı geniş ön parlama. Her birinin desen, renk, süre, sönme ve ölçek değerleri görsel tasarım amaçlıdır; fiziksel silah verisi değildir.

Tek 128×512 RGBA doku atlası (256 KiB ham), yedi önbelleğe alınan geometri (6–8 üçgen), botlar için ortak materyal, oyuncu için tek yeniden kullanılan mesh ve materyal. Yeni dinamik ışık yok. Oyuncu ve üç bot ateş yolunda gerçek silah kimliği seçilir; mevcut namlu bağlantıları, recoil, hasar ve AI zamanlamaları değiştirilmez. Carl Gustaf için yalnız görsel ön parlama eklenir; arkaya ayrı efekt eklenmez. Oyuncu efekti kare başlangıcında yaşlandırılır, duraklatma/ölüm/maç sonu temizlenir.

Kabul: yedi benzersiz doku ve geometri, kaynak paylaşımı, ışık konumu, silah değişimi, sönme ve bot namlu bağlantısı; eş kamera ölçeğinde WebGL görsel sayfası. V271 inline CI başarılı. V273 CI, görsel inceleme ve maç FPS ölçümü henüz doğrulanmadı. Ana dal değiştirilmedi.
