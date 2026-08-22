# APP UI RECORDINGS — Vrais écrans Skedisy

**Ne jamais générer l’interface Skedisy avec l’IA.**  
L’IA est mauvaise sur l’UI (prix, lieux, boutons faux).  
On **filme l’app réelle**, puis on intègre le clip dans la vidéo Runway.

## Workflow

1. Sur téléphone ou émulateur, enregistre un parcours réel, ex. :
   - Search → **Paris 18** → **Knotless** → **€70** → **Samedi 14:00** → **Book**
2. Dépose le fichier ici (`YYYY-MM-DD-parcours-court.mp4`)
3. Dans Runway Edit Studio / Aleph : transition cinéma vers le téléphone  
   → l’**info à l’écran reste réelle** (prix, créneau, salon)

## Structure

```
APP UI RECORDINGS/
├── README.md
├── customer-app/       # App cliente Skedisy
│   ├── search/
│   ├── booking/
│   └── wallet/
├── expert-app/         # Skedisy XP (optionnel)
└── web/                # skedisy.com / fiche salon (optionnel)
```

## Conseils capture

- Format **9:16** ou crop en montage  
- Durée courte : 5–15 s pour un hook  
- Désactiver notifications pendant l’enregistrement  
- Utiliser des **vrais salons / vrais prix** IDF  

## Intégration Runway

| Étape | Outil |
|-------|--------|
| Skedisy Girl / Boy cohérent | Gen-4 **References** + `CHARACTERS/Skedisy Girl|Boy/reference/` |
| Personnage qui parle / bouge | **Act-Two** + vidéo dans `…/act-two/` |
| Transition vers le téléphone | Edit Studio / **Aleph** |
| Contenu de l’écran | **Ce dossier uniquement** (recording réel) |
