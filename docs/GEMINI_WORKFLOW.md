# Gemini + ChatGPT + GitHub geliştirme kuralları

1. **Gemini**, `index.html` kaynak kodunda yalnızca açıkça istenen değişiklikleri yapar. Oyunu baştan yazmaz.
2. Her görev ayrı `gemini/vXX-konu` branch'i üzerinde yürütülür. Ana dal kullanıcı onayı olmadan değiştirilmez.
3. Teslim: Tam oyun HTML'i, uygulanabilir `*.patch`, kaynak SHA256, değişiklik listesi, test raporu ve gerekiyorsa ekran görüntüleri.
4. **ChatGPT**, kod farklarını ve regresyon riskini inceler, plan ve Gemini promptu hazırlar; **oyun kodunu doğrudan değiştirmez**.
5. Önceden onaylanan V17 ADS/nişangâh, V21 FPV drone, harita/silah modelleri, 3A/3B/3C BOT sistemleri korunur.
6. JS sözdizimi kontrolü, simülasyon testleri ve gerçek tarayıcı/WebGL oynanış testi ayrı ayrı raporlanır; yapılmamış test PASS gösterilmez.
7. PR açıklamalarında kapsam, değişen fonksiyonlar, risk, regresyon, geri dönüş ve kullanıcının onay durumu yer alır.
8. Büyük ZIP arşivleri gereksiz tekrar olarak GitHub'a eklenmez; kilitli HTML referansları `references/` klasöründedir.
9. Depo Public'tir; oyun yayın kararı, isim/marka ve lisans ayrı değerlendirilir.

## Sıradaki geliştirme

`prompts/V25_QE_TAKLA_DRONE_110HP.md` dosyasını Gemini'ye uygulat. V25 tamamlanmadan `main` dalına yeni oyun kodu ekleme.
