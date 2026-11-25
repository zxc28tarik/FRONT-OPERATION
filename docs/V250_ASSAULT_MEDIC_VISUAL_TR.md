# FRONT OPERATION — V250 Assault / Medic görsel revizyon

**Temel:** V249 fiziksel yüzey ayrımı. **Amaç:** Aynı takım kimliğini koruyarak Assault ve Medic askerlerinin silüetlerini, zırh-kumaş geçişlerini ve ekipman organizasyonlarını daha anlaşılır yapmak.

## Yapılanlar
- **Assault:** Mevcut ön/arka balistik taşıyıcı yüzeyi omuzdan daha keskin geçişli, belde daha çevik kesimli yeniden modellendi. Üç orijinal mühimmat cebi hafif kademeli ve açılı konuma alındı; admin cebi yukarı taşındı.
- **Medic:** Orijinal zırhta daha yumuşak omuz ve daha ince bel konturu oluşturuldu. Dört mevcut cep daha küçük ve daha alt konumlu ayarlandı; üst gövdenin tıbbi ekipman işareti okunabilir kaldı. Mevcut sağlık sırt çantasına sınırlı panel hacmi/paça geçişi işlendi; orijinal sağlık işaretleri ve bağlantı noktaları korunuyor.
- İki sınıfta mevcut **iki omuz kayışı** zırh hatlarını takip edecek şekilde sınır içinde yerleştirildi.
- Geometriler sınıf ve ön/arka zırh anahtarında **paylaşılan cache** üzerinden oluşturuluyor; animasyon sırasında yeniden hesaplanmıyor.
- Engineer, Sniper ve Heavy bu pakette **görsel olarak değiştirilmedi**.

## Koruma / bütçe
- **0 ilave mesh/draw call, 0 yeni malzeme/shader, 0 ek runtime animasyon döngüsü.**
- Kask V246, kumaş V247, ekipman oturuşu V248 ve yüzey V249 yerinde.
- Hitbox, eklem pivotları, hareket, silah, takım IFF, sağlık amblemi, harita, bot kararları korunur.
- Yerel zırh mesh değişiklikleri birkaç milimetre mertebesinde sınırlandı; silah tutuşuna müdahale edilmedi.

## Test planı
`scripts/check-v250-assault-medic.mjs` ile 2 takım × 5 sınıf × 3 varyant **30 model** karşılaştırılır. 12 Assault / Medic varyantında yelek ve çanta şekli ile cep/kayış dizilimi test edilir; diğer 18 modelin görsel konum ve ölçekleri sabit olmalıdır. Kamera karşılaştırması ve 6v6 WebGL, bomba modu regresyonu CI üzerinden kontrol edilir.

**Sıradaki V251:** Engineer ve Sniper görsel revizyonu. Bot davranışı V271+ aşamasına kadar ertelenir.
