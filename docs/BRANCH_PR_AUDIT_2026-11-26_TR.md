# FRONT OPERATION — 124 dal / 68 PR denetimi

Tarih: 26 Kasım 2026. Sabit denetim referansı: V292 `3b835bd1fd054cc8de45fc3d37393aaa7727937a`. Bu rapor mevcut V292 geliştirme dalına yalnız belge olarak kaydedilir; yeni dal, oyun kodu, AI veya ana dal değişikliği yoktur.

## Özet

124/124 dal ayrı GitHub compare çağrısıyla denetlendi: 118 geçmişi içerilen eski dal, 1 referans, 5 ayrışan dal (main dahil). 68/68 açık taslak PR'ın son commitine bağlı PR tetiklemeli workflow sonucu incelendi: 64 başarılı, 3 başarısız, 1 sonuç bulunamadı. PR tetiklemeli CI, push tetiklemeli WebGL kabulünü kapsamaz. Geçmişin içerilmesi, tüm eski özelliklerin daha sonra değiştirilmediğini veya görsel olarak en iyi durumda olduğunu kanıtlamaz.

## 1. Her dal için ayrı karşılaştırma

İleri: referans V292'de dalın ortak geçmişinden sonra bulunan commit sayısı. Dala özgü: karşılaştırılan dalda bulunan ancak V292'nin commit geçmişinde bulunmayan commit sayısı. Sıfır, geçmişin kapsandığını gösterir; özellik düzeyinde regresyon kabulü değildir.

