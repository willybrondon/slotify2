# Flow idéal Skedisy — 40 problèmes · SQUIRE · parcours anti-friction

**Statut :** analyse seule — **aucune implémentation**  
**Sources :** `SQUIRE_TOP20` · `DEEP_MATRICE` (1005 rows) · `DEEP_PATTERNS` · `PROMPT5–7` · docs SQUIRE  
**Sample :** 458 salons Afro IDF  
**Complément :** +20 problèmes (#21–#40) au-delà du TOP20 initial

---

## 1. Flow réservation SQUIRE (rappel)

| Étape | Cliente |
|---|---|
| 0 | Entrée Google / IG / site / app |
| 1 | Salon |
| 2 | Service (+ add-ons) |
| 3 | Barber ou *any barber* |
| 4 | Date + créneau |
| 5 | Infos légères |
| 6 | Paiement |
| 7 | Confirm + rappels |

Vertical **coupe courte** — pas de qualif projet Afro.

---

## 2A. Les 20 premiers problèmes (rappel · TOP20 data)

| # | Problème | Preuve |
|---:|---|---|
| 1 | Presta Afro = projet (devis+supply+3–6h) | Méta 458 |
| 2 | Pas de funnel Qualif → devis/durée → acompte | Wedge P20 |
| 3 | Confirm sans qualification impossible | 63 malentendus · 456 complexes |
| 4 | Durée réelle > catalogue | 73 |
| 5 | Résa non instantanée / dispo opaque | 343 · 55 |
| 6 | Mèches/supply → litiges qualité | 118 |
| 7 | WA/DM = OS de résa | 54 com · 25 WA public |
| 8 | Prix final ≠ annoncé | 96 |
| 9 | Acompte absent/flou | 230 |
| 10 | Attente / retard | 50 |
| 11 | Communication / relance défaillante | 54 |
| 12 | No-show / annulation tardive | 9 (faible) |
| 13 | Avis 1★ sans prévention amont | 179 |
| 14 | Catalogue trop granulaire | proxy |
| 15 | Google → appel/DM sans conversion | 343 |
| 16 | IG/TikTok sans bridge résa | proxy |
| 17 | Paiement final ≠ devis digital | lié 96 |
| 18 | Fidélisation / reprise peu outillée | proxy |
| 19 | Pas de fiche cliente | proxy |
| 20 | Hygiène / accueil | 46 — hors software |

---

## 2B. +20 problèmes additionnels (#21–#40)

Ancrés dans la matrice, le workflow Prompt 6, les opportunités matrice, et les patterns structurels. Niveaux : **F** = FACT data · **P** = PATTERN · **I** = INFERENCE raisonnable.

| # | Problème | Niveau | Ancrage data / logique | Moment |
|---:|---|---|---|---|
| **21** | Photo / inspiration **non attachée** au RDV → écart résultat | P/I | 63 malentendus · opportunités « brief photo » matrice · avis mariage/lace | Qualif |
| **22** | Prix **« à partir de »** sans variables → ambiguïté dès le catalogue | F/I | 96 prix · sites/Planity « à partir de » (PROMPT5 O3) | Choix service |
| **23** | Accord **oral seulement** (WA/tél) — rien de figé à relire | I | 343 sans booking · 54 com | Post-demande |
| **24** | **Règles d’annulation / report** absentes ou floues pour la cliente | I | Lié 9/12 · politique acompte invisible 230 | Avant confirm |
| **25** | **Retard salon non annoncé** → cliente attend sans statut | P | 50 attente · com 54 | Jour J |
| **26** | **Changement de pro / coiffeuse** non communiqué | I | Plaintes qualité + organisation (avis) | Jour J / confirm |
| **27** | **Canaux parallèles** (WA + tél + Planity) → double book / conflit | I | 64 Planity + 343 manuel + WA | Ops amont |
| **28** | **Prep J-1 absente** (cheveux lavés, mèches, arrivée) | P | 118 qualité · supply · opportunités checklist | Avant jour J |
| **29** | **Solde surprise** en fin de presta (reste dû non anticipé) | P | 96 + 17 | Fin presta |
| **30** | Pas de **preuve écrite** du devis accepté (screenshot WA ≠ contrat) | I | Litiges prix 96 | Après devis |
| **31** | **Confusion de styles** (knotless / box / fulani / lace…) → mauvaise presta bookée | P | Catalogue granulaire 14 · catégories Étape 1 | Choix service |
| **32** | Durée **marketing** (stories) ≠ durée **bookée** système | I | 73 durée · écart catalogue | Créneau |
| **33** | Impossible de **« refaire la même »** sans tout réexpliquer | I | CRM gap 19 · PROMPT6 Beauty CRM | Retour |
| **34** | RDV **événement critique** (mariage, shoot) sans garde-fou process | F | Avis lace veille mariage (matrice UNICIA etc.) | Qualif / risk |
| **35** | **Niveau pro** (junior/senior) opaque pour presta complexe | I | Qualité 118 · skill ≠ logiciel mais choix pro | Choix expert |
| **36** | Longue presta sans **jalons** (pauses, étapes) expliqués à la cliente | I | Durées 3–6h · attente 50 | Jour J |
| **37** | Pas de statut **« bientôt / en cours »** pendant l’attente | I | 50 + 54 | Jour J |
| **38** | Promo / coupon **déconnecté** du devis (prix final incohérent) | I | Stack coupons existant vs devis dynamique | Checkout |
| **39** | **Historique perdu** entre RDVs / appareils / salons | I | 19 · WA history | Retour |
| **40** | **Après-vente / reprise** (gratuite vs payante) non clarifiée à la résa | P | Avis qualité + reprises | Confirm / après |

---

## 3. Flow Skedisy unifié — couvre les 40

Une entrée. Une coquille. Profondeur adaptive (S0→S3).

| Étape | Expérience cliente | Tue # (1–40) |
|---|---|---|
| **0. Lien unique** | Bio IG / Google / WA → un lien « Réserver » | 5, 7, 15, 16, **27** |
| **1. Accueil** | Cadre : on fige config + prix + durée avant le créneau | 1, 2, **23** |
| **2. Famille / style guidé** | Choix assisté (pas 40 lignes plates) + noms clairs | 14, 3, **31** |
| **3. Qualif adaptive** | 0–5 Q + **photo inspiration** si besoin + événement (mariage?) | 3, 6, 14, **21**, **34** |
| **4. Devis + durée** | Breakdown · plus de « à partir de » flou · durée bookable | 8, 4, 17, **22**, **30**, **32** |
| **5. Valid. salon** | Si outlier / photo custom / événement — sinon skip | 3, 11, **34** |
| **6. Pro + créneau** | Slot = durée devis · niveau pro visible si configuré | 4, 5, 10, **26**, **35** |
| **7. OTP léger** | Identité sans mur compte | 5 |
| **8. Acompte + règles** | Acompte · **reste dû** · **annulation/report** clairs | 9, 12, 17, **24**, **29** |
| **9. Confirm + prep** | Récap figé + checklist mèches/arrivée + PDF/lien preuve | 6, 11, 1, **23**, **28**, **30** |
| **10. Rappels J-1 / 2h** | Checklist + rappel règles | 11, 12, 6, 10, **28** |
| **11. Jour J** | Check-in · **statut attente** · notif si retard salon | 4, 10, **25**, **36**, **37** |
| **12. Fin / solde** | Solde = devis − acompte · reçu digital | 17, **29**, **38** |
| **13. Après** | Photo résultat · reprise rules · **reprendre ma config** | 13, 18, 19, **33**, **39**, **40** |

**#20 Hygiène :** hors flow software (process salon).

---

## 4. Matrice complète problème → étape

| # | Étape(s) | Mécanisme |
|---:|---|---|
| 1–2 | 1, 3–8 | Funnel projet imposé |
| 3 | 3, 5 | Complexity Engine |
| 4 | 4, 6, 11 | Durée dynamique |
| 5 | 0, 6 | Self-serve |
| 6 | 3, 9, 10 | Supply + checklist |
| 7 | 0 | WA = porte, pas OS |
| 8 | 4, 8 | Devis verrouillé |
| 9 | 8 | Deposit |
| 10 | 4, 6, 10, 11 | Planning + notifs |
| 11 | 5, 9, 10 | Statuts |
| 12 | 8, 10, 24 | Acompte + règles |
| 13 | 3–10 | Prévention |
| 14 | 2, 3 | Guidage |
| 15–16 | 0 | Bridge |
| 17 | 8, 12 | Pay lié devis |
| 18–19 | 13 | Memory |
| 20 | — | Hors scope |
| 21 | 3 | Photo liée à la demande |
| 22 | 4 | Variables → prix final |
| 23 | 1, 9 | Accusé / récap écrit |
| 24 | 8 | Policy annulation |
| 25 | 11 | Push retard |
| 26 | 6 | Pro assigné + notif change |
| 27 | 0 | Un seul système de vérité |
| 28 | 9, 10 | Prep J-1 |
| 29 | 8, 12 | Reste dû dès le devis |
| 30 | 4, 9 | Preuve devis |
| 31 | 2 | Taxonomie / guidage styles |
| 32 | 4, 6 | Une seule durée source |
| 33 | 13 | Rebook config |
| 34 | 3, 5 | Flag événement + review |
| 35 | 6 | Niveau pro / filtre |
| 36 | 9, 11 | Jalons durée longue |
| 37 | 11 | Statut salle d’attente |
| 38 | 12 | Promo appliquée au devis |
| 39 | 13 | Fiche + snapshot |
| 40 | 9, 13 | Règle reprise à la confirm |

---

## 5. Anti-patterns

Deux CTA devis/réserve · formulaire maximaliste · créneau avant prix · acompte sans devis · compte app obligatoire · remplacer WA · promettre #20 hygiène via software.

---

Canvas : `skedisy-ideal-booking-flow-40.canvas.tsx`
