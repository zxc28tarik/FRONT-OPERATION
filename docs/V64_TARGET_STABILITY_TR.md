# V64 — Hedef tutarlılığı (deneysel)
V63 referansı: 72ff598634a31e73a2358c6fb4eaafa01839571a. Marien V53→V63: hedef geçişi/edinim 0.0762→0.1425, isabet %13.26→%11.01, yakın çift 0.22→0.2467. Tersane doğal kurulum 0/3→3/3. V63 tüm teknik kontroller PASS, ancak davranış inceleme işaretleri açık.

- Hedef yoğunluğu hesabından botun kendi mevcut hedef talebi çıkarılır; diğer takım üyelerinin cezası aynen kalır.
- Yalnız yeniden görünür hale gelen önceki hedefe en çok 0.65 s boyunca azalan, en fazla 4 puanlık öncelik. Gizli hedef veya nişan ilerlemesi geri yüklenmez.
- Acil tehdit geçişi, görüş, mevcut kilit, 0.34 s nişan, zorluk ve hareket korunur.
- Bu iki parametre deneysel; üç eşlenik 600 s Marien ve üç doğal Tersane maçı V63 ile karşılaştırılacak. Hedef değişim oranı, isabet, toplam isabet, sıkışma, bomba kurulumu ve kümelenme incelenir. PASS tek başına kalite kanıtı değildir.
- Yakın çift artışı ve Tersane'deki tek sıkışma ayrı araştırma konusudur. Bu değişiklik bunları düzelttiği iddiasında değildir.
- Ana dal birleştirmesi yok; V64 testleri ve davranış incelemesi beklenir.
