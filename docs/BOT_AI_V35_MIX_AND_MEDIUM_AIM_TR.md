# FRONT OPERATION — V35 BOT ZORLUK DAĞILIMI
Tarih: 23.11.2026 | Geliştirme dalı: `ai/v35-difficulty-mix-medium-aim`
Temel: V34, 6v6, mevcut beş silah/asker sınıfı ve tüm HUD/karakter/silah iyileştirmeleri korunur.

## Kesinleşen oyun kuralı
- Her beş bot **doğuşunda** üç Normal + iki Zor.
- Her **15. doğuş**, temel sırada Normal olması gerekirken onun yerine **Uzman** olur. Yeni bot üretilmez, altıncı bir asker sınıfı açılmaz.
- 15 doğuşluk bir döngü toplamı: **8 Normal, 6 Zor, 1 Uzman**.
- Her zorluk seviyesinde hedefe nişan oturtma **orta hız**: 0,34 saniye. Bu, tepki süresi tamamlandıktan ve üst gövde hedefe hizalandıktan sonra başlayan tutarlı nişan bekleme süresidir. Ani dönüşlerde sıfırlanır.
- Zor ve Uzman botların avantajı: **daha kısa fark etme/tepki gecikmesi** ve **ölçülü isabet olasılığı**; can, hasar, silah hızı değişmez.
- Dağılım doğuş sırasıyla ve maç başlangıcında sıfırlanan sayaçla hesaplanır. **Respawn yeni doğuş sayılır**; dolayısıyla Uzman bot ilk maç doğuşlarındaki 11 bottan sonra, 15. toplam doğuşta görülebilir.
- Beş kişilik Mavi bot takımı ilk açılışta 3 Normal + 2 Zor. Kırmızı takımın ilk beş botu da 3 Normal + 2 Zor; altıncı kırmızı bot yeni beşli grubun ilk Normal üyesi olur. 6v6 takım boyutları değişmez.

## Teknik yapı
- `BOT_DIFFICULTY_SEQUENCE`: `normal, hard, normal, hard, normal`
- `chooseBotDifficultyForSpawn()`: her 15. doğuşta Uzman normalin yerini alır.
- `BOT_SKILL_PROFILES`: `reactionScale` Normal 1.18 / Zor 0.90 / Uzman 0.78; `accuracyScale` Normal 1.00 / Zor 1.12 / Uzman 1.23; tümü `aimSettleSec: 0.34`.
- `updateBotPerception()`: mevcut V32 dost/düşman algısı korunur; ilk hedef tepkisi profil çarpanını kullanır.
- `updateBots()`: ateş ve hücum/ağır sınıf yetenekleri için, görüş + üst gövde hizası + güvenli ateş hattı + nişan yerleşmesi beklenir.
- Zamanlayıcı yeniden doğuşta ve hedef kaybında sıfırlanır. Yeni HUD etiketi eklenmez.

## Güvenlik ve QA
Mevcut V32–V34 suite'leri ve onaylı asker/silah bileşen kontrolleri korunuyor. V35 deterministik testleri 90 ardışık doğuşta dağılım, 15. doğuşu, nişan beklemesini, reaksiyon/hasar sınırlarını ve respawn akışını doğrular.

Komutlar:
```bash
node tests/bot_ai_v32_regression.cjs
node tests/bot_ai_v33_regression.cjs
node tests/bot_ai_v34_regression.cjs
node tests/bot_ai_v35_regression.cjs
```

Sıradaki davranış iyileştirmelerinde Zor ve Uzman için görme, karar verme ve takım koordinasyonu ayrıca kalibre edilebilir, **nişan oturtma hızı orta kalacaktır**.

`main` dalına kullanıcı onayı olmadan merge yapılmaz.
