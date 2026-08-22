# Skedisy Asset Library

Bibliothèque d’assets pour **Runway** et les réseaux sociaux (@skedisy / @skedisy.pro).  
À remplir **avant** de générer de nouvelles vidéos.

Référence marque : `dev/admin/scraping_data/authenticite/AUTHENTICITE_SKEDISY.md`

---

## Structure

```
reseaux_sociaux/
├── SKEDISY BRAND/          # Identité visuelle fixe
├── CHARACTERS/             # Personnages uniques marque (Gen-4 References)
│   ├── Skedisy Girl/       # Maya — cliente (référence verrouillée)
│   └── Skedisy Boy/        # Client homme / barber (référence à verrouiller)
├── LOCATIONS/              # Lieux / ambiances IDF
├── SALONS/                 # Un dossier par salon partenaire
├── HAIRSTYLES/             # Styles capillaires (référence visuelle)
├── APP UI RECORDINGS/      # Vrais écrans app (jamais d’UI générée en IA)
├── REELS/                  # Briefs storyboard (ex. reel 20 s)
├── WORKFLOWS/              # Pipelines Runway Workflows (répétables)
└── CONTENT AGENT/          # Spec automation cible (DB → post → analytics)
```

## Règles d’or (Runway)

1. **Deux personnages uniques** — **Skedisy Girl** et **Skedisy Boy** uniquement (pas de nouveau visage à chaque vidéo). Gen-4 References + Act-Two.  
2. **Vraies données Skedisy** — noms de salons, prix, notes, créneaux : toujours ceux de l’app / du back-office.  
3. **Pas d’UI Skedisy en IA** — screen recording dans `APP UI RECORDINGS/` ; Aleph seulement pour la transition cinéma.  
4. **Territoire IDF** — salons / quartiers réels.  
5. **Reel mixte** — Runway pour les personnages ; carte / data / UI = **réels** (`REELS/20s-knotless-18e/`).  
6. **Workflows** — sauver un pipeline Runway une fois ; changer seulement la photo salon / inputs (`WORKFLOWS/`).  
7. **Agent** — décrire le reel en chat ; Agent assemble / édite / run le Workflow (`WORKFLOWS/AGENT.md`).  
8. **Content Agent (cible)** — DB → Runway → approval humaine → publish → analytics (`CONTENT AGENT/`).  

---

## 1. SKEDISY BRAND

| Dossier | Contenu |
|---------|---------|
| `logo/` | Logo PNG/SVG, variants clair / sombre / icône app |
| `colours/` | Nuancier (hex) + exports swatches — noir `#000`, accents app `#6F42E5` / `#E96E14` |
| `fonts/` | Polices marque (fichiers + usage titres / body) |
| `CTA/` | Visuels boutons / textes : « Réserver sur l’app », « Lien en bio », claim salon |
| `intro/` | 2–3 s d’intro standard (logo + signature) |
| `outro/` | Fin de vidéo + CTA app / fiche salon |

**Règle :** Instagram pour découvrir, **Skedisy app** pour réserver.

---

## 2. CHARACTERS (uniques marque)

| Dossier | Usage |
|---------|--------|
| **`Skedisy Girl/`** | Maya — seule cliente femme récurrente |
| **`Skedisy Boy/`** | Seul client homme / barber récurrent |
| `Hairstylist 01` / `02` | Optionnel — coiffeuses partenaires (pas le visage marque) |

`Woman 01` / `Man 01` = alias legacy → redirigent vers Girl / Boy.  
Dans chaque dossier marque : `reference/` + `NOTES.md`.

---

## 3. LOCATIONS

Ambiances **Île-de-France** (pas « toute la France » / DOM).

Exemples déjà créés : Paris, Paris 18, Saint-Denis, Montreuil, Créteil, Épinay-sur-Seine, Aubervilliers, Bondy, Château Rouge.

Contenu type : rue, métro, vitrine quartier, lumière du jour / soir.

---

## 4. SALONS

Un dossier **par salon** (copier `_TEMPLATE`) :

