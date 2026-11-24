# FRONT OPERATION — Sınıf, silah ve maç durumuna göre davranış
**Kullanıcı kararı (24 Kasım 2026):** Bu konu ayrı ve ileriye ertelenen tek bir paket değil, bundan sonraki her bot geliştirme adımının yatay gereksinimidir. Gereken sınıf/silah/maç durumu farkı ilgili yeni adımın içinde uygulanır. V67 ve öncesinde tamamlanan adımlara ait eksikler mevcut ileri paketlerin ardından toplu geriye dönük denetimde ele alınır. Kritik regresyonlar bu ertelemenin dışındadır.

## Karar girdileri ve öncelik
Mevcut sınıf + fiilen kullanılan silah (ana/yan silah, şarjör durumu) + takım ve maç evresi + gözlenen tehdit + sağlık + ulaşılabilir oyun içi konum + mevcut görev. Sınıf tercihi esnektir, zorunlu rol değildir. Acil tehlike ve maçın geçerli görevi sınıf eğilimine üstün gelebilir; mevcut görünürlük, dost hattı, tepki/nişan ve fizik kuralları her zaman korunur. Yeni silah/sınıf/harita veya hasar ayarı yok.
 
| Sınıf | Saldırı eğilimi | Savunma eğilimi |
|---|---|---|
| Taarruz / HK416 | Öncü, uygun oyun içi orta mesafe | Alan kontrolü, gerektiğinde destek |
| Medic / MP7 | Öncüyü takip, mevcut iyileştirme işlevi | Takım desteği, yakın bölge |
| Mühendis / MP7 | Keşif, uygun durumda görev operatörü adayı | Dar oyun içi alanlar, uygun durumda çözme adayı |
| Keskin nişancı / MRAD ve yan silah | Uzaktan destek; aktif silaha göre karar | Uygun görüş noktası; yakın temasta mevcut yan silah davranışı |
| Ağır / Minimi | Destek, hareket/ateş disiplini | Alan tutma, mevcut destek yetenekleri |

Bomba modu: saldırı öncesi (ilerleme), saldırı sonrası (koruma), savunma öncesi (alan kontrolü), savunma sonrası (geri alma/çözme) ayrı bağlamlardır. Marien'de bomba evreleri uygulanmaz. Görev operatörü seçiminde uygunluk, süre, mesafe, sağlık ve tehdit sınıf tercihinden önce gelir; hiçbir sınıf göreve tek başına yetkili değildir.

## İleri paketler
| Sürüm | Paket | İçine eklenecek sınıf/bağlam gereksinimi |
|---|---|---|
| V68 | Şarjör ve yeniden doldurma, ateş disiplini | Fiili silah kapasitesi/atış biçimi ve temas/görev durumu; güvenli oyun içi fırsat; sınıfın rolünü koru |
| V69 | Takım koordinasyonu ve alan paylaşımı | Sınıf rolleri, saldırı/savunma evreleri, eksik sınıflara esnek görev devri, görev operatörünün korunması |
| V70 | Oyun içi görev/evre tutarlılığı | V69 ile örtüşmeyen yeni eksikler; dört bomba bağlamı, zaman ve görev geçişleri |
| V71 | Geriye dönük denetim ve düzeltme | V54–V67 algı, hareket, rota, siper, pozisyon ve görev seçimlerindeki sınıf/evre boşluklarını toplu incele; gerekli olanları düzelt |
| V72 | Bütünleşik doğrulama | Sınıf × maç evresi × fiili silah senaryoları, uzun maçlar ve insan oynanış kontrolü |

Numaralar geçici planlama sırasıdır; yeni ihtiyaçlar ilgili pakete alınır, sırf sınıf farkı eklemek için yapay davranış oluşturulmaz. V68/V69 mevcut sırası korunur. V70–V72 önerilen sonraki paketlerdir; kullanıcının ayrıca onayladığı kesin sürüm numaraları değildir.

## Her adımın kontrol kapısı
- İlgili davranışta sınıf, aktif silah veya maç evresi anlamlı fark yaratıyor mu? Evetse kod + senaryo testi; hayırsa gerekçe.
- Aynı sınıf farklı evrelerde, farklı sınıflar aynı evrede, yan silah ve eksik sınıf senaryoları; geçerli görüş ve görev kuralları.
- Genel regresyon ve uzun maçlarda isabet, tıkanma, hedef tutarlılığı, takım yayılımı, doğal bomba kurulumu/çözme; teknik PASS kalite garantisi değildir.
- Önceki aşamaların kapsamı kendiliğinden genişletilmez. V64 isabet ve Tersane sıkışma uyarıları, V66/V67 henüz açık doğrulamalar takip edilir.
- Bu belge karar ve plan kaydıdır; oyun kodu bu commit ile değişmez.
