# RUNWAY — TEST #2 (même process que TEST-01)

Salon : **Coiffure Beauté Brasil** · Paris **13e** · Box braids **50 €**

---

## V1 timeline (~18 s — sans Maps)

| # | Contenu | Fichier |
|---|---------|---------|
| 1 | Maya marche + hook VO | Runway shot1 |
| 2 | Maya découvre le salon | Runway shot3 |
| 3 | Card Box braids **50 €** | `data-card/card-box-braids-50eur.png` |
| 4 | *(option)* Recording Réserver | `app-recording/` |
| 5 | Maya sort coiffée (box braids) | Runway shot6 |
| 6 | Logo + *Trouve. Compare. Réserve.* | `skedisy-logo.png` |

---

## Étape 0 — Upload Runway

1. [runwayml.com](https://runwayml.com)  
2. Upload :
   - `maya-ref-01.png` → **Skedisy Girl**
   - `salon-exterior-brasil.png` → **Coiffure Beauté Brasil**
   - `skedisy-logo.png`

---

## Étape 1 — Shot 1 (marche Paris 13)

Gen-4 + **References** = Maya · **9:16** · ~3–4 s

```
Skedisy Girl / Maya, consistent face from character reference image,
27-year-old Black French Parisian woman, stylish casual-chic,
walking on a street in Paris 13th arrondissement near Saint-Marcel,
natural confident expression, soft daylight, premium French beauty aesthetic,
cinematic, vertical 9:16, no phone UI, no text overlays, no logos
```

→ `runway-exports/shot1-walk.mp4`

---

## Étape 2 — Shot 3 (découverte salon)

References : **Maya** + **salon-exterior-brasil.png**

```
Skedisy Girl / Maya, same character reference,
approaching and discovering this exact hair salon storefront —
match the attached salon exterior photo precisely (Coiffure Beauté Brasil, 137 boulevard de l'hôpital, Paris 13),
curious warm expression, Paris neighborhood street, soft daylight,
premium cinematic, vertical 9:16, no fake app UI
```

→ `runway-exports/shot3-discover.mp4`

---

## Étape 3 — Shot 6 (sortie box braids)

References : Maya + façade salon

```
Skedisy Girl / Maya, same character reference,
leaving the same salon exterior (match attached photo),
fresh professional box braids hairstyle,
confident walk, golden-hour soft light, cinematic vertical 9:16,
no fake logos, no phone UI
```

→ `runway-exports/shot6-exit.mp4`

---

## Étape 4 — Montage + VO

Ordre : shot1 → shot3 → card → *(app)* → shot6 → logo

VO (`VOICEOVER.md`) :
> « Tu cherches des box braids dans le 13e ? »  
> « Sur Skedisy, tu trouves les salons afro autour de chez toi. »  
> « Compare, choisis ton créneau… et réserve. »  
> « Skedisy. Trouve. Compare. Réserve. »

Export → `export/TEST-02-box-braids-13e-master.mp4`

---

## Description réseaux (sans répéter la vidéo)

```
Tu cherches des box braids dans le 13e ?

Sur Skedisy, tu trouves les salons afro d’Île-de-France.
Trouve. Compare. Réserve.

👉 Lien en bio · App gratuite
```

Tags : `#Skedisy #Paris13 #BoxBraids #CoiffureAfro #IDF #BeauteAfro`

---

## Après validation

Sauver le Workflow Runway (même template que TEST-01) → changer seulement photo salon + card.
