# RUNWAY — TEST #3 (Knotless · Paris 10)

Salon : **Taco coiffure** · 56 Bd de Strasbourg · Knotless **54 €**

---

## V1 timeline (~18 s — sans Maps)

| # | Contenu | Fichier |
|---|---------|---------|
| 1 | Maya marche + hook VO | Runway shot1 |
| 2 | Maya découvre Taco coiffure | Runway shot3 |
| 3 | Card Knotless **54 €** | `data-card/card-knotless-54eur.png` |
| 4 | *(option)* Recording Réserver | `app-recording/` |
| 5 | Maya sort coiffée (knotless) | Runway shot6 |
| 6 | Logo + *Trouve. Compare. Réserve.* | `skedisy-logo.png` |

---

## Étape 0 — Upload Runway

1. [runwayml.com](https://runwayml.com)  
2. Upload :
   - `maya-ref-01.png` → **Skedisy Girl**
   - `salon-exterior-taco.png` → **Taco coiffure** (photo Skedisy storage)
   - `skedisy-logo.png`

---

## Étape 1 — Shot 1 (marche Paris 10)

Gen-4 + **References** = Maya · **9:16** · ~3–4 s

```
Skedisy Girl / Maya, consistent face from character reference image,
27-year-old Black French Parisian woman, stylish casual-chic,
walking on Boulevard de Strasbourg area in Paris 10th arrondissement,
natural confident expression, soft daylight, premium French beauty aesthetic,
cinematic, vertical 9:16, no phone UI, no text overlays, no logos
```

→ `runway-exports/shot1-walk.mp4`

---

## Étape 2 — Shot 3 (découverte salon)

References : **Maya** + **salon-exterior-taco.png**

```
Skedisy Girl / Maya, same character reference,
approaching and discovering this exact hair salon storefront —
match the attached salon exterior photo precisely (Taco coiffure, 56 Bd de Strasbourg, Paris 10),
curious warm expression, Paris street, soft daylight,
premium cinematic, vertical 9:16, no fake app UI
```

→ `runway-exports/shot3-discover.mp4`

---

## Étape 3 — Shot 6 (sortie knotless)

```
Skedisy Girl / Maya, same character reference,
leaving the same salon exterior (match attached photo),
fresh professional knotless braids hairstyle,
confident walk, golden-hour soft light, cinematic vertical 9:16,
no fake logos, no phone UI
```

→ `runway-exports/shot6-exit.mp4`

---

## Étape 4 — Montage + VO

Ordre : shot1 → shot3 → card → *(app)* → shot6 → logo

VO (`VOICEOVER.md`) :
> « Tu cherches des knotless près de Strasbourg ? »  
> « Sur Skedisy, tu trouves les salons afro autour de chez toi. »  
> « Compare, choisis ton créneau… et réserve. »  
> « Skedisy. Trouve. Compare. Réserve. »

Export → `export/TEST-03-knotless-10e-master.mp4`

---

## QA

- [ ] Même Maya · façade Taco reconnaissable · **54 €** sur la card · CTA Skedisy · pas d’UI inventée

---

## Caption / tags

→ `CAPTION.md`
