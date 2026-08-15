# Skedisy SalonPortal

Site public Skedisy (marketing, fiches salon, docs, blog).  
Structure alignée sur `dev/admin/salon` : sources dans `src/`, sortie dans `public/`.

## Structure

```
salonportal/
├── package.json
├── scripts/
│   ├── build.js
│   └── clean-root.js
├── src/                      ← éditer ici
│   ├── pages/
│   ├── styles/
│   ├── js/
│   ├── components/
│   ├── assets/
│   └── docs/
└── public/                   ← généré (servi par Express)
```

Pas de copies `docs/`, `cookies/`, etc. à la racine : uniquement dans `src/` puis `public/`.

## Commandes

```bash
cd dev/admin/salonportal
npm run build       # src → public
npm start           # http://localhost:3001
npm run clean:root  # supprimer d’anciens fichiers plats à la racine
```

## Déploiement

Le backend sert `salonportal/public` (ou `backend/salonportal` après install, rempli depuis `public/`).
