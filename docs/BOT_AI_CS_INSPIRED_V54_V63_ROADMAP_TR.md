# FRONT OPERATION — CS referanslı bot zekâsı yol haritası (V54–V63)

**Karar tarihi:** 24 Kasım 2026
**Durum:** Kullanıcı onaylı geliştirme yönü; V54 henüz başlamadı.
**Ana hedef:** Counter-Strike 1.6 / Condition Zero botlarının okunabilir, amaçlı ve tutarlı oyun içi davranışlarına yaklaşmak. Daha yüksek isabet tek başına zekâ değildir. Quake III yardımcı navigasyon ve hareket referansıdır. CS2'nin kapalı kaynak uygulaması hakkında doğrulanmamış iddialarda bulunulmaz.

## Başlangıç ve korunacak kurallar
- V53 geliştirme dalı: ai/v52-coherent-movement, PR #13; kod referansı de6ee3aa2960c8b57aa0f5dd659432d1d9377f71. Ana dalda birleştirilmiş varsayılmaz. V54 öncesi CI ve gerçek tarayıcı sonuçlarını tekrar kontrol et.
- Marien ve Tersane haritaları, modeller, silahlar, hasar/atış hızı, sınıf yetenekleri, HUD ve menü değişmeyecek; ayrıca istenirse ayrı değişiklik olarak ele alınacak.
- Her 5 bot doğuşunda 3 normal, 2 zor; her 15. doğuşta bir normalin yerine uzman. Üç zorlukta da orta nişan oturtma süresi 0,34 s. Zorluk algı/karar ve isabet parametreleriyle kontrollü değişir; anında nişan veya gizli bilgi yok.
- Botlar oyuncu ve diğer botları aynı görüş ve engel kurallarıyla değerlendirir; duvar arkasındaki canlı koordinatlara erişmez. Ses yalnızca yaklaşık konum verir.
- Bomba modunda tek can, mevcut kurma/çözme kuralları ve seyirci sistemi korunur.
- Kodlar kendi JS mimarimizde özgün uygulanır; kaynak koddan kavram öğrenilir, lisansı doğrulamadan üçüncü taraf kodu kopyalanmaz.

## Mimari hedef
Algı ve gözlem hafızası → takım/görev kararı → davranış seçici → hareket ve bakış istekleri → navigasyon/yerel kaçınma → tek fizik uygulaması ve animasyon. Ateş izni doğrulanmış görüş, gerçek silah yönü, tepki/nişan süresi ve dost hattından bağımsız biçimde hesaplanır. Her karede tek hareket sahibi ve tek bakış sahibi olur. Davranış giriş/çıkışı, öncelik, asgari süre ve kesilme koşulları açıkça tanımlanır. Planlar her karede yeniden seçilmez; geçişler olay ve süre temellidir.

## Aşamalar
| Sürüm | Paket | Kabul ölçütü |
|---|---|---|
| V54 | Bağımsız davranış yönetimi | DEVRIYE, İLERLE, BEKLE, ÇATIŞ, SİPER, GERİ ÇEKİL, ARAŞTIR, DESTEK ve GÖREV durumlarının tek sahibi; geçiş ve öncelik testi; eski döngü aşamalı ayrılır. |
| V55 | Bakış ve dönüş | Öncelikli süreli bakış isteği; açı ivmesi/sönümleme; görünür hedef varken devriye bakışı geçersiz; görsel namlu doğrulaması ve 0,34 s oturma korunur. |
| V56 | Doğal hareket | Yürüme/koşma/durma/yana adım ayrı hareket kipleri; duruşa geçerken hız kontrollü; koşu ve animasyon gerçek yer değiştirmeye bağlı. |
| V57 | Navigasyon ve yerel kaçınma | Mevcut A* grafiği korunarak yol takibi, dönüş öngörüsü, tıkanma çözümü, takım arkadaşına yol verme ve yeniden planlama ayrılır. Geçersiz rota ve sürekli tekrar engellenir. |
| V58 | Haritaya özgü kontrol noktaları | Her iki haritada oyun içi navigasyon grafiğine uygun köşe/bekleme/bakış noktaları; duvar arkasından görme yok; harita geometrisi değişmez. |
| V59 | Doğal çatışma | Sürekli sağ-sol döngüsü yerine sabit durma ve duruma bağlı hareket; siperden çıkıp dönme; hedef kaybında kısa tutarlı bekleme; gerçek görüş olmadan hasar yok. |
| V60 | Takım koordinasyonu | Roller ve rota paylaşımı; gereksiz kümelenme ve karşılıklı engelleme azalır; sınıf destek işlevleri korunur. |
| V61 | Bomba modu | Görev kararları çatışma ve rota alt sistemlerinden ayrılır; geçerli görev, sabit atama, görev bitişi ve tek can regresyonları. |
| V62 | Kişilik ve zorluk | Normal/zor/uzman dağılımı ve orta nişan korunarak tutarlılık, karar süreleri ve hareket eğilimleri ayrıştırılır; adil ve ölçülü. |
| V63 | Uzun maç ve ince ayar | Gerçek Chromium/WebGL testi, sabit senaryo testleri, her iki haritada tekrar eden uzun maçlar, ölçüm karşılaştırması ve kullanıcı oynanış onayı. |

## Kalite kapıları (her sürüm)
1. Önce önceki commit ve test durumunu doğrula; yeni paket dar kapsamlı fakat tamamlanmış iş üretir.
2. Sözdizimi ve mevcut regresyonlar; yeni davranış için tekrarlanabilir testler.
3. Gerçek Chromium/WebGL çalıştır; özellikle botların görüşü, hareketi, siper ve görev rotaları gözlenir. Başarılı statik test gerçek oynanış başarısı sayılmaz.
4. Ölç: saniye başına yön değişimi, karar geçişi, durma sonrası kayma, geçersiz rota, tıkanma kurtarma, hedef kaybı, yanlış yöne ateş, dost hattı, görev ilerlemesi, bot isabet ve ölüm oranları. V53 baz ölçümü yoksa önce topla; eşik ve hedefleri baz veriye göre belirle.
5. Harita/silah/sınıf/menu regresyonlarını koru. Hata varsa sonraki aşamaya geçmeden düzelt. Test edilemeyenleri açıkça belirt; PASS uydurma.
6. Her paketi GitHub'da kaydet, ilgili PR ve commit bildir; mümkünse kullanıcının doğrudan açabileceği güncel bağımsız HTML sun. Dosya indirme engelinde kaynak bağlantısını gerçek yerel dosya olarak tanıtma.

## Referanslar
- ReGameDLL_CS bot kaynakları (yeniden oluşturulmuş CS 1.6 oyun sunucusu kodu): https://github.com/rehlds/ReGameDLL_CS/tree/master/regamedll/dlls/bot
- Durum yönetimi: https://github.com/rehlds/ReGameDLL_CS/blob/master/regamedll/dlls/bot/cs_bot_statemachine.cpp
- Bakış: https://github.com/rehlds/ReGameDLL_CS/blob/master/regamedll/dlls/bot/cs_bot_vision.cpp
- Yol takibi: https://github.com/rehlds/ReGameDLL_CS/blob/master/regamedll/dlls/bot/cs_bot_pathfind.cpp
- Oyun içi saldırı davranışları: https://github.com/rehlds/ReGameDLL_CS/blob/master/regamedll/dlls/bot/states/cs_bot_attack.cpp
- Quake III kaynakları: https://github.com/id-Software/Quake-III-Arena