| No | Dal | V292 ileri | Dala özgü | Sonuç |
|---:|---|---:|---:|---|
| 1 | `ai/v32-bot-consistency` | 573 | 0 | Geçmişi içeriliyor |
| 2 | `ai/v33-fire-lane-discipline` | 561 | 0 | Geçmişi içeriliyor |
| 3 | `ai/v34-squad-passage-cover` | 553 | 0 | Geçmişi içeriliyor |
| 4 | `ai/v35-difficulty-mix-medium-aim` | 545 | 0 | Geçmişi içeriliyor |
| 5 | `ai/v36-natural-movement-steering` | 539 | 0 | Geçmişi içeriliyor |
| 6 | `ai/v37-observed-target-tracking` | 530 | 0 | Geçmişi içeriliyor |
| 7 | `ai/v38-squad-tactics` | 521 | 0 | Geçmişi içeriliyor |
| 8 | `ai/v39-acoustic-investigation` | 513 | 0 | Geçmişi içeriliyor |
| 9 | `ai/v40-bot-telemetry-balance` | 494 | 0 | Geçmişi içeriliyor |
| 10 | `ai/v41-gate-navigation-fix` | 487 | 0 | Geçmişi içeriliyor |
| 11 | `ai/v42-collider-aware-nav-edges` | 476 | 0 | Geçmişi içeriliyor |
| 12 | `ai/v43-stuck-context-diagnostics` | 468 | 0 | Geçmişi içeriliyor |
| 13 | `ai/v44-medic-walkable-support` | 461 | 0 | Geçmişi içeriliyor |
| 14 | `ai/v45-reachable-nav-origin` | 453 | 0 | Geçmişi içeriliyor |
| 15 | `ai/v46-target-cover-consistency` | 443 | 0 | Geçmişi içeriliyor |
| 16 | `ai/v47-cover-lifecycle-reliability` | 415 | 0 | Geçmişi içeriliyor |
| 17 | `ai/v48-cover-route-recovery` | 395 | 0 | Geçmişi içeriliyor |
| 18 | `ai/v49-cover-route-hysteresis` | 376 | 0 | Geçmişi içeriliyor |
| 19 | `ai/v52-coherent-movement` | 326 | 0 | Geçmişi içeriliyor |
| 20 | `ai/v54-behavior-controller` | 322 | 0 | Geçmişi içeriliyor |
| 21 | `ai/v55-look-controller` | 317 | 0 | Geçmişi içeriliyor |
| 22 | `ai/v56-locomotion` | 313 | 0 | Geçmişi içeriliyor |
| 23 | `ai/v57-navigation` | 308 | 0 | Geçmişi içeriliyor |
| 24 | `ai/v58-map-awareness` | 303 | 0 | Geçmişi içeriliyor |
| 25 | `ai/v59-combat-discipline` | 297 | 0 | Geçmişi içeriliyor |
| 26 | `ai/v60-team-coordination` | 292 | 0 | Geçmişi içeriliyor |
| 27 | `ai/v61-bomb-objectives` | 288 | 0 | Geçmişi içeriliyor |
| 28 | `ai/v62-personalities` | 284 | 0 | Geçmişi içeriliyor |
| 29 | `ai/v63-integrated-validation` | 265 | 0 | Geçmişi içeriliyor |
| 30 | `ai/v64-target-stability` | 264 | 0 | Geçmişi içeriliyor |
| 31 | `ai/v65-friendly-spacing` | 263 | 0 | Geçmişi içeriliyor |
| 32 | `ai/v66-corner-momentum` | 262 | 0 | Geçmişi içeriliyor |
| 33 | `ai/v67-combat-spacing` | 260 | 0 | Geçmişi içeriliyor |
| 34 | `ai/v68-bot-ammo` | 258 | 0 | Geçmişi içeriliyor |
| 35 | `ai/v69-class-objectives` | 257 | 0 | Geçmişi içeriliyor |
| 36 | `ai/v70-phase-continuity` | 256 | 0 | Geçmişi içeriliyor |
| 37 | `ai/v71a-corner-ablation` | 255 | 0 | Geçmişi içeriliyor |
| 38 | `ai/v71b-active-weapon` | 254 | 0 | Geçmişi içeriliyor |
| 39 | `ai/v71c-target-continuity` | 252 | 0 | Geçmişi içeriliyor |
| 40 | `ai/v71d-cover-context` | 250 | 0 | Geçmişi içeriliyor |
| 41 | `ai/v71e-map-navigation` | 249 | 0 | Geçmişi içeriliyor |
| 42 | `ai/v72-integrated-acceptance` | 248 | 0 | Geçmişi içeriliyor |
| 43 | `ai/v73-ammo-role-audit` | 247 | 0 | Geçmişi içeriliyor |
| 44 | `ai/v74-objective-diagnostics` | 246 | 0 | Geçmişi içeriliyor |
| 45 | `ai/v75-objective-continuity` | 245 | 1 | CI/test düzeltmesi içerikte mevcut |
| 46 | `ai/v76-friendly-space` | 243 | 0 | Geçmişi içeriliyor |
| 47 | `ai/v77-isolated-movement` | 241 | 0 | Geçmişi içeriliyor |
| 48 | `ai/v78-objective-reservations` | 240 | 0 | Geçmişi içeriliyor |
| 49 | `ai/v79-investigation-route` | 239 | 0 | Geçmişi içeriliyor |
| 50 | `ai/v80-retreat-route` | 238 | 0 | Geçmişi içeriliyor |
| 51 | `ai/v81-recovery-ownership` | 237 | 0 | Geçmişi içeriliyor |
| 52 | `ai/v82-heavy-gustav-discipline` | 234 | 0 | Geçmişi içeriliyor |
| 53 | `ai/v83-fire-readiness` | 230 | 0 | Geçmişi içeriliyor |
| 54 | `ai/v84-combat-commitment` | 226 | 0 | Geçmişi içeriliyor |
| 55 | `ai/v85-uninterrupted-contact` | 222 | 0 | Geçmişi içeriliyor |
| 56 | `ai/v86-long-range-contact` | 219 | 0 | Geçmişi içeriliyor |
| 57 | `ai/v97-active-map-defense` | 182 | 0 | Geçmişi içeriliyor |
| 58 | `ai/v98-team-sector-defense` | 181 | 0 | Geçmişi içeriliyor |
| 59 | `art/v99-soldier-detail` | 180 | 0 | Geçmişi içeriliyor |
| 60 | `art/v101-anatomy-textiles` | 179 | 0 | Geçmişi içeriliyor |
| 61 | `art/v104-character-production` | 177 | 0 | Geçmişi içeriliyor |
| 62 | `art/v109-character-fidelity` | 175 | 0 | Geçmişi içeriliyor |
| 63 | `art/v118-character-combat` | 172 | 0 | Geçmişi içeriliyor |
| 64 | `art/v127-character-motion` | 170 | 0 | Geçmişi içeriliyor |
| 65 | `art/v135-character-refinement` | 168 | 0 | Geçmişi içeriliyor |
| 66 | `art/v145-character-cohesion` | 166 | 0 | Geçmişi içeriliyor |
| 67 | `art/v152-character-surface-motion` | 164 | 0 | Geçmişi içeriliyor |
| 68 | `art/v155-character-continuity` | 162 | 0 | Geçmişi içeriliyor |
| 69 | `art/v170-anatomy-textile-head` | 158 | 0 | Geçmişi içeriliyor |
| 70 | `art/v188-equipment-class-rig` | 153 | 0 | Geçmişi içeriliyor |
| 71 | `art/v200-character-acceptance` | 149 | 0 | Geçmişi içeriliyor |
| 72 | `art/v205-rig-acceptance-hardening` | 148 | 0 | Geçmişi içeriliyor |
| 73 | `art/v210-joint-deformation` | 147 | 0 | Geçmişi içeriliyor |
| 74 | `art/v216-ring-rig` | 145 | 0 | Geçmişi içeriliyor |
| 75 | `art/v222-compact-rig` | 143 | 0 | Geçmişi içeriliyor |
| 76 | `art/v228-adaptive-rig` | 141 | 0 | Geçmişi içeriliyor |
| 77 | `art/v234-optional-live-rig` | 139 | 0 | Geçmişi içeriliyor |
| 78 | `art/v240-character-polish` | 137 | 0 | Geçmişi içeriliyor |
| 79 | `art/v245-anatomy-face-rebuild` | 131 | 0 | Geçmişi içeriliyor |
| 80 | `art/v246-helmet-protection` | 127 | 3 | Kask userData koruması ve iki test dosyası mevcut |
| 81 | `art/v247-tailored-cloth-surfaces` | 123 | 4 | userData + traverse koruması ve iki test dosyası mevcut |
| 82 | `art/v248-equipment-carrier-fit` | 114 | 0 | Geçmişi içeriliyor |
| 83 | `art/v249-physical-surface-finish` | 107 | 0 | Geçmişi içeriliyor |
| 84 | `art/v250-assault-medic-identity` | 103 | 0 | Geçmişi içeriliyor |
| 85 | `art/v251-engineer-sniper-identity` | 98 | 0 | Geçmişi içeriliyor |
| 86 | `art/v252-heavy-armor-identity` | 93 | 0 | Geçmişi içeriliyor |
| 87 | `art/v253-grounded-locomotion` | 87 | 0 | Geçmişi içeriliyor |
| 88 | `art/v254-combat-pose-continuity` | 81 | 0 | Geçmişi içeriliyor |
| 89 | `art/v255-character-integrated-acceptance` | 78 | 0 | Geçmişi içeriliyor |
| 90 | `art/v256-viewmodel-surface-foundation` | 74 | 0 | Geçmişi içeriliyor |
| 91 | `art/v258-weapon-profile-and-finish` | 70 | 0 | Geçmişi içeriliyor |
| 92 | `art/v260-viewmodel-detail-continuity` | 66 | 0 | Geçmişi içeriliyor |
| 93 | `art/v262-optic-worldmodel-refinement` | 62 | 0 | Geçmişi içeriliyor |
| 94 | `art/v264-weapon-visual-cohesion` | 57 | 0 | Geçmişi içeriliyor |
| 95 | `art/v270-weapon-integrated-release` | 52 | 0 | Geçmişi içeriliyor |
| 96 | `art/v271-muzzle-visual-fx` | 47 | 0 | Geçmişi içeriliyor |
| 97 | `art/v273-distinct-muzzle-designs` | 39 | 0 | Geçmişi içeriliyor |
| 98 | `art/v277-combat-feedback` | 33 | 0 | Geçmişi içeriliyor |
| 99 | `art/v281-combat-acceptance` | 26 | 0 | Geçmişi içeriliyor |
| 100 | `art/v287-weapon-animation` | 18 | 0 | Geçmişi içeriliyor |
| 101 | `art/v291-directional-gait-draft` | 6 | 0 | Geçmişi içeriliyor |
| 102 | `art/v292-crouch-transition` | 0 | 0 | Denetim referansı |
| 103 | `art/v292-crouch-transition-draft` | 10 | 2 | Eski prototip ve belge; V292 entegre eşdeğeri mevcut |
| 104 | `gemini/v25-qe-roll-drone-110hp` | 644 | 0 | Geçmişi içeriliyor |
| 105 | `main` | 647 | 3 | Üç belge commit'i; kurallar ve yol haritası güncelde mevcut |
| 106 | `map/v88-compact-tersane` | 214 | 0 | Geçmişi içeriliyor |
| 107 | `map/v89-tersane-cover` | 212 | 0 | Geçmişi içeriliyor |
| 108 | `map/v90-hostage-rescue` | 207 | 0 | Geçmişi içeriliyor |
| 109 | `map/v91-branching-rescue` | 202 | 0 | Geçmişi içeriliyor |
| 110 | `map/v92-asymmetric-prison` | 198 | 0 | Geçmişi içeriliyor |
| 111 | `map/v93-prison-interiors` | 190 | 0 | Geçmişi içeriliyor |
| 112 | `map/v94-prison-room-expansion` | 186 | 0 | Geçmişi içeriliyor |
| 113 | `map/v95-cs-style-prison` | 185 | 0 | Geçmişi içeriliyor |
| 114 | `map/v96-prison-final` | 184 | 0 | Geçmişi içeriliyor |
| 115 | `mode/v51-bomb-depot` | 331 | 0 | Geçmişi içeriliyor |
| 116 | `plan/v241-v290-quality-rebuild` | 134 | 0 | Geçmişi içeriliyor |
| 117 | `restore/v25-approved-components-20261122` | 610 | 0 | Geçmişi içeriliyor |
| 118 | `ui/v87-pause-map-switch` | 216 | 0 | Geçmişi içeriliyor |
| 119 | `visual/v26-soldier-detail-pass` | 601 | 0 | Geçmişi içeriliyor |
| 120 | `visual/v27-calm-hud-menu` | 598 | 0 | Geçmişi içeriliyor |
| 121 | `visual/v28-kiss-hud-menu` | 595 | 0 | Geçmişi içeriliyor |
| 122 | `visual/v29-kiss-pause-scoreboard` | 588 | 0 | Geçmişi içeriliyor |
| 123 | `visual/v30-reference-class-menu` | 585 | 0 | Geçmişi içeriliyor |
| 124 | `visual/v31-horizontal-class-tabs` | 582 | 0 | Geçmişi içeriliyor |

