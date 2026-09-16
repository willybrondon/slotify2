# Sprint I — P0→P3 Service Engine (hors paiement, prep J-1)

**Statut :** livré (dev) · 2026-09-16  
**Prep reminders :** **J-1** (cron 24h existant enrichi), pas J-2.

## P0 — Service Engine
- Add-ons sélectionnables dans `computeQuote` (`answers.addons` + `addonDefs` / `detailCard.addons`)
- Seed Knotless : curly ends, human hair, takedown, lavage + materials
- Tunnel : checkboxes options → devis prix/durée
- Buffer `prepBufferMinutes` optionnel

## P1 — Prep + politiques
- Acceptation politique avant confirm (checkbox)
- Tolérance retard (`lateArrivalMinutes`) profil + fiche publique
- SMS J-1 : prep réelle + checklist soft (photo / confirmer prep)
- Checklist succès = `detailCard.prepMust/Avoid` (plus hardcodé seul)
- API `POST /api/public/client/prep-confirm`

## P2 — Beauty Profile + photos
- `user.beautyProfile` serveur
- Sync à la completion RDV
- `GET/PATCH /api/public/client/beauty-profile`
- Photos résultat + variance : `POST /salon/booking/result-photos`
- Rebook : `suggestedSlots` (3 créneaux)

## P3 — Prévu/réalisé + mèches + packages
- `plannedDurationMinutes` / `actualDurationMinutes` au checkout
- `materialsSnapshot` à la résa
- Insight durée dans Marketing
- Packages lite : `salon.servicePackages` + UI Marketing

## Hors scope (volontaire)
Paiement auto / Stripe / acompte encaissement — non touché dans ce sprint.
