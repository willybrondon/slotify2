# Synthèse — Précisions utiles à la réservation (avis négatifs → champs)

**Date :** 2026-09-12  
**Sources :** index avis négatifs `20260911_180628` (~2 038 textes) · `DEEP_MATRICE_problemes.json` · `SQUIRE_TOP20.md` · seed actuel `KNOTLESS_S2_DEMO_CONFIG`  
**Objectif :** savoir **quoi demander**, **à quel type de presta**, et **laisser le salon activer/désactiver** — pas un formulaire unique pour tout le catalogue.

---

## 1. Verdict court

Les avis ne demandent **pas** « plus de questions ». Ils demandent moins de **surprises** : prix, durée, résultat, mèches.

Donc :
- Les précisions servent la **réservation** seulement si elles aident à **estimer prix / durée**, **préparer le supply (mèches)**, ou **éviter un malentendu de rendu**.
- Tout le reste = **optionnel**, **par famille de presta**, **configuré par le salon**.
- Après le choix de la presta : proposer **« Continuer »** **ou** **« Ajouter des précisions »** (recommandé si la presta est variable) — jamais un interrogatoire obligatoire pour un brushing.

Le seed actuel (longueur + taille S/M/L + mèches + couleur 1B/autre) est **trop générique et mal libellé** pour la coiffure.

---

## 2. Ce que disent vraiment les retours négatifs

### Signaux forts (matrice Afro / SQUIRE)

| Douleur (matrice / TOP) | Preuve | Implication produit |
|---|---|---|
| Qualité / mèches / dommages | **118** salons | Qui fournit les mèches + qualité attendue / photo |
| Écart prix annoncé vs final | **96** | Variables qui **bougent le prix** (longueur, supply, finesse) |
| Durée trop longue | **73** | Variables qui **bougent la durée** (longueur, finesse, volume) |
| Malentendu presta / résultat | **63** | Photo + précisions de style / rendu |
| Attente / retard | **50** | Durée réaliste en amont (pas un champ « couleur » magique) |
| Acompte flou / résa | structurel | Engagement financier — hors champs style |

### Proxy mots-clés sur ~2 038 avis négatifs (bruit inclus, ordre utile)

| Thème | ≈ avis | Lien champs |
|---|---:|---|
| Prix | 540 | champs **affectPrice** |
| Attente visuelle / résultat | 416 | **photo** + attentes |
| Durée / attente | 355 | champs **affectDuration** |
| Longueur / volume | 322 | **longueur** (fort) |
| Couleur / teinte (bruité) | 315 | **couleur seulement si presta couleur / mèches** |
| Mèches / qualité | 267 | **qui apporte les mèches** |
| Nattes / tresses | 88 | **finesse / type de nattes** (pas S/M/L vêtement) |
| Mentions « apporte / fournir mèches » | ~62 | supply explicite |
| Mentions taille S/M/L nattes | ~22 | **très rare** → ne pas imposer ce vocabulaire |

**Hygiène / accueil** : réel dans les avis, **hors scope** des champs de réservation.

---

## 3. Chaque champ du seed : utile ou non ?