## 2. Ayrışan dalların dosya içerik denetimi

- V75: 1 ayrı commit; bot-ai-v75.yml ve bot_ai_v75_comparison_coverage.cjs birebir aynı. check.yml eski dalın bütün boş olmayan satırlarını içeriyor. V292 CI'da V75/V76 seed coverage başarılı. AI kodu eksikliği saptanmadı.
- V246: 3 ayrı commit; index.html içinde eklenen helmetMesh.userData koruması mevcut. character-turntable.mjs ve check-soldier-scene.mjs birebir aynı.
- V247: 4 ayrı commit; index.html eklenen helmetMesh.userData ve typeof model.root.traverse koruması mevcut. İki görsel test dosyası birebir aynı. Eski korumasız traverse ifadesi başka kodda da görülebilir; bu metin taraması her kullanımın güvenli olduğunu kanıtlamaz.
- V292 eski prototip: 2 ayrı commit, sadece taslak doküman ve sayısal test. Entegre sürümde prototip eşitliği daha önce 118.080 pozda doğrulandı; eski iki dosya ayrıca aktarılmasına ihtiyaç duyulmayan tarihsel taslaktır.
- main: 3 ayrı commit, yalnız AGENTS.md ve iki yol haritası. AGENTS.md birebir aynı, bot yol haritasının bütün boş olmayan satırları mevcut, geliştirme yol haritası aynı kuralları içeriyor ve durum kaydı güncellenmiş. Ana dal oyun kodu eski.