```
SALONS/
├── _TEMPLATE/
│   ├── logo/
│   ├── exterior/
│   ├── interior/
│   ├── stylist/
│   ├── service photos/
│   └── hairstyle photos/
└── Mars/          ← exemple : renommer / dupliquer le template
```

Nommer les dossiers salon clairement : `Mars-Paris`, `NappyLocks-Paris17`, etc.

---

## 5. HAIRSTYLES

Références visuelles pour prompts Runway / tournage.

| Dossier | Notes |
|---------|--------|
| `knotless` | Knotless braids |
| `boho braids` | Boho / goddess |
| `Fulani` | Fulani braids |
| `locs` | Locks / faux locs |
| `twists` | Twists / passion twists |
| `box braids` | Box braids |
| `cornrows` | Nattes collées |
| `tissage` | Tissages |
| `vanilles` | Vanilles / twists |
| `perruques` | Wigs / lace |
| `barber` | Coupes homme |

---

## 6. REELS (storyboards)

**Test #1 (commencer ici) :** `REELS/TEST-01-coiffeuse-18e/`  
→ Hook *Tu cherches une coiffeuse dans le 18e ?* · salon **For Eve Hair** (vrai) · steps Runway dans `RUNWAY_STEPS.md`

Template knotless générique : `REELS/20s-knotless-18e/BRIEF.md`

| Shot | Source |
|------|--------|
| 1 Skedisy Girl marche Paris + hook | Runway |
| 2 Carte Paris → 18e | Réel |
| 3 Skedisy Girl découvre le salon | Runway + photo salon réelle |
| 4 Nom · service · prix · ⭐ · créneau | **Vraies données Skedisy** |
| 5 Tap RÉSERVER | Screen recording app |
| 6 Skedisy Girl sort coiffée + outro | Runway + brand |

Claim final : **SKEDISY** — *Trouve. Compare. Réserve.*

---

## 7. WORKFLOWS (Runway)

Pipelines répétables : `WORKFLOWS/README.md`

```
Salon photo → Character ref → Scene → Video → Style/Color → Final clip
```

Sauver une fois dans Runway ; la fois suivante = **autre photo salon**, même graphe.  
UI / data / carte restent **hors** workflow (montage réel).

| Pipeline local | Shots reel |
|----------------|------------|
| `walk-idf/` | Shot 1 |
| `salon-discover-girl/` | Shot 3 |
| `exit-styled-girl/` | Shot 6 |
| `barber-boy/` | Variante Boy |

**Runway Agent** (chat) : décrit le process → propose / édite / lance le Workflow.  
Prompt type + contraintes Skedisy : `WORKFLOWS/AGENT.md`.

---

## 8. CONTENT AGENT (automation cible)

Spec complète : `CONTENT AGENT/ARCHITECTURE.md`

```
DB Skedisy → Content Agent → data salon + trends → script → storyboard
→ Runway Workflow → final video → caption → HUMAN APPROVAL
→ IG/TikTok → analytics → « what worked? » → Agent
```

Phase 0 = lib assets manuelle (aujourd’hui). Build logiciel = plus tard.

---

## Process Runway (recommandé)

1. Remplir **SKEDISY BRAND** (logo + CTA + intro/outro)
2. Verrouiller **Skedisy Girl** / **Skedisy Boy** (références Gen-4)
3. Ajouter **1 LOCATION** + **1 SALON** réel + **1 HAIRSTYLE** + **données app réelles**
4. Enregistrer le parcours app dans **APP UI RECORDINGS**
5. Demander à **Agent** de monter / relancer le Workflow (`AGENT.md`) — ou lancer un Workflow déjà sauvé
6. Suivre le brief **REELS/20s-…** (mix clips workflow + réel)
7. Exporter → montage → publier @skedisy

**KPI :** clics bio / installs / RDV — pas seulement les likes.

---

## Fichiers acceptés

- Images : `.png`, `.jpg`, `.webp` (idéalement 1024px+)
- Vidéo courte intro/outro : `.mp4`
- Ne pas committer de contenus clients **sans accord** écrit
