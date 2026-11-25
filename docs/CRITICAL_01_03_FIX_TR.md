# Kritik hata 01–03 düzeltme kaydı

Temel: V292 denetim commit 1269666da6978da3b1e8b8ab1a2140224a426532; oyun kodu düzeltme bf5bd1febe22aacdcf0a6feb046f71d6498c9ef5. Kullanıcının açık ilk üç hata talimatıyla mevcut art/v292-crouch-transition dalı ve PR #68 kullanıldı; yeni dal yok.

1. Maç ve kurulmuş bomba sayaçları görünür aktif oyun sırasında gerçek geçen süreyi kullanır. Sekme görünürlük geçişinde eski süre atlanır. Duraklatma koşulu korunur. 5/10/15/20/30/60/144 FPS sentetik 10 saniye ve bomba sayacı doğrulaması başarılı. **Kısmi çözüm:** fizik, oyuncu animasyonu, etkileşim ilerlemesi ve AI simülasyon adımı hâlâ mevcut 0.05 saniye sınırını kullanır. Tam düşük-FPS simülasyon telafisi bot tick/zamanlamasını etkileyebileceğinden yapılmadı.
2. El bombası hareketi ve başlangıç ofseti mevcut harita katı kutularına karşı süpürülmüş yarıçapla kontrol edilir; duvar, tavan ve döşeme temasları, çoklu temas sınırı ve başlangıç örtüşmesi ele alındı. Açık alan yerçekimi ve önceki zemin sekmesi korunuyor. Bomba fırlatma kararları ve AI fonksiyonları değişmedi; ortak fizik değişikliği oyuncu ve bot bombalarının çarpışma sonuçlarını doğal olarak etkiler. Gerçek üç harita tarayıcı testi açık.
3. Dört ekipman türünde (bomba, roket, medkit, mayın) sahip olunan geometri ve özel materyaller yok edilirken veya yeni maç temizliğinde dispose edilir. Ortak silah materyallerine dokunulmaz. Tek seferlik temizleme, yinelenen geometri/materyal koruması. 1000 sahte kaynak yaşam döngüsü testi başarılı; gerçek GPU bellek/FPS ölçümü açık.

Test: tests/critical_01_03_regression.cjs doğrudan güncel kaydedilmiş kaynakta çalıştırıldı: 63/63 kontrol, 1000 mock temizleme. Inline JS parse başarılı. Eski bomba modu testi yalnız açık clockDt bağlantı ifadesi için güncellendi; eski davranış iddiaları silinmedi. check.yml yeni kontrolü çalıştırır. PR CI ve gerçek WebGL/FPS henüz doğrulanmadı. updateBots, updatePlayer ve RNG çağrı sayısı karşılaştırıldı; AI karar kodu, taktik zamanlayıcılar ve tick çağrısı sabit.

Durum: 01 kısmi, 02 ve 03 kodlandı ve sayısal test geçti; gerçek oyun kabulü bekliyor. Hata 04–10 değiştirilmedi. Ana dal birleştirmesi yapılmadı.
