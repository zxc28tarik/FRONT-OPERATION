# FRONT OPERATION — V42: Fiziksel Engelleri Dikkate Alan A* Bağlantıları

**24 Kasım 2026.** Başlangıç: `ai/v41-gate-navigation-fix`; geliştirme: `ai/v42-collider-aware-nav-edges`.

## Bulgular ve önceki sonuç

V40 ikinci 600 simüle saniyelik motor koşusu: **754** sıkışma kurtarma; düğüm 3 **259**, düğüm 39 **264**, Ağır sınıf **461**.

V41 `45253614384` başarılı 600 simüle saniyelik motor koşusu: **191** sıkışma kurtarma (V40'a kıyasla **%74,7 daha az**), düğüm 3 ve 39'da **0**, Ağır sınıf **54**; bot atışları **3.496**, isabet **428**. Bu ölçümler farklı rastgele koşulardan gelmektedir; kontrollü istatistiksel A/B testi değildir. V41'in yeni sıcak noktaları: 34 (**83**), 9 (**37**), 30 (**20**), 20 (**13**).

V41 ile 3/39 çıkışları düzeltildi. V42 incelemesinde ise daha genel bir sorun bulundu: A* grafiği harita çarpışma geometrisinden bağımsız kuruluyordu ve bazı **kenarlar** fiziksel olarak yürünemeyen nesnelerin içinden geçiyordu. Bir düğümün kendi merkezi yürünebilir olsa bile ona gelen bağlantı duvarı kesebiliyor.

Örnekler:

- `34–35`: doğu avludaki (24,-13) beton engelin içinden.
- `20–34`: doğu-orta hattındaki x=18 duvarına çok yakın/temas eden rota.
- `7–9`, `9–11`: batı depo hattında (−24,±8) kasa/konteyner engellerinden geçen kısayollar.
- Başka merkez ve doğu bağlantıları da aynı nedenle incelendi.

## Uygulama

`index.html` içinde `validateGroundNavEdges()`:

1. Harita `buildMarienCQCMap()` ile çizilip `mapColliders` kurulduktan sonra, bot doğuşundan önce bir kere çalışır.
2. **Sadece zemin katının** her iki ucu `y===0` olan A* kenarını en çok **0,22 m** aralıklarla örnekler.
3. Her örneği hareket motorunun aynı `isPositionWalkable` testi ve **0,42 m yarıçaplı** çarpışma hesabıyla denetler.
4. Geçersizse kenarı A* komşuluk grafiğinin **iki yönünden** kaldırır; orijinal harita çizimleri, fizik ve NAV_NODES değişmez.
5. Yeniden hesaplanan aktif/engellenen kenar sayıları ile BFS üzerinden **erişilebilir düğüm sayısı** salt okunur ve yalnız localhost QA arayüzünde görünür.
6. Rampalar ve üst kat bağlantıları zemin geometrisiyle yanlış elenmesin diye korundu.

Bu seçim, görsel bariyerleri kaldırmak veya botların duvar içinden geçmesine izin vermek yerine harita geometrisine uygun rotalar üretir.

## Regresyon ve kabul

- V32–V41 regresyonları korunur; V42 için **44 yeni deterministik kontrol** eklendi.
- `tests/bot_ai_v42_regression.cjs` gerçek navigasyon kodunu izole ederek yüklenebilir; sentetik test sahnesinde fiziksel beton/kasa/üs duvarı çarpışmalarını içerir.
- V42 testi bozuk 7–9, 9–11, 20–34 ve 34–35 bağlantılarının her iki yönde kaldırıldığını; geçerli üs yollarının korunduğunu; A* rota bütünlüğünü ve **50 düğümün tamamına erişim** şartını doğrular.
- `scripts/browser-bot-ai-stress.mjs`, gerçek Chromium oyunu üzerinde 600 hızlandırılmış simüle saniye ve gerçek `navValidation` anlık görüntüsü alır. Gerçek haritada 50 düğüme erişilebilirlik sağlanmadığında test başarısız olur.
- `browser-webgl.yml` gerçek 6v6 Chromium/WebGL kabulü için korunur.
- HUD/KISS, 5 asker sınıfı, 3 Normal + 2 Zor / her 15 doğuşta 1 Uzman, **0,34 saniye nişan**, silahların atış hızı ve hasarı, çizimler, drone, V32–V41 davranışları korunur.

**Sınır:** 600 simüle saniye; 10 dakika gerçek zamanlı oynanan ve görüntülenen bir maç ya da gerçek GPU FPS testi değildir. Son ölçüm olmadan yeni iyileşme yüzdesi iddia edilmez.

## Linkler

- V41 karşılaştırma: https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45253614384
- V42 dal: https://github.com/zxc28tarik/FRONT-OPERATION/tree/ai/v42-collider-aware-nav-edges

`main` dalına birleştirme izinsiz yapılmaz.
