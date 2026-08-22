# Runway Workflows — pipelines Skedisy

**But :** ne plus refaire à la main *image → vidéo → edit → repeat*.  
Construire un **graphe de nœuds** une fois, le **sauver**, puis ne changer que les inputs (photo salon, style, zone…).

Runway Workflows = modèles reliés en pipeline pour des process créatifs **custom, automatisés, répétables**.

**Runway Agent** = chat qui **build / edit / run** ces Workflows pour toi → voir [`AGENT.md`](./AGENT.md).

---

## Workflow de base (salon × personnage)

```
SALON PHOTO          ← SALONS/<nom>/exterior/  (vraie photo)
      ↓
CHARACTER REFERENCE  ← CHARACTERS/Skedisy Girl|Boy/reference/
      ↓
SCENE GENERATION     ← Gen-4 image / scene (quartier + vitrine)
      ↓
VIDEO GENERATION     ← Gen-4 video / Act-Two si parole
      ↓
STYLE / COLOR        ← aligné SKEDISY BRAND/colours/
      ↓
FINAL CLIP           ← export → montage reel (+ UI réelle hors workflow)
```

**Prochaine vidéo :** autre photo salon → **même workflow**.

---

## Inputs fixes vs variables

| Nœud | Fixe (marque) | Variable (par vidéo) |
|------|---------------|----------------------|
| Salon photo | — | `SALONS/<salon>/exterior/` (+ interior) |
| Character | **Skedisy Girl** ou **Skedisy Boy** | look / coiffure (`variants/`, `HAIRSTYLES/`) |
| Scene | IDF, lumière naturelle, 9:16 | `LOCATIONS/<quartier>/` |
| Video | durée cible, pas d’UI fake | prompt action (marche, découverte, sortie) |
| Style / color | palette Skedisy | — |
| Final | claim outro | données app **hors** workflow (recording réel) |

---

## Ce qui reste **hors** du workflow IA

À brancher au montage (CapCut / Premiere / Edit Studio), pas généré dans le graphe :

1. Carte Paris → arrondissement (réelle)  
2. Card data (prix, ⭐, créneau) = **Skedisy**  
3. Screen recording → tap **RÉSERVER**  
4. Outro logo + *Trouve. Compare. Réserve.*

→ Voir `REELS/20s-knotless-18e/BRIEF.md` (shots 2, 4, 5, end).

---

## Workflows à créer dans Runway (noms suggérés)

| Nom Runway | Usage | Dossier local |
|------------|--------|---------------|
| `Skedisy · Girl · Salon Discover` | Shots découverte / extérieur | `salon-discover-girl/` |
| `Skedisy · Girl · Exit Styled` | Sortie salon + coiffure | `exit-styled-girl/` |
| `Skedisy · Boy · Barber` | Parcours homme / barber | `barber-boy/` |
| `Skedisy · Walk IDF` | Marche quartier (hook) | `walk-idf/` |

Créer chaque workflow **une fois** dans l’UI Runway → Save.  
Documenter l’ID / le lien dans le `NOTES.md` du sous-dossier ci-dessous.

---

## Structure locale

```
WORKFLOWS/
├── README.md                 ← ce fichier
├── salon-discover-girl/      ← mapping inputs + checklist
├── exit-styled-girl/
├── barber-boy/
└── walk-idf/
```

---

## Checklist avant de lancer un run

- [ ] Photo salon **réelle** déposée  
- [ ] Character = Girl **ou** Boy (référence Gen-4 branchée)  
- [ ] Hairstyle / location choisis  
- [ ] Workflow sauvé sélectionné (pas reconstruit from scratch)  
- [ ] Export → dossier `REELS/…/export/` ou montage  
- [ ] Data + UI app ajoutées au montage (vraies données Skedisy)

---

## Règle d’or

> Même pipeline. Autre salon. Même Skedisy Girl / Boy.  
> Zéro nouveau visage marque. Zéro UI inventée.