Dala özgü oyun kodu eklemelerinden incelenen satırlarda gerçekten eksik görsel geliştirme bulunmadı. Ancak 118 geçmişi içerilen dalın tüm işlevlerinin tek tek kaynak ve canlı sahne düzeyinde tekrar kabulü bu denetim kapsamında tamamlanmadı.

## 3. Her açık PR için son committe PR tetiklemeli CI

| PR | Paket | Sonuç | Workflow |
|---|---|---|---|
| [#1](https://github.com/zxc28tarik/FRONT-OPERATION/pull/1) | V25 (TASLAK): Q/E takla ve 110 HP drone — inceleme düzeltmesi gerekli | Başarılı | [45049506681](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45049506681) |
| [#2](https://github.com/zxc28tarik/FRONT-OPERATION/pull/2) | V25 RESTORE (DRAFT): 6v6 WebGL QA + kask düzeltmesi + gelişmiş asker/V11 detayları | Başarılı | [45081073875](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45081073875) |
| [#3](https://github.com/zxc28tarik/FRONT-OPERATION/pull/3) | V41 — Üs kapısı navigasyonu: 3/39 fiziksel bariyer rota düzeltmesi | Başarılı | [45254097733](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45254097733) |
| [#4](https://github.com/zxc28tarik/FRONT-OPERATION/pull/4) | V42 — Fiziksel engellere göre A* bağlantı doğrulaması | Başarılı | [45371083952](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45371083952) |
| [#5](https://github.com/zxc28tarik/FRONT-OPERATION/pull/5) | V43 — Sıhhiye botu sıkışmalarında gerçek hareket hedefi teşhisi | Başarılı | [45371624701](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45371624701) |
| [#6](https://github.com/zxc28tarik/FRONT-OPERATION/pull/6) | V44 — Sıhhiye botlarında çarpışma kontrollü doğrudan yardım rotası | Başarılı | [45371979409](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45371979409) |
| [#7](https://github.com/zxc28tarik/FRONT-OPERATION/pull/7) | V45 — Duvar arkasındaki A* başlangıcına kilitlenmeyi önleme | Başarılı | [45372821423](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45372821423) |
| [#8](https://github.com/zxc28tarik/FRONT-OPERATION/pull/8) | V46 — Hedef değişimi, siper kullanımı ve takım odağı davranış ölçümü | Başarılı | [45374479919](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45374479919) |
| [#9](https://github.com/zxc28tarik/FRONT-OPERATION/pull/9) | V47 — Siper karar sürekliliği, güvenli hedef yeniden edinme ve kontrollü stres karşılaştırması | Başarılı | [45378132844](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45378132844) |
| [#10](https://github.com/zxc28tarik/FRONT-OPERATION/pull/10) | V48 — Siper A* rota ilerlemesi, gerçek erişilebilir alternatif ve sıkışma kurtarması | Başarılı | [45382400677](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45382400677) |
| [#11](https://github.com/zxc28tarik/FRONT-OPERATION/pull/11) | V49 — A* rotasında ilerleyen botun güvenli siperini erken bırakmasını önleme | Başarılı | [45384837998](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45384837998) |
| [#12](https://github.com/zxc28tarik/FRONT-OPERATION/pull/12) | Tersane — klasik A/B bomba modu, tek can ve asimetrik yeni harita | Başarılı | [45396574619](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45396574619) |
| [#13](https://github.com/zxc28tarik/FRONT-OPERATION/pull/13) | V52 — Coherent bot movement and combat intent | Başarılı | [45401226551](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45401226551) |
| [#14](https://github.com/zxc28tarik/FRONT-OPERATION/pull/14) | V54 — CS-inspired behavior controller foundation | Başarılı | [45401754634](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45401754634) |
| [#15](https://github.com/zxc28tarik/FRONT-OPERATION/pull/15) | V55 — CS-inspired independent look and turn controller | Başarılı | [45402189513](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45402189513) |
| [#16](https://github.com/zxc28tarik/FRONT-OPERATION/pull/16) | V56 — CS-inspired locomotion and controlled dodge | Başarılı | [45402619362](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45402619362) |
| [#17](https://github.com/zxc28tarik/FRONT-OPERATION/pull/17) | V57 — Active route following and obstacle recovery | Başarılı | [45403030675](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45403030675) |
| [#18](https://github.com/zxc28tarik/FRONT-OPERATION/pull/18) | V58 — Static map awareness and controlled corner/guard looks | Başarılı | [45403884006](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45403884006) |
| [#19](https://github.com/zxc28tarik/FRONT-OPERATION/pull/19) | V59 — Consistent combat and cover cycle | Başarılı | [45404287665](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45404287665) |
| [#20](https://github.com/zxc28tarik/FRONT-OPERATION/pull/20) | V60 — Stable team roles and squad spacing | Başarılı | [45404894425](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45404894425) |
| [#21](https://github.com/zxc28tarik/FRONT-OPERATION/pull/21) | V61 — Stable bomb objective assignments and rotations | Başarılı | [45406379637](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45406379637) |
| [#22](https://github.com/zxc28tarik/FRONT-OPERATION/pull/22) | V62 — Stable bot personalities separate from difficulty | Başarılı | [45406971291](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45406971291) |
| [#23](https://github.com/zxc28tarik/FRONT-OPERATION/pull/23) | V63 — Paired long-match validation of V54–V62 | Başarılı | [45412021257](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45412021257) |
| [#24](https://github.com/zxc28tarik/FRONT-OPERATION/pull/24) | V64 — Stable visible target selection | Başarılı | [45412815082](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45412815082) |
| [#25](https://github.com/zxc28tarik/FRONT-OPERATION/pull/25) | V65 — Natural friendly route following | Başarılı | [45414172154](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45414172154) |
| [#26](https://github.com/zxc28tarik/FRONT-OPERATION/pull/26) | V66 — Momentum-aware corner navigation | Başarılı | [45414517588](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45414517588) |
| [#27](https://github.com/zxc28tarik/FRONT-OPERATION/pull/27) | V67 — Class-aware combat dodge spacing | Başarılı | [45415952725](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45415952725) |
| [#28](https://github.com/zxc28tarik/FRONT-OPERATION/pull/28) | V68 — Weapon ammo and match-role reload discipline | Başarılı | [45417047254](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45417047254) |
| [#29](https://github.com/zxc28tarik/FRONT-OPERATION/pull/29) | V69 — Class-aware objective assignments | Başarılı | [45417274138](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45417274138) |
| [#30](https://github.com/zxc28tarik/FRONT-OPERATION/pull/30) | V70 — Objective phase and reservation continuity | Başarılı | [45417764188](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45417764188) |
| [#31](https://github.com/zxc28tarik/FRONT-OPERATION/pull/31) | V71A — Controlled rollback of V66 corner experiment | Başarılı | [45418468760](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45418468760) |
| [#32](https://github.com/zxc28tarik/FRONT-OPERATION/pull/32) | V71B — Active game weapon and movement consistency | Başarılı | [45419041212](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45419041212) |
| [#33](https://github.com/zxc28tarik/FRONT-OPERATION/pull/33) | V71C — Visible target continuity | Başarılı | [45443957936](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45443957936) |
| [#34](https://github.com/zxc28tarik/FRONT-OPERATION/pull/34) | V71D — Context-aware game cover preferences | Başarılı | [45445252881](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45445252881) |
| [#35](https://github.com/zxc28tarik/FRONT-OPERATION/pull/35) | V71E — Map-specific navigation comparison | Başarılı | [45445394761](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45445394761) |
| [#36](https://github.com/zxc28tarik/FRONT-OPERATION/pull/36) | V72 — Integrated candidate and expanded validation | Başarılı | [45446604757](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45446604757) |
| [#37](https://github.com/zxc28tarik/FRONT-OPERATION/pull/37) | V73 — Class inventory ownership and behavior audit | Başarılı | [45447093012](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45447093012) |
| [#38](https://github.com/zxc28tarik/FRONT-OPERATION/pull/38) | V74 — Held-out round diagnostics and quality decision | Başarılı | [45447398910](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45447398910) |
| [#39](https://github.com/zxc28tarik/FRONT-OPERATION/pull/39) | V75 — Bound stationary game-objective delay | Başarılı | [45453406288](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45453406288) |
| [#40](https://github.com/zxc28tarik/FRONT-OPERATION/pull/40) | V76 — Physical friendly-space consistency | Bulunamadı | — |
| [#41](https://github.com/zxc28tarik/FRONT-OPERATION/pull/41) | V77 — Isolate movement policies and recovery diagnostics | Başarılı | [45456725514](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45456725514) |
| [#42](https://github.com/zxc28tarik/FRONT-OPERATION/pull/42) | V78 — Preserve game objective reservations and clear stale assignments | Başarılı | [45456904802](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45456904802) |
| [#43](https://github.com/zxc28tarik/FRONT-OPERATION/pull/43) | V79 — Acoustic route ownership | Başarılı | [45461897653](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45461897653) |
| [#44](https://github.com/zxc28tarik/FRONT-OPERATION/pull/44) | V80 — Retreat route consistency | Başarılı | [45462171965](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45462171965) |
| [#45](https://github.com/zxc28tarik/FRONT-OPERATION/pull/45) | V81 — Actual route recovery ownership | Başarısız | [45462426015](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45462426015) |
| [#46](https://github.com/zxc28tarik/FRONT-OPERATION/pull/46) | V246 — Helmet shell and protection fit | Başarılı | [45610961513](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45610961513) |
| [#47](https://github.com/zxc28tarik/FRONT-OPERATION/pull/47) | V247 — Tailored cloth silhouette, seams and surface wear | Başarılı | [45610950532](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45610950532) |
| [#48](https://github.com/zxc28tarik/FRONT-OPERATION/pull/48) | V248 — Armor carrier, pouch and role-pack fitting | Başarılı | [45611052886](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45611052886) |
| [#49](https://github.com/zxc28tarik/FRONT-OPERATION/pull/49) | V249 — Shared physical material differentiation and low-cost wear | Başarılı | [45614994046](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45614994046) |
| [#50](https://github.com/zxc28tarik/FRONT-OPERATION/pull/50) | V250 — Assault and Medic class-specific silhouette refit | Başarılı | [45615649146](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45615649146) |
| [#51](https://github.com/zxc28tarik/FRONT-OPERATION/pull/51) | V251 — Engineer load-bearing kit and Sniper low-profile silhouette | Başarılı | [45617890352](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45617890352) |
| [#52](https://github.com/zxc28tarik/FRONT-OPERATION/pull/52) | V252 — Heavy armor and ammunition-carry silhouette | Başarılı | [45618959648](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45618959648) |
| [#53](https://github.com/zxc28tarik/FRONT-OPERATION/pull/53) | V253 — Distance-synced gait, planted feet and crouch transitions | Başarılı | [45620876081](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45620876081) |
| [#54](https://github.com/zxc28tarik/FRONT-OPERATION/pull/54) | V254 — Class-specific weapon posture, reload stages and death continuity | Başarılı | [45621479115](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45621479115) |
| [#55](https://github.com/zxc28tarik/FRONT-OPERATION/pull/55) | V255 — Integrated character release acceptance | Başarılı | [45623670562](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45623670562) |
| [#56](https://github.com/zxc28tarik/FRONT-OPERATION/pull/56) | V256 — First-person weapon surface foundation | Başarılı | [45625129606](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45625129606) |
| [#57](https://github.com/zxc28tarik/FRONT-OPERATION/pull/57) | V257–V258 — Weapon profile and surface differentiation | Başarılı | [45625832749](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45625832749) |
| [#58](https://github.com/zxc28tarik/FRONT-OPERATION/pull/58) | V259–V260 — Shared surface detail and visual reload continuity | Başarılı | [45627042163](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45627042163) |
| [#59](https://github.com/zxc28tarik/FRONT-OPERATION/pull/59) | V261–V262 — Optical housings and third-person visual contours | Başarılı | [45628490143](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45628490143) |
| [#60](https://github.com/zxc28tarik/FRONT-OPERATION/pull/60) | V263–V264 — Weapon appearance cohesion and microtexture refinement | Başarısız | [45628759943](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45628759943) |
| [#61](https://github.com/zxc28tarik/FRONT-OPERATION/pull/61) | V265–V270 — Complete weapon visual package and integrated acceptance | Başarısız | [45629329338](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45629329338) |
| [#62](https://github.com/zxc28tarik/FRONT-OPERATION/pull/62) | V271 — Soft warm muzzle flash and shared visual effects | Başarılı | [45631076185](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45631076185) |
| [#63](https://github.com/zxc28tarik/FRONT-OPERATION/pull/63) | V272–V273 — Seven distinct muzzle effect designs | Başarılı | [45697188543](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45697188543) |
| [#64](https://github.com/zxc28tarik/FRONT-OPERATION/pull/64) | V274–V277 — Verified baseline and visual-only combat feedback | Başarılı | [45702472636](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45702472636) |
| [#65](https://github.com/zxc28tarik/FRONT-OPERATION/pull/65) | V278–V281 — Combat feedback continuity and three-mode acceptance | Başarılı | [45703844072](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45703844072) |
| [#66](https://github.com/zxc28tarik/FRONT-OPERATION/pull/66) | V282–V287 — Isolated weapon presentation animations | Başarılı | [45704603144](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45704603144) |
| [#67](https://github.com/zxc28tarik/FRONT-OPERATION/pull/67) | V291 / C4 — Directional character gait presentation | Başarılı | [45712232088](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45712232088) |
| [#68](https://github.com/zxc28tarik/FRONT-OPERATION/pull/68) | V292 / C5 — Crouch transition presentation | Başarılı | [45713286878](https://github.com/zxc28tarik/FRONT-OPERATION/actions/runs/45713286878) |

## 4. Başarısız eski CI ve güncel kanıt

- #45 / V81: 45462426015, V38 takım koordinasyonu regresyonu başarısız.
- #60 / V264: 45628759943, onaylı V5–V25 bileşen koruması başarısız.
- #61 / V270: 45629329338, 3D asker rig ve namlu yerleşimi testi başarısız.
- #40 / V76: erişilebilir PR tetiklemeli workflow bulunmadı.
- Güncel V292 45713286878: 83/83 adım başarılı; yukarıdaki üç başarısız adım ile V75/V76 coverage ve V81 recovery kontrolü de başarılı. Eski branch koşuları tarihsel olarak başarısız kalır; bu, son sürümün statik regresyonunun geçtiğini gösterir.
- V281 için daha önce kayıtlı WebGL 45703821239 başarılı. V287/C4/C5 push WebGL kabulü bu bağlantının yalnız PR tetiklemeli koşuları döndürmesi nedeniyle doğrulanamadı. V288–V290 için ayrı kabul kanıtı da bulunmadı. FPS ve insan gözü görsel kabulü açık.

## 5. Birleştirme kararı

Yeni özellik veya AI geliştirmesi yapılmadı. Bu rapor PR kapatma/ana dala birleştirme onayı değildir. Öncelik güncel V292'nin gerçek WebGL ve üç mod regresyonunu doğrulamak, V288–V290 kabul boşluğunu incelemek, eski özelliklerin güncel işlevsel ve görsel durumunu bölüm bölüm karşılaştırmak, sonra tek güncel sürüm olarak birleştirmeyi açık kullanıcı kararıyla gerçekleştirmektir. Tarihsel dallar kanıt olmadan silinmez.
