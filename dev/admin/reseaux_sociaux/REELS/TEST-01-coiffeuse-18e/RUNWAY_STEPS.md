# RUNWAY — Implémentation V1 (sans Maps)

**Maps = plus tard.** On produit maintenant les clips IA + montage V1.

Assets prêts dans `REELS/TEST-01-coiffeuse-18e/` :
`maya-ref-01.png` · `salon-exterior-for-eve-hair.png` · `skedisy-logo.png` · `data-card/card-knotless-50eur.png`

---

## V1 timeline (~18 s — sans carte)

| # | Contenu | Fichier |
|---|---------|---------|
| 1 | Maya marche + hook VO | Runway shot1 |
| 2 | Maya découvre For Eve Hair | Runway shot3 |
| 3 | Card Knotless **50 €** | `data-card/card-knotless-50eur.png` |
| 4 | *(option)* Recording Réserver | `app-recording/` — si pas prêt, saute |
| 5 | Maya sort coiffée | Runway shot6 |
| 6 | Logo + *Trouve. Compare. Réserve.* | `skedisy-logo.png` |

---

## Étape 0 — Upload Runway (maintenant)

1. Va sur [runwayml.com](https://runwayml.com)  
2. Upload :
   - `maya-ref-01.png` → référence **Skedisy Girl**
   - `salon-exterior-for-eve-hair.png` → **For Eve Hair**
   - `skedisy-logo.png`

---

## Étape 1 — Shot 1 (Gen-4 References)

- Mode : **Image / Video Gen-4** + **References** = Maya  
- Ratio : **9:16** · durée ~3–4 s  
- Prompt (`PROMPTS.md` Shot 1) :

```
Skedisy Girl / Maya, consistent face from character reference image,
27-year-old Black French Parisian woman, stylish casual-chic,
walking on a street in Paris 18th arrondissement near Château Rouge,
natural confident expression, soft daylight, premium French beauty aesthetic,
cinematic, shallow depth of field, vertical 9:16, 24fps look,
no phone UI, no text overlays, no logos, no watermarks
```

→ Télécharge : `runway-exports/shot1-walk.mp4`

---

## Étape 2 — Shot 3 (Maya + façade salon)

- References : **Maya** + **For Eve Hair exterior**  
- Prompt Shot 3 :

```
Skedisy Girl / Maya, same character reference,
approaching and discovering this exact hair salon storefront —
match the attached salon exterior photo precisely (For Eve Hair, 94 Rue Myrha, Paris 18),
curious warm expression, Paris neighborhood street, soft daylight,
premium cinematic, vertical 9:16,
no fake app UI, no invented signs that contradict the photo, no watermarks
```

→ `runway-exports/shot3-discover.mp4`

---

## Étape 3 — Shot 6 (sortie coiffée)

- References : Maya + façade (+ hairstyle si tu as)  
- Prompt Shot 6 :

```
Skedisy Girl / Maya, same character reference,
leaving the same salon exterior (match attached photo),
fresh professional knotless braids,
confident walk away from salon, golden-hour soft light,
premium French beauty aesthetic, cinematic vertical 9:16,
no fake logos, no phone UI, no watermarks
```

→ `runway-exports/shot6-exit.mp4`

---

## Étape 4 — Montage (Edit Studio ou CapCut)

Ordre :
1. shot1-walk  
2. shot3-discover  
3. card-knotless-50eur.png (~2–3 s, léger zoom)  
4. *(si dispo)* app-recording  
5. shot6-exit  
6. skedisy-logo + texte **SKEDISY** / *Trouve. Compare. Réserve.*

VO (voix off simple pour V1) :
> « Tu cherches une coiffeuse dans le 18e ? »  
> « Sur Skedisy, tu trouves les salons afro autour de chez toi. »  
> « Compare, choisis ton créneau… et réserve. »  
> « Skedisy. Trouve. Compare. Réserve. »

Style grade : terracotta `#c45c26`, noir `#111111` (voir `SKEDISY BRAND/colours/`).

Export → `export/TEST-01-V1-sans-map.mp4`

---

## Étape 5 — QA V1

- [ ] Même Maya sur les 3 clips Runway  
- [ ] Façade = photo For Eve Hair  
- [ ] Card = Knotless **50 €** (pas d’étoiles)  
- [ ] CTA Skedisy  
- [ ] Pas d’UI app inventée  

---

## Plus tard (pas bloquant)

| Item | Quand |
|------|--------|
| Screen record Maps Paris → 18e | Insérer entre shot1 et shot3 |
| App recording → Réserver | Insérer après la data-card |
| Sauver Workflow Runway | Quand V1 est excellent |
| Saint-Denis / Montreuil / … | Même Workflow, autre salon |

---

## Option Agent (raccourci)

Joins Maya + façade + logo, colle le prompt Agent de `PROMPTS.md`, demande de sauver le Workflow  
`Skedisy · Girl · Coiffeuse Quartier`.
