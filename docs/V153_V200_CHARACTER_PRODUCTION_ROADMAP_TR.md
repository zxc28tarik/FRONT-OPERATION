# FRONT OPERATION — V153–V200 karakter üretim yol haritası (TR)

## Amaç ve başlangıç
V152 (70bfda6fe51ca71b53fcd16b509368f27ce1c3de) referansıdır. V152 syntax/regresyon ve WebGL kabul testleri başarılı (45515257999, 45515257845). War Rock/CS okunabilirliği ile modern stilize taktik asker estetiği; fotogerçekçilik şart değil. Öncelik aksesuar sayısı değil silüet, anatomik bütünlük ve malzeme kalitesi. Mevcut beş sınıf, iki takım, oyun hitbox'ları, hasar, silah işlevi, harita ve bot AI kararları korunacak. HUD/menü bu kapsamda değil. Tek HTML dağıtım biçimi korunacak; yeni zorunlu uzak model/doku bağımlılığı yok.

## 48 aşama (aday sürümler, tamamlanmış sayılmaz)
| Sürüm | İş | Kabul |
|---|---|---|
| V153 | Anatomik birleşim denetimi: gövde, bel, kalça, omuz, diz | Üç açı ve hareketli pozda boşluk/çakışma kontrolü; temel rig ölçüleri sabit |
| V154 | Diz ve kalça çevresinde sürekli kumaş hacmi | Eklem konumu ve uzunluğu korunur; aşırı açı kontrolü |
| V155 | Dirsek ve omuz eklem geçişleri | Silah tutuşu ve mevcut el hedefleri korunur |
| V156 | Göğüs ve bel şekillendirme | Üst bedenin bütünlüğü; zırhla çakışma kontrolü |
| V157 | Pantolon kesimleri ve sınıfa göre hacim | Uzaktan okunabilir beş silüet |
| V158 | Bot ve paça birleşimi | Ayak animasyonu ve zemin ilişkisi korunur |
| V159 | Dikişler, kumaş panel sınırları | Desen ve dikişler doğal yüzeyde, gereksiz mesh yok |
| V160 | Doku UV ölçeği | Tekrarlama, eklem dikişleri ve bulanıklık kontrolü |
| V161 | Normal/bump mikro detay | Kumaş/deri farkı; aşırı parlama yok |
| V162 | Kıyafet roughness ve albedo ayrımı | Kumaş mat, metal/deri farklı; takım işareti korunur |
| V163 | Prosedürel temas gölgeleri | Zırh/kumaş birleşiminde kontrollü AO, kararma yok |
| V164 | Sınırlı kir ve aşınma | Yakında fark edilir, uzakta gürültü yaratmaz |
| V165 | Kafa ve çene anatomisi | Kask/maske ile uyum, 3 varyant |
| V166 | Göz çevresi ve yüz örtüsü | Gözlük oturuşu ve yüz silüeti |
| V167 | Kask biçimi ve kaplama | Beş sınıfın koruma profili |
| V168 | Gözlük ve vizör optik materyali | Okunabilir, yansımalar abartısız |
| V169 | Kulaklık/çene askısı oturuşu | Bağlantılar kafa hareketini takip eder |
| V170 | Baş detay LOD kontrolü | Dürbünde detay, normal uzaklıkta bütçe |
| V171 | Gövdeye oturan yelek | Ön/arka/yan panel hizası |
| V172 | Şarjör cebi ve yardımcı cep hacimleri | Kumaş görünümü, asılı parça yok |
| V173 | Kemer ve askı bütünlüğü | Omuz-bel bağlantısı |
| V174 | Sınıfa özel çanta ve ekipman bağlantısı | Sağlık simgesi ve sınıf tanımları korunur |
| V175 | Eldiven/parmak görsel şekli | Tutuş hedefi ve mevcut silah değişmez |
| V176 | Diz/dirsek koruması | Eklemde yapay küre görünümü azaltılır |
| V177 | Assault sınıf tasarımı | Dengeli, atletik silüet |
| V178 | Medic sınıf tasarımı | Kompakt, sağlık işareti net |
| V179 | Engineer sınıf tasarımı | Teknik ekipman, okunabilirlik |
| V180 | Sniper sınıf tasarımı | İnce profil, baş/omuz silüeti |
| V181 | Heavy sınıf tasarımı | Geniş omuz ve ağırlık hissi |
| V182 | Takım/kişisel görünüm varyasyonu | IFF renkleri ve sınıf tanınması bozulmaz |
| V183 | İskelet prototipi, bağımsız aday | Mevcut rig ile aynı dinlenme pozunda |
| V184 | Birleşik skinning: alt beden prototipi | Ağırlık toplamı 1, geçerli indeksler |
| V185 | Birleşik skinning: üst beden prototipi | El/baş/silah bağlantı toleransı |
| V186 | Ağırlık boyama ve eklem deformasyonu | 0–90° bükülmelerde yırtılma yok |
| V187 | Görsel rig adaptörü | AI/hitbox değişmeden eski rig geri dönüşü |
| V188 | Performans A/B kapısı | Yakın/orta/uzak ve 15+ bot profili |
| V189 | Ayak IK prototipi | Rampada/merdivende zemine yakınlık; oyun hareketi sabit |
| V190 | El IK tutarlılığı | Mevcut tutuş hedefleri; görsel düzeltme |
| V191 | Yürüme/koşma geçişi | Kayma ve ani poz değişimi azalır |
| V192 | Yan/geri hareket | Yön uyumu, bacak çakışması kontrolü |
| V193 | Çömelme/kalkma ve dönüş | Akıcı geçiş; göz/silah yönü korunur |
| V194 | Ağırlık aktarımı/nefes | Çatışmada gereksiz salınım yok |
| V195 | Ekipman ikincil hareketi | Sınırlı genlik, çakışmasız, LOD uyumlu |
| V196 | Görsel ölüm animasyonu adayları | Ölüm/yeniden doğma kuralları değişmez |
| V197 | Geometri, materyal ve gölge bütçesi | Paylaşılan kaynaklar, yakın/uzak LOD |
| V198 | 30 model ve hareket pozları QA | 2 takım × 5 sınıf × 3 varyant |
| V199 | Gerçek maç ve karşılaştırmalı görseller | 3 açı, yakın/orta/uzak, hareket, dürbün, 6v6 ve yüksek bot sayısı |
| V200 | En iyi adayların birleştirilmesi | Onaylı farklar, geri dönüş noktası ve sürüm notları |