| Champ actuel | Utile pour la résa ? | Pourquoi (avis) | Problème actuel | Remplacer par |
|---|---|---|---|---|
| **Longueur** | **Oui — priorité 1** pour tresses / extensions / projets longs | Refuse de prendre « cheveux trop longs », longueur non respectée, durée/prix qui explosent | Options OK (épaule → fesses) si le **salon** les édite | Garder ; salon peut renommer / retirer des options |
| **Taille des nattes S / M / L** | **Oui l’intention, non le libellé** | Nattes fines = +temps (+prix souvent) ; peu de clientes pensent en S/M/L | S/M/L = vocabulaire **vêtement**, pas coiffure | `Fines` / `Moyennes` / `Grosses` (ou « petit / moyen / large »), éventuellement + « nombre approx. » en option salon |
| **Qui apporte les mèches** | **Oui — priorité 1** dès qu’il y a pose d’extensions | Litiges qualité + coût (SQUIRE #6) ; prep J‑1 | Options trop sèches | `Cliente` / `Salon` (+ option salon : « Les deux / à discuter ») ; si Cliente → note prep ; si Salon → ouvrir sous-champs supply |
| **Couleur 1B / autre** | **Conditionnel — souvent mal placé** | Les plaintes « couleur » = surtout **teinte / rendu**, pas un code magique 1B | 1B/autre = pauvre ; **ne fait aucun sens sur brushing / coupe / soin** | Voir §4 — templates selon famille |
| **Photo** (optionnelle / requise) | **Oui — priorité 1 pour projets** | Malentendu presta + résultat ≠ attendu | URL → upload (déjà corrigé) | Optionnelle par défaut ; requise seulement si le salon coche |

---

## 4. Couleur : quand ça a du sens (et quand non)

| Famille de presta | Demander la couleur ? | Quelle « couleur » ? |
|---|---|---|
| **Brushing, coupe, soin, shampooing** | **Non** | — |
| **Coloration / décoloration / balayage** | **Oui** | Couleur **souhaitée** (texte libre ou palette salon) + état actuel (optionnel) |
| **Tresses / knotless / vanilles avec mèches** | **Oui si le salon fournit** les mèches | Couleur des **mèches** (multi : noir, 1B, 27, 30, 613, rouge, bordeaux, bleu, vert, orange, rose, mélange… + « autre ») |
| **Tresses si la cliente apporte** | **Optionnel** | « Couleur des mèches apportées » = info prep, pas forcément prix |
| **Perruque / lace** | **Parfois** | Couleur / densité lace — plutôt **photo** + options salon |
| **Locks / retwist** | **Rarement** | Sauf color lock |

Règle : **la couleur n’est pas un champ global**. C’est un **bloc lié** :
1. soit à la presta **teinte**,  
2. soit à **mèches = salon**,  
3. sinon **désactivé**.

Palette recommandée (éditable par salon) :  
`Noir naturel` · `1B` · `Brun` · `Châtain` · `Blond` · `613` · `Rouge / bordeaux` · `Orange / cuivré` · `Bleu` · `Vert` · `Rose / violet` · `Mélange / ombré` · `Autre (préciser)`.

Pas une fausse exhaustivité « codes manufactures » seuls ; pas non plus seulement `1B / autre`.

---

## 5. Classification des champs (bibliothèque salon)

Chaque presta = **0 à N blocs** activés à la main.  
Chaque bloc a : `affectPrice` · `affectDuration` · `required` · `options` éditables.

### A — Impact planning / prix (fortement justifié par les avis)

| ID | Libellé suggéré | Types de presta | Obligatoire ? |
|---|---|---|---|
| `longueur_rendu` | Longueur souhaitée | Tresses, vanilles, knotless, extensions, tissage | Recommandé |
| `finesse_nattes` | Finesse des nattes / tresses | Braids / tresses | Recommandé |
| `volume_cheveux` | Volume / densité des cheveux (léger / moyen / abondant) | Tresses, locks, naturelles longues | Optionnel fort |
| `meches_fournisseur` | Qui apporte les mèches ? | Toute pose d’extensions / tresses avec mèches | Recommandé |
| `photo_inspiration` | Photo d’inspiration | Projets (tresses, lace, styles complexes) | Optionnel (ou requis salon) |

### B — Supply / prep (évite litiges qualité & coût)

| ID | Libellé suggéré | Condition d’affichage |
|---|---|---|
| `meches_couleur` | Couleur des mèches | Si `meches_fournisseur = salon` **ou** presta teinte mèches |
| `meches_longueur_paquet` | Longueur des paquets (ex. 12″ / 18″ / 22″) | Si mèches salon (option salon) |
| `meches_qualite` | Type (synthétique / humain) | Si mèches salon (option) |
| `prep_note` | Note libre (« j’apporte X paquets ») | Toujours optionnel |

### C — Rendu / style (réduit malentendu, peu de prix auto)

| ID | Libellé suggéré | Types |
|---|---|---|
| `style_detail` | Style (nœuds, parts, motif…) | Tresses — options **définies par le salon** |
| `couleur_souhaitee` | Couleur souhaitée | **Teinte / coloration** uniquement |
| `etat_cheveux` | Cheveux lavés / non lavés / défrisés… | Selon règles salon |

### D — Ne pas mettre par défaut (sauf salon qui l’ajoute)

- Couleur sur brushing / coupe  
- Taille S/M/L  
- Questions hygiène, parking, etc.  
- Questionnaire long avant tout créneau simple  

---

## 6. Matrice famille de presta → blocs recommandés

| Famille | Continuer sans précision | Précisions recommandées | Photo |
|---|---|---|---|
| Brushing / coupe / soin | **Oui** | Aucune (ou note libre) | Non |
| Coloration / balayage | Possible | `couleur_souhaitee` (+ état) | Optionnelle |
| Knotless / box braids / vanilles | Possible mais **recommandé d’affiner** | longueur · finesse · qui mèches · (couleur mèches si salon) | Optionnelle / recommandée |
| Tissage / extensions | Idem | longueur · qui mèches · couleur si salon | Recommandée |
| Perruque / lace / frontal | Idem | type pose · photo | **Forte** |
| Locks / retwist | Souvent léger | longueur / âge locks · volume | Optionnelle |
| Enfant / homme nattes | Selon salon | longueur · finesse | Optionnelle |

---

## 7. UX réservation (alignée « pas de friction »)

Après **choix de la prestation** :

1. Si **0 bloc** activé → enchaîner (pro / créneau) comme aujourd’hui.  
2. Si **≥1 bloc** :
   - **A.** Continuer sans précision (créneau / prix catalogue « à partir de »)  
   - **B.** Ajouter des précisions → formulaire **uniquement des blocs activés** pour **cette** presta → récap prix/durée → Continuer  

Règles :
- Pas de wording « devis / sur mesure ».  
- Titre type : « Quelques précisions (optionnel) » / « Pour afficher un prix et une durée plus justes ».  
- Le salon décide le **required** champ par champ.  
- Post-résa : le salon peut encore poser **1 question** si une info manque (déjà prévu).

---

## 8. Ce que le salon owner configure à la main (panel)

Par prestation :

1. **Activer les précisions** (oui/non)  
2. **Cocher les blocs** de la bibliothèque (A/B/C)  
3. **Éditer** libellés + options (ex. ses propres longueurs, sa palette)  
4. Cocher pour chaque champ : impact **prix** / **durée** / **obligatoire**  
5. Photo : off / optionnelle / obligatoire  
6. (Plus tard) règles tarifaires liées aux réponses  

Skedisy fournit la **bibliothèque + suggestions par famille** ; le salon **allume** ce qui correspond à **sa** façon de travailler.

---

## 9. Corrections immédiates vs seed démo Knotless

| Avant | Après (recommandé) |
|---|---|
| Taille des nattes : S, M, L | Finesse : `Fines` / `Moyennes` / `Grosses` |
| Couleur : 1B, autre | Afficher **seulement si mèches = salon** ; palette élargie (voir §4) |
| Toujours 4 questions | Longueur + finesse + qui mèches (+ couleur conditionnelle) + photo optionnelle |
| Tout le monde même schema | Schema **par service** ; brushing = vide |

---

## 10. Décisions produit figées ici

1. **Oui**, longueur / finesse / qui apporte les mèches / photo sont **utiles à la réservation** quand la presta est un **projet** (preuves prix, durée, mèches, malentendu).  
2. **Non**, couleur n’est **pas** un champ universel ; **non** pour brushing ; **oui** pour teinte ou mèches salon.  
3. **Non**, S/M/L pour les nattes.  
4. Les précisions sont un **choix cliente** après sélection de presta, pas un tunnel séparé.  
5. Le salon **compose** les champs ; Skedisy ne force pas un formulaire unique.

### Complément StyleSeat (2026-09-15) — plan only

- Distinguer **config** (paramètres du style) et **add-ons** (options +€ / +min : curly ends, takedown, human hair…).  
- La fiche presta inclut **prep + inclus + politiques** (pas seulement les questions).  
- Voir `STYLESEAT_LEARNINGS_PLAN.md` §2–4.

---

## 11. Suite code (hors ce doc)

- [ ] Opt-in UI « Ajouter des précisions » après sélection presta  
- [ ] Bibliothèque de blocs + suggestions par famille dans le panel  
- [ ] Remplacer seed Knotless (finesse + couleur conditionnelle)  
- [ ] Règles d’affichage conditionnel (`showWhen`) dans `configSchema`
