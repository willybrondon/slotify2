# Runway Agent — assistant créatif Skedisy

**Rôle :** Agent construit, édite et **lance** des Workflows depuis le chat.  
Tu décris le process → Agent propose le graphe → tu lances ou tu modifies.

Pas besoin de configurer chaque génération à la main.

Runway positionne Agent pour : **planifier, générer, éditer, scaler** des projets créatifs, et **choisir les modèles** selon la tâche.

---

## Quand l’utiliser

| Situation | Action |
|-----------|--------|
| Nouveau type de reel | Décrire le brief → Agent propose un Workflow |
| Même format, autre salon | Relancer avec nouvelle photo + **vraies** data |
| Ajuster le graphe | Demander à Agent d’éditer le Workflow (nœuds, durée, style) |
| Scale | Dupliquer le Workflow sauvé pour N salons |

Complète (ne remplace pas) : personnages verrouillés, data Skedisy, UI recording réelle.

---

## Prompt type (à coller / adapter)

```
Create a 20-second vertical Instagram Reel for Skedisy using this salon photo
and these real salon details. The video should have a premium French beauty
aesthetic. Use our Skedisy character Maya (Skedisy Girl — use the attached
character reference). Create 4 scenes and finish with the Skedisy logo.

Constraints:
- Vertical 9:16 only
- Do NOT generate fake Skedisy app UI — we will insert a real screen recording later
- Do NOT invent prices, ratings, or slots — use only the salon details I provide
- Keep Maya’s face consistent with the character reference (Gen-4 References)
- Île-de-France / Paris neighborhood feel, authentic, not stock-global
- Scenes: (1) walk/hook (2) discover salon exterior from photo (3) styled exit (4) logo outro
- After you propose the Workflow, save it so we can reuse it with a different salon photo next time
```

### Joindre à Agent

1. Photo salon → `SALONS/<salon>/exterior/`  
2. Réf. personnage → `CHARACTERS/Skedisy Girl/reference/maya-ref-01.png`  
3. Détails **réels** (copier depuis Skedisy) : nom, service, prix, note, créneau, quartier  
4. Logo → `SKEDISY BRAND/logo/`  

---

## Variante Skedisy Boy

Même prompt en remplaçant Maya / Skedisy Girl par **Skedisy Boy** + `CHARACTERS/Skedisy Boy/reference/` + hairstyle `barber` si besoin.

---

## Après la réponse d’Agent

1. Vérifier le Workflow proposé (nœuds ≈ `WORKFLOWS/README.md`)  
2. Sauver le Workflow dans Runway + coller URL dans `WORKFLOWS/<nom>/NOTES.md`  
3. Lancer la génération des clips IA  
4. Au montage : carte réelle + data card + recording **RÉSERVER** + claim *Trouve. Compare. Réserve.*  

---

## Ce qu’Agent ne doit pas inventer

- Interface Skedisy (boutons, prix à l’écran)  
- Stats / notes / créneaux hors app  
- Un nouveau visage « cliente » à la place de Skedisy Girl / Boy  
- Territoire hors IDF  

---

## Lien avec le reste de la lib

| Élément | Dossier |
|---------|---------|
| Pipeline nœuds | `WORKFLOWS/` |
| Storyboard 20 s | `REELS/20s-knotless-18e/` |
| Personnages | `CHARACTERS/Skedisy Girl\|Boy/` |
| UI réelle | `APP UI RECORDINGS/` |
| Automation cible (DB → analytics) | `CONTENT AGENT/ARCHITECTURE.md` |