## Uygulama paketleri
A V153–158 anatomik süreklilik; B V159–164 tekstil ve malzeme; C V165–170 baş; D V171–176 ekipman; E V177–182 sınıflar; F V183–188 alternatif rig; G V189–196 animasyon; H V197–200 kalite ve optimizasyon. Paketler bölünebilir; sürüm numarası tek başına tamamlanma kanıtı değildir.

## Mimari ve kalite kapıları
- V25 base factory ve önceki onaylı modüller değişmeden, yalnız enhanced görsel yolunda çalış. Yeni şekiller/material cache ile paylaşılmalı. Geometri değişimi hitbox/AI veya silah işlevine taşınmamalı.
- Önce mevcut modelin statik ve dinamik incelemesi; ardından küçük ve bağımsız değişiklikler. Eski V152 sürümü karşılaştırma ve geri dönüş noktası.
- Geometri testleri: tüm position/normal değerleri sonlu; LOD geri dönüşü, baş/silah/eklem parent ilişkileri; el hedefleri; paylaşılan kaynaklar; takım işaretleri; deforme pozlar. Yakın detay draw-call artışı gerekçeli olmalı; uzak detay bütçesi korunmalı. Hedef: eşdeğer sahnede medyan frame time en fazla %10 artış (ölçülmemişse geçmedi olarak işaretle), uzak mesh/üçgen sayısında gereksiz artış yok.
- Görsel kontrol: aynı ışık, kamera, sınıf, poz ve açı; önden, yandan, arkadan ve yakın plan; 0/45/90° eklem örnekleri; farklı FOV. V152 ile yan yana görüntüler. Görsel onay olmadan kalite iddiası kesinleşmez.
- Eski testler + gerçek Three.js r128 + Chromium/WebGL. 6v6 ve 15+ botta performans ölçümü, iki harita, ölüm/respawn, izleme, dürbün. Test sonucu bekleniyorsa açık yaz. Önce aday dal; main'e otomatik merge yok.
- Skinning/IK: prototip olarak ilerle, mevcut rig ile eşdeğerlik ve bütçe sağlanırsa entegre et. Fiziksel ragdoll zorunlu değil; güvenilir görsel animasyon tercih edilebilir.
- Her paket: değişiklik özeti, commit SHA, test bağlantısı, görsel kanıt ve kalan kusurlar. Başarısız aday geri alınır, önceki en iyi bileşen korunur.

## İlk uygulama
V153–155 adayında mevcut V152 geometrisini incele, gerçek eklem pozlarında görülebilecek sert küre biçimini azaltmak üzere yalnız görsel eklem yüzeylerini düzenle; yeni iskelet/IK tamamlandı iddiasında bulunma. İleriki aşamalar ölçüm ve görsel karşılaştırma sonrası.
