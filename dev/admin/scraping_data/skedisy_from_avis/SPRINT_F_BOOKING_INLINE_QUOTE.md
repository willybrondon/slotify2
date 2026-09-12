# Sprint F — Convergence flow Réservation (devis inline)

**Statut :** implémenté (web public)

## Changements
- Un seul CTA **Réserver** (suppression « Obtenir un devis »)
- Services projet (S1+) : badge Devis → questions → devis accepté → pro → créneau (durée devis) → contact → paiement (acompte si besoin) → confirm + prep
- `?flow=devis` ouvre le tunnel classique
- `demandId` passé à `/api/public/booking/create`

## Fichiers
- `salonportal/public/salon-booking.js`
- `backend/controller/user/salon.controller.js`
- `backend/lib/webPageCopy.js`
- `salon/src/component/tables/demand/Demand.js` (copy panel)
