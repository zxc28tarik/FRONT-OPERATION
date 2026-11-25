# FRONT OPERATION — V25 kod denetimi (2026-11-22)

## Sonuç: DÜZELTME GEREKİYOR — main'e birleştirme

Kaynak V24: `index.html` (SHA256: `9ac15cc468369a5d1828930986e4ddc0ad98cb7763b62aa07a807431771318a0`).
Aday V25: `war_rock_cqc_v25_q_e_takla_ve_110_hp_drone.html` (SHA256: `cc05f96ee84fdffea6dadeda96dcedbb47a301b996196efb93054526d311a64d`).

## İstenen değişiklikler — kodda doğrulandı

- `DRONE_CONFIG.maxHp: 55 → 110`; oyuncu ve BOT dronları aynı yapılandırmadan üretiliyor.
- Drone başlangıç HUD metni `110 / 110`.
- `keydown` içinde takla yalnız `KeyQ` ve `KeyE` için çağrılıyor.
- `!e.repeat && !wasKeyDown` ile basılı tuş tekrarı engelleniyor.
- `lastTapA`, `lastTapD` ve Shift+A/D ile takla tetikleme kaldırılmış.
- Mobil bağımsız takla düğmesi korunmuş.
- Patlama hasarı `85`, yarıçap `3.0`; hız `9.5` ve diğer V24 drone kullanım hakları korunmuş.

## ÖNEMLİ — Kapsam dışı oynanış değişikliği

V24:
```js
drone.vel.z += (targetVel.z - drone.vel.z) * horizAlpha;
```
V25:
```js
drone.vel.z += (targetVel.z - drone.vel.z) * vertAlpha;
```

`horizAlpha` yatay hareket için hesaplanırken `vertAlpha` yükselme-alçalma için farklı tepki katsayıları kullanıyor. Bu değişiklik drone'un ileri/geri ivmelenmesini ve frene basılmadığında süzülme/yavaşlama tepkisini sağ/sol hareketten farklılaştırır. İstenen iki V25 göreviyle ilgisiz olduğundan **Gemini bu satırı V24'teki şekline döndürmeli**.

Önem derecesi: ÖNEMLİ (kanıtlanmış beklenmedik kod/davranış değişikliği; gerçek maçtaki hissiyatı ayrıca doğrulanmalı).

## KRİTİK

Kod düzeyindeki karşılaştırma ile kesinleşen kritik hata görülmedi. Bu, oyunun gerçek 6v6 testlerini geçtiği anlamına gelmez.

## İSTEĞE BAĞLI

Yok. Bu aşamada ekstra özellik veya görsel düzenleme istenmiyor.

## Testler

- V24 ve V25 gömülü JS: `node --check` **PASS**.
- Statik kontrol: İki istenen V25 değişikliği **mevcut**.
- Tam Chromium/WebGL maçı: **ÇALIŞTIRILAMADI**. `file://` ve yerel HTTP üzerinden açma girişimleri `net::ERR_BLOCKED_BY_ADMINISTRATOR` ile engellendi. Bu yüzden gerçek oynanış PASS iddiası yok.

## Gemini düzeltme görevi

1. V25'teki yalnızca kapsam dışı `drone.vel.z` satırını V24'teki `horizAlpha` kullanımıyla eski hâline getir.
2. Diğer tüm V25 Q/E takla ve 110 HP değişikliklerini birebir koru.
3. Tam HTML, PATCH, gerçek test raporu sun; test edilmeyen alanlara PASS yazma.
4. V17 nişangâh, V21/V24 drone, 3A/3B/3C AI, silah ve harita sistemlerine dokunma.
5. Bu taslak incelemeden sonra kullanıcı onayı gelmeden `main` dalına birleştirme yapma.